import { z } from "zod";

export const FITMENT_FACTORS = [
  { value: 1.92, label: "1.92×", description: "Conservative" },
  { value: 2.57, label: "2.57×", description: "Baseline (Most Likely)" },
  { value: 2.86, label: "2.86×", description: "Optimistic (Union Demand)" },
  { value: 3.83, label: "3.83×", description: "Maximum Union Demand" },
];

export const CITY_CATEGORIES = [
  { value: "X", label: "X", description: "Metro Cities" },
  { value: "Y", label: "Y", description: "Major Cities" },
  { value: "Z", label: "Z", description: "Other Towns/Rural" },
];

export type CityCategory = "X" | "Y" | "Z";

export interface CalculatorInputs {
  basicPay: number;
  payLevel: number;
  fitmentFactor: number;
  cityCategory: CityCategory;
  currentDA: number; // percentage, default 60
}

export interface SalaryBreakup {
  basicPay: number;
  daPercent: number;
  daAmount: number;
  hraRate: number;
  hraAmount: number;
  taAmount: number;
  grossPay: number;
}

export interface SalaryComparison {
  before: SalaryBreakup;
  after: SalaryBreakup;
  netIncrease: number;
  percentIncrease: number;
  minimumPensionBefore: number;
  minimumPensionAfter: number;
}

const nearest100 = (num: number) => Math.round(num / 100) * 100;

export function calculate7thCPCHRA(city: CityCategory, da: number): number {
  if (da >= 50) {
    return city === "X" ? 0.30 : city === "Y" ? 0.20 : 0.10;
  }
  if (da >= 25) {
    return city === "X" ? 0.27 : city === "Y" ? 0.18 : 0.09;
  }
  return city === "X" ? 0.24 : city === "Y" ? 0.16 : 0.08;
}

export function calculateBaseHRA(city: CityCategory): number {
  return city === "X" ? 0.24 : city === "Y" ? 0.16 : 0.08;
}

export function calculateBaseTA(level: number, city: CityCategory): number {
  if (level >= 9) {
    return city === "X" ? 7200 : 3600;
  }
  return city === "X" ? 1350 : 900;
}

export function calculateSalary(inputs: CalculatorInputs): SalaryComparison {
  const { basicPay, payLevel, fitmentFactor, cityCategory, currentDA } = inputs;

  // 7th CPC Calculation
  const beforeDAAmount = (basicPay * currentDA) / 100;
  const beforeHRARate = calculate7thCPCHRA(cityCategory, currentDA);
  const beforeHRAAmount = basicPay * beforeHRARate;
  const beforeBaseTA = calculateBaseTA(payLevel, cityCategory);
  const beforeTAAmount = beforeBaseTA + (beforeBaseTA * currentDA / 100);
  const beforeGross = basicPay + beforeDAAmount + beforeHRAAmount + beforeTAAmount;

  // 8th CPC Calculation
  const afterBasicPay = nearest100(basicPay * fitmentFactor);
  const afterDAAmount = 0; // resets
  const afterHRARate = calculateBaseHRA(cityCategory);
  const afterHRAAmount = afterBasicPay * afterHRARate;
  const afterTAAmount = calculateBaseTA(payLevel, cityCategory);
  const afterGross = afterBasicPay + afterDAAmount + afterHRAAmount + afterTAAmount;

  return {
    before: {
      basicPay,
      daPercent: currentDA,
      daAmount: beforeDAAmount,
      hraRate: beforeHRARate,
      hraAmount: beforeHRAAmount,
      taAmount: beforeTAAmount,
      grossPay: beforeGross,
    },
    after: {
      basicPay: afterBasicPay,
      daPercent: 0,
      daAmount: afterDAAmount,
      hraRate: afterHRARate,
      hraAmount: afterHRAAmount,
      taAmount: afterTAAmount,
      grossPay: afterGross,
    },
    netIncrease: afterGross - beforeGross,
    percentIncrease: ((afterGross - beforeGross) / beforeGross) * 100,
    minimumPensionBefore: 9000,
    minimumPensionAfter: nearest100(9000 * fitmentFactor),
  };
}

// Pay matrix data (Entry basic pay per level)
export const PAY_MATRIX_DATA = [
  { level: 1, entryPay: 18000, gradePay: "1800", postCategory: "MTS, Peon, Group D" },
  { level: 2, entryPay: 19900, gradePay: "1900", postCategory: "Lower Division Clerk (LDC)" },
  { level: 3, entryPay: 21700, gradePay: "2000", postCategory: "Skilled Worker" },
  { level: 4, entryPay: 25500, gradePay: "2400", postCategory: "Upper Division Clerk (UDC)" },
  { level: 5, entryPay: 29200, gradePay: "2800", postCategory: "Senior Clerk, Sr. Technician" },
  { level: 6, entryPay: 35400, gradePay: "4200", postCategory: "Inspector, Asst. Section Officer" },
  { level: 7, entryPay: 44900, gradePay: "4600", postCategory: "Junior Time Scale (Group A)" },
  { level: 8, entryPay: 47600, gradePay: "4800", postCategory: "Senior Time Scale" },
  { level: 9, entryPay: 53100, gradePay: "5400", postCategory: "Junior Administrative Grade" },
  { level: 10, entryPay: 56100, gradePay: "5400", postCategory: "Selection Grade" },
  { level: 11, entryPay: 67700, gradePay: "6600", postCategory: "Senior Administrative Grade" },
  { level: 12, entryPay: 78800, gradePay: "7600", postCategory: "Joint Secretary Level" },
  { level: 13, entryPay: 118500, gradePay: "8700", postCategory: "Additional Secretary Level" },
  { level: "13A", entryPay: 131100, gradePay: "8900", postCategory: "HAG (Higher Administrative Grade)" },
  { level: 14, entryPay: 144200, gradePay: "—", postCategory: "Secretary to Govt of India" },
  { level: 15, entryPay: 182200, gradePay: "—", postCategory: "Chief Secretary equivalent" },
  { level: 16, entryPay: 205400, gradePay: "—", postCategory: "Apex Scale" },
  { level: 17, entryPay: 225000, gradePay: "—", postCategory: "Cabinet Secretary equivalent" },
  { level: 18, entryPay: 250000, gradePay: "—", postCategory: "Cabinet Secretary (Fixed)" },
];

export function getProjectedPayMatrix(fitmentFactor: number) {
  return PAY_MATRIX_DATA.map(row => ({
    ...row,
    projectedPay: nearest100(row.entryPay * fitmentFactor)
  }));
}

export function calculateArrears(inputs: CalculatorInputs & { implementationDate: Date, startDate: Date }) {
  const comp = calculateSalary(inputs);
  
  // Calculate full months difference
  const months = (inputs.implementationDate.getFullYear() - inputs.startDate.getFullYear()) * 12 + 
                 (inputs.implementationDate.getMonth() - inputs.startDate.getMonth());
                 
  if (months <= 0) return { totalArrears: 0, months: 0, monthlyArrears: 0 };
  
  const monthlyArrears = comp.after.grossPay - comp.before.grossPay;
  
  return {
    monthlyArrears,
    months,
    totalArrears: monthlyArrears * months
  };
}
