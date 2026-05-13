// ─── Types ────────────────────────────────────────────────────────────────────

export type CityCategory = "X" | "Y" | "Z";
export type TACityType = "higher_tpta" | "other" | "higher_tpta_pwd" | "other_pwd" | "govt_vehicle";
export type PensionType = "nps" | "ops";
export type TaxRegime = "new" | "old";

export interface CalculatorInputs {
  payLevel: string;       // "1".."12","13","13A","14".."18"
  basicPay: number;       // actual cell value from 7th CPC matrix
  cityCategory: CityCategory;
  hraPercent8CPC: number; // user-selected expected HRA% for 8th CPC (e.g. 24 for X)
  currentDA: number;      // default 60
  taCity: TACityType;
  fitmentFactor: number;
  pensionType: PensionType;
  isCGHSBeneficiary: boolean;
  taxRegime: TaxRegime;
}

export interface DeductionBreakup {
  nps: number;
  cgegis: number;
  cghs: number;
  incomeTax: number;
  total: number;
}

export interface SalaryBreakup {
  basicPay: number;
  daPercent: number;
  daAmount: number;
  hraRate: number;
  hraAmount: number;
  taBase: number;
  taDA: number;
  taAmount: number;
  grossPay: number;
  deductions: DeductionBreakup;
  netPay: number;
}

export interface SalaryComparison {
  before: SalaryBreakup;
  after: SalaryBreakup;
  netIncrease: number;        // gross-to-gross
  netPayIncrease: number;     // net-to-net
  percentIncrease: number;
  minimumPensionBefore: number;
  minimumPensionAfter: number;
}

// ─── Pay Matrix ───────────────────────────────────────────────────────────────

/** Round to nearest 100 */
const r100 = (n: number) => Math.round(n / 100) * 100;

function generateCells(entryPay: number, count: number): number[] {
  const cells: number[] = [entryPay];
  for (let i = 1; i < count; i++) {
    cells.push(r100(cells[cells.length - 1] * 1.03));
  }
  return cells;
}

export interface PayLevelRow {
  level: string;
  entryPay: number;
  gradePay: string;
  cells: number[];
}

export const PAY_MATRIX_DATA: PayLevelRow[] = [
  { level: "1",   entryPay: 18000,  gradePay: "1800", cells: generateCells(18000,  40) },
  { level: "2",   entryPay: 19900,  gradePay: "1900", cells: generateCells(19900,  40) },
  { level: "3",   entryPay: 21700,  gradePay: "2000", cells: generateCells(21700,  40) },
  { level: "4",   entryPay: 25500,  gradePay: "2400", cells: generateCells(25500,  40) },
  { level: "5",   entryPay: 29200,  gradePay: "2800", cells: generateCells(29200,  40) },
  { level: "6",   entryPay: 35400,  gradePay: "4200", cells: generateCells(35400,  40) },
  { level: "7",   entryPay: 44900,  gradePay: "4600", cells: generateCells(44900,  40) },
  { level: "8",   entryPay: 47600,  gradePay: "4800", cells: generateCells(47600,  40) },
  { level: "9",   entryPay: 53100,  gradePay: "5400", cells: generateCells(53100,  40) },
  { level: "10",  entryPay: 56100,  gradePay: "5400", cells: generateCells(56100,  40) },
  { level: "11",  entryPay: 67700,  gradePay: "6600", cells: generateCells(67700,  40) },
  { level: "12",  entryPay: 78800,  gradePay: "7600", cells: generateCells(78800,  40) },
  { level: "13",  entryPay: 118500, gradePay: "8700", cells: generateCells(118500, 18) },
  { level: "13A", entryPay: 131100, gradePay: "8900", cells: generateCells(131100,  9) },
  { level: "14",  entryPay: 144200, gradePay: "—",    cells: generateCells(144200, 14) },
  { level: "15",  entryPay: 182200, gradePay: "—",    cells: generateCells(182200,  7) },
  { level: "16",  entryPay: 205400, gradePay: "—",    cells: generateCells(205400,  3) },
  { level: "17",  entryPay: 225000, gradePay: "—",    cells: [225000] },
  { level: "18",  entryPay: 250000, gradePay: "—",    cells: [250000] },
];

export function getLevelRow(level: string): PayLevelRow | undefined {
  return PAY_MATRIX_DATA.find((r) => r.level === level);
}

export function getLevelNum(level: string): number {
  if (level === "13A") return 13.5;
  return Number(level);
}

// ─── HRA Options ─────────────────────────────────────────────────────────────

export const HRA_OPTIONS: Record<CityCategory, number[]> = {
  X: [24, 27, 30],
  Y: [16, 18, 20],
  Z: [8, 9, 10],
};

/** Current 7th CPC HRA rate based on DA (auto) */
export function current7thHRARate(city: CityCategory, da: number): number {
  if (da >= 50) return city === "X" ? 0.30 : city === "Y" ? 0.20 : 0.10;
  if (da >= 25) return city === "X" ? 0.27 : city === "Y" ? 0.18 : 0.09;
  return city === "X" ? 0.24 : city === "Y" ? 0.16 : 0.08;
}

// ─── TA Calculation ───────────────────────────────────────────────────────────

/**
 * 7th CPC TA base (before DA component):
 * Level 9+      → Higher TPTA: 7200, Other: 3600
 * Level 3-8     → Higher TPTA: 3600, Other: 1800
 * Level 1-2     → Basic ≥ 24200: Higher TPTA: 3600, Other: 1800
 *                  Basic < 24200: Higher TPTA: 1350, Other: 900
 * PWD: 2× the base
 */
export function getBaseTA(
  levelStr: string,
  basicPay: number,
  taCity: TACityType
): number {
  // Govt vehicle: no TA allowed
  if (taCity === "govt_vehicle") return 0;

  const levelNum = getLevelNum(levelStr);
  const isHigher = taCity === "higher_tpta" || taCity === "higher_tpta_pwd";
  const isPWD = taCity === "higher_tpta_pwd" || taCity === "other_pwd";

  let base: number;
  if (levelNum >= 9) {
    base = isHigher ? 7200 : 3600;
  } else if (levelNum >= 3) {
    base = isHigher ? 3600 : 1800;
  } else {
    // Level 1-2
    if (basicPay >= 24200) {
      base = isHigher ? 3600 : 1800;
    } else {
      base = isHigher ? 1350 : 900;
    }
  }

  return isPWD ? base * 2 : base;
}

// ─── CGEGIS ──────────────────────────────────────────────────────────────────

export function getCGEGIS(levelStr: string): number {
  const n = getLevelNum(levelStr);
  if (n <= 5) return 30;
  if (n <= 9) return 60;
  return 120; // Level 10-18
}

// ─── CGHS ────────────────────────────────────────────────────────────────────

export function getCGHS(levelStr: string): number {
  const n = getLevelNum(levelStr);
  if (n <= 5) return 250;
  if (n <= 8) return 450;
  if (n <= 12) return 650;
  return 1000;
}

// ─── Income Tax (Monthly Estimate) ───────────────────────────────────────────

function applySlabs(
  income: number,
  slabs: Array<[number, number]> // [threshold, rate]
): number {
  let tax = 0;
  let prev = 0;
  for (const [threshold, rate] of slabs) {
    if (income <= threshold) {
      tax += (income - prev) * rate;
      return tax;
    }
    tax += (threshold - prev) * rate;
    prev = threshold;
  }
  tax += (income - prev) * slabs[slabs.length - 1][1];
  return tax;
}

export function estimateMonthlyTax(
  annualGross: number,
  pensionType: PensionType,
  basicPay: number,
  daAmount: number,
  taxRegime: TaxRegime
): number {
  if (taxRegime === "new") {
    const stdDed = 75000;
    const taxable = Math.max(0, annualGross - stdDed);
    if (taxable <= 1200000) return 0; // Rebate 87A up to 12L
    const slabs: Array<[number, number]> = [
      [400000, 0],
      [800000, 0.05],
      [1200000, 0.10],
      [1600000, 0.15],
      [2000000, 0.20],
      [2400000, 0.25],
    ];
    const taxAmt = applySlabs(taxable, [...slabs, [Infinity, 0.30] as [number, number]]);
    const cess = taxAmt * 0.04;
    return Math.round((taxAmt + cess) / 12);
  } else {
    // Old regime
    const stdDed = 50000;
    const nps80C = pensionType === "nps" ? 150000 : 0;
    const nps80CCD = pensionType === "nps" ? Math.min(50000, (basicPay + daAmount) * 12 * 0.10) : 0;
    const taxable = Math.max(0, annualGross - stdDed - nps80C - nps80CCD);
    if (taxable <= 500000) return 0; // Rebate 87A up to 5L
    const slabs: Array<[number, number]> = [
      [250000, 0],
      [500000, 0.05],
      [1000000, 0.20],
    ];
    const taxAmt = applySlabs(taxable, [...slabs, [Infinity, 0.30] as [number, number]]);
    const cess = taxAmt * 0.04;
    return Math.round((taxAmt + cess) / 12);
  }
}

// ─── Main Calculator ──────────────────────────────────────────────────────────

export function calculateSalary(inputs: CalculatorInputs): SalaryComparison {
  const {
    payLevel,
    basicPay,
    cityCategory,
    hraPercent8CPC,
    currentDA,
    taCity,
    fitmentFactor,
    pensionType,
    isCGHSBeneficiary,
    taxRegime,
  } = inputs;

  // ── 7th CPC (Before) ────────────────────────────────────────────────────────
  const beforeDA = (basicPay * currentDA) / 100;
  const beforeHRARate = current7thHRARate(cityCategory, currentDA);
  const beforeHRA = basicPay * beforeHRARate;
  const beforeTABase = getBaseTA(payLevel, basicPay, taCity);
  const beforeTADA = (beforeTABase * currentDA) / 100;
  const beforeTA = beforeTABase + beforeTADA;
  const beforeGross = basicPay + beforeDA + beforeHRA + beforeTA;

  // Deductions (before)
  const beforeNPS = pensionType === "nps" ? Math.round((basicPay + beforeDA) * 0.10) : 0;
  const beforeCGEGIS = getCGEGIS(payLevel);
  const beforeCGHS = isCGHSBeneficiary ? getCGHS(payLevel) : 0;
  const beforeTax = estimateMonthlyTax(beforeGross * 12, pensionType, basicPay, beforeDA, taxRegime);
  const beforeTotalDed = beforeNPS + beforeCGEGIS + beforeCGHS + beforeTax;
  const beforeNet = beforeGross - beforeTotalDed;

  // ── 8th CPC (After) ──────────────────────────────────────────────────────────
  const afterBasic = r100(basicPay * fitmentFactor);
  const afterDA = 0;
  const afterHRARate = hraPercent8CPC / 100;
  const afterHRA = Math.round(afterBasic * afterHRARate);
  // TA: DA resets, so base TA only
  const afterTABase = getBaseTA(payLevel, afterBasic, taCity);
  const afterTA = afterTABase; // no DA component initially
  const afterGross = afterBasic + afterDA + afterHRA + afterTA;

  // Deductions (after)
  const afterNPS = pensionType === "nps" ? Math.round(afterBasic * 0.10) : 0; // DA=0
  const afterCGEGIS = beforeCGEGIS; // Same until revised
  const afterCGHS = isCGHSBeneficiary ? getCGHS(payLevel) : 0;
  const afterTax = estimateMonthlyTax(afterGross * 12, pensionType, afterBasic, 0, taxRegime);
  const afterTotalDed = afterNPS + afterCGEGIS + afterCGHS + afterTax;
  const afterNet = afterGross - afterTotalDed;

  return {
    before: {
      basicPay,
      daPercent: currentDA,
      daAmount: beforeDA,
      hraRate: beforeHRARate,
      hraAmount: beforeHRA,
      taBase: beforeTABase,
      taDA: beforeTADA,
      taAmount: beforeTA,
      grossPay: beforeGross,
      deductions: {
        nps: beforeNPS,
        cgegis: beforeCGEGIS,
        cghs: beforeCGHS,
        incomeTax: beforeTax,
        total: beforeTotalDed,
      },
      netPay: beforeNet,
    },
    after: {
      basicPay: afterBasic,
      daPercent: 0,
      daAmount: 0,
      hraRate: afterHRARate,
      hraAmount: afterHRA,
      taBase: afterTABase,
      taDA: 0,
      taAmount: afterTA,
      grossPay: afterGross,
      deductions: {
        nps: afterNPS,
        cgegis: afterCGEGIS,
        cghs: afterCGHS,
        incomeTax: afterTax,
        total: afterTotalDed,
      },
      netPay: afterNet,
    },
    netIncrease: afterGross - beforeGross,
    netPayIncrease: afterNet - beforeNet,
    percentIncrease: ((afterGross - beforeGross) / beforeGross) * 100,
    minimumPensionBefore: 9000,
    minimumPensionAfter: r100(9000 * fitmentFactor),
  };
}

// ─── Fitment Factor Stops ────────────────────────────────────────────────────

export interface FitmentStop {
  value: number;
  label: string;
  description: string;
}

export const FITMENT_STOPS: FitmentStop[] = [
  { value: 1.92, label: "1.92×", description: "Conservative" },
  { value: 2.28, label: "2.28×", description: "Analyst estimate" },
  { value: 2.57, label: "2.57×", description: "Baseline (7th CPC pattern)" },
  { value: 2.86, label: "2.86×", description: "Optimistic" },
  { value: 3.00, label: "3.00×", description: "NC-JCM minimum demand" },
  { value: 3.68, label: "3.68×", description: "Higher union demand" },
  { value: 3.83, label: "3.83×", description: "Maximum union demand" },
];

export const FITMENT_MIN = 1.80;
export const FITMENT_MAX = 4.00;

// ─── Arrears ─────────────────────────────────────────────────────────────────

export function calculateArrears(
  inputs: CalculatorInputs & { implementationDate: Date; startDate: Date }
) {
  const comp = calculateSalary(inputs);
  const months =
    (inputs.implementationDate.getFullYear() - inputs.startDate.getFullYear()) * 12 +
    (inputs.implementationDate.getMonth() - inputs.startDate.getMonth());
  if (months <= 0) return { totalArrears: 0, months: 0, monthlyArrears: 0 };
  const monthlyArrears = comp.after.grossPay - comp.before.grossPay;
  return { monthlyArrears, months, totalArrears: monthlyArrears * months };
}

// ─── Pay Matrix projection ────────────────────────────────────────────────────

export function getProjectedPayMatrix(fitmentFactor: number) {
  return PAY_MATRIX_DATA.map((row) => ({
    ...row,
    projectedPay: r100(row.entryPay * fitmentFactor),
  }));
}

export const CITY_CATEGORIES = [
  { value: "X" as CityCategory, label: "X", description: "Metro Cities" },
  { value: "Y" as CityCategory, label: "Y", description: "Major Cities" },
  { value: "Z" as CityCategory, label: "Z", description: "Other Towns/Rural" },
];

export const TA_CITY_OPTIONS = [
  { value: "higher_tpta" as TACityType,     label: "Higher TPTA Cities",       description: "Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata, Ahmedabad, Pune" },
  { value: "other" as TACityType,           label: "Other Cities",             description: "All cities not listed under Higher TPTA" },
  { value: "higher_tpta_pwd" as TACityType, label: "Higher TPTA Cities (PWD)", description: "Persons with Disability — 2× TA (Higher TPTA)" },
  { value: "other_pwd" as TACityType,       label: "Other Cities (PWD)",       description: "Persons with Disability — 2× TA (Other Cities)" },
  { value: "govt_vehicle" as TACityType,    label: "Govt. Vehicle Provided",   description: "No Transport Allowance applicable — TA = ₹0" },
];
