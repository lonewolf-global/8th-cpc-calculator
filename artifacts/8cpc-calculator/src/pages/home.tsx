import { useState, useEffect } from "react";
import { useCalculatorStore } from "@/hooks/use-calculator-store";
import { useAnimatedValue } from "@/hooks/use-animated-value";
import {
  calculateSalary,
  FITMENT_STOPS,
  FITMENT_MIN,
  FITMENT_MAX,
  CITY_CATEGORIES,
  TA_CITY_OPTIONS,
  HRA_OPTIONS,
  PAY_MATRIX_DATA,
  getLevelRow,
} from "@/lib/calculator";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee, TrendingUp, Printer, ChevronRight, Info, ShieldCheck, Building2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

function InfoTip({ text }: { text: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help inline-block ml-1 shrink-0" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-xs">{text}</TooltipContent>
    </Tooltip>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 mt-5 first:mt-0">
      {children}
    </p>
  );
}

function RowItem({ label, value, sub, highlight }: {
  label: string; value: string; sub?: string; highlight?: boolean;
}) {
  return (
    <div className={`flex justify-between items-center py-2 ${highlight ? "border-t mt-1 pt-3" : "border-b border-border/40 last:border-0"}`}>
      <span className={`text-sm ${highlight ? "font-bold text-base" : "text-muted-foreground"}`}>
        {label}{sub && <span className="text-xs ml-1 opacity-60">{sub}</span>}
      </span>
      <span className={`font-medium tabular-nums ${highlight ? "font-bold text-base" : ""}`}>{value}</span>
    </div>
  );
}

export default function Home() {
  const { inputs, updateInput } = useCalculatorStore();
  const [sliderValue, setSliderValue] = useState<number[]>([inputs.fitmentFactor]);

  const levelRow = getLevelRow(inputs.payLevel);
  const cells = levelRow?.cells ?? [];

  // When pay level changes, reset basic pay to entry pay for that level
  const handleLevelChange = (level: string) => {
    const row = getLevelRow(level);
    updateInput("payLevel", level);
    if (row) updateInput("basicPay", row.entryPay);
    // Also reset HRA to base rate of current city category
    const hraOpts = HRA_OPTIONS[inputs.cityCategory];
    updateInput("hraPercent8CPC", hraOpts[0]);
  };

  // When city changes, reset HRA % to base
  const handleCityChange = (city: typeof inputs.cityCategory) => {
    updateInput("cityCategory", city);
    updateInput("hraPercent8CPC", HRA_OPTIONS[city][0]);
  };

  const hraOpts = HRA_OPTIONS[inputs.cityCategory];

  // Sync slider with fitment factor
  useEffect(() => {
    setSliderValue([inputs.fitmentFactor]);
  }, [inputs.fitmentFactor]);

  const handleSliderChange = (val: number[]) => {
    setSliderValue(val);
    updateInput("fitmentFactor", parseFloat(val[0].toFixed(2)));
  };

  const snapToStop = () => {
    const current = sliderValue[0];
    const nearest = FITMENT_STOPS.reduce((prev, cur) =>
      Math.abs(cur.value - current) < Math.abs(prev.value - current) ? cur : prev
    );
    updateInput("fitmentFactor", nearest.value);
    setSliderValue([nearest.value]);
  };

  const nearestStop = FITMENT_STOPS.reduce((prev, cur) =>
    Math.abs(cur.value - inputs.fitmentFactor) < Math.abs(prev.value - inputs.fitmentFactor) ? cur : prev
  );

  const comparison = calculateSalary(inputs);

  const animBeforeNet = useAnimatedValue(comparison.before.netPay);
  const animAfterNet  = useAnimatedValue(comparison.after.netPay);
  const animNetInc    = useAnimatedValue(comparison.netIncrease);
  const animNetPayInc = useAnimatedValue(comparison.netPayIncrease);

  const handlePrint = () => window.print();

  // 7th CPC current HRA label
  const currentHRALabel = `${(comparison.before.hraRate * 100).toFixed(0)}%`;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

      {/* ── INPUT PANEL ──────────────────────────────────────────────── */}
      <div className="xl:col-span-5 space-y-0 no-print">
        <Card className="shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-primary" />
              Current Pay Details (7th CPC)
            </CardTitle>
            <CardDescription className="text-xs">Enter your existing pay details to project 8th CPC salary</CardDescription>
          </CardHeader>

          <CardContent className="pt-4 space-y-1">

            {/* Step 1: Pay Level */}
            <SectionLabel>Step 1 — Pay Level</SectionLabel>
            <div className="space-y-1.5">
              <Label htmlFor="payLevel" className="text-sm">Pay Level</Label>
              <Select value={inputs.payLevel} onValueChange={handleLevelChange}>
                <SelectTrigger id="payLevel" data-testid="select-pay-level">
                  <SelectValue placeholder="Select Pay Level" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-[min(40vh,18rem)] overflow-y-auto">
                  {PAY_MATRIX_DATA.map((row) => (
                    <SelectItem key={row.level} value={row.level}>
                      Level {row.level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Step 2: Basic Pay from matrix */}
            <div className="space-y-1.5 mt-4">
              <Label htmlFor="basicPay" className="text-sm flex items-center gap-1">
                Basic Pay (7th CPC Matrix)
                <InfoTip text="Select your exact basic pay from the 7th CPC pay matrix for this level. Each step represents one annual increment (3%)." />
              </Label>
              <Select
                value={inputs.basicPay.toString()}
                onValueChange={(v) => updateInput("basicPay", Number(v))}
                disabled={cells.length === 0}
              >
                <SelectTrigger id="basicPay" data-testid="select-basic-pay">
                  <SelectValue placeholder="Select Basic Pay" />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-[min(40vh,18rem)] overflow-y-auto">
                  {cells.map((cell, i) => (
                    <SelectItem key={cell} value={cell.toString()}>
                      {formatCurrency(cell)}
                      <span className="text-muted-foreground text-xs ml-2">Cell {i + 1}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {levelRow && (
                <p className="text-xs text-muted-foreground">
                  Entry: {formatCurrency(levelRow.entryPay)} &nbsp;|&nbsp;
                  Max: {formatCurrency(levelRow.cells[levelRow.cells.length - 1])} &nbsp;|&nbsp;
                  Grade Pay: {levelRow.gradePay}
                </p>
              )}
            </div>

            <Separator className="my-4" />

            {/* Step 3: DA */}
            <SectionLabel>Step 2 — Dearness Allowance</SectionLabel>
            <div className="space-y-1.5">
              <Label className="text-sm flex items-center gap-1">
                Current DA %
                <InfoTip text="Effective January 2026, DA stands at 60%. You can change this if you are calculating for a past or future period." />
              </Label>
              <div className="flex items-center gap-2">
                <Select
                  value={inputs.currentDA.toString()}
                  onValueChange={(v) => updateInput("currentDA", Number(v))}
                >
                  <SelectTrigger data-testid="select-da" className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-[min(40vh,14rem)] overflow-y-auto">
                    {[42, 46, 50, 53, 55, 58, 60].map((da) => (
                      <SelectItem key={da} value={da.toString()}>
                        {da}%{da === 60 ? " (current)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground text-sm">of Basic Pay = {formatCurrency(inputs.basicPay * inputs.currentDA / 100)}</span>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Step 4: HRA */}
            <SectionLabel>Step 3 — House Rent Allowance</SectionLabel>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm">City Class (HRA)</Label>
                <RadioGroup
                  value={inputs.cityCategory}
                  onValueChange={(v) => handleCityChange(v as typeof inputs.cityCategory)}
                  className="flex gap-4"
                  data-testid="radio-city-category"
                >
                  {CITY_CATEGORIES.map((cat) => (
                    <div key={cat.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={cat.value} id={`city-${cat.value}`} />
                      <Label htmlFor={`city-${cat.value}`} className="cursor-pointer font-semibold">
                        {cat.label}
                        <span className="block text-[10px] font-normal text-muted-foreground">{cat.description}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Current HRA (auto, based on DA)</Label>
                  <div className="h-9 px-3 border rounded-md bg-muted/30 flex items-center text-sm font-medium">
                    {currentHRALabel}
                    <span className="text-muted-foreground ml-1 text-xs">({formatCurrency(comparison.before.hraAmount)}/mo)</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs flex items-center gap-1">
                    Expected HRA after 8th CPC
                    <InfoTip text="After 8th CPC, DA resets to 0%, so HRA returns to the base tier. Higher rates may apply if the commission revises them upward." />
                  </Label>
                  <Select
                    value={inputs.hraPercent8CPC.toString()}
                    onValueChange={(v) => updateInput("hraPercent8CPC", Number(v))}
                  >
                    <SelectTrigger data-testid="select-hra-8cpc">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper" className="max-h-[min(40vh,14rem)] overflow-y-auto">
                      {hraOpts.map((pct) => (
                        <SelectItem key={pct} value={pct.toString()}>
                          {pct}%{pct === hraOpts[0] ? " (base, DA reset)" : pct === hraOpts[hraOpts.length - 1] ? " (current, if merged)" : " (mid-tier)"}
                        </SelectItem>
                      ))}
                      <SelectItem value="0">0% (Govt. Accommodation)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Step 5: Transport Allowance */}
            <SectionLabel>Step 4 — Transport Allowance</SectionLabel>
            <div className="space-y-1.5">
              <Label className="text-sm flex items-center gap-1">
                TA City Classification
                <InfoTip text="Transport Allowance uses a different city classification from HRA. Higher TPTA cities: Delhi, Mumbai, Bengaluru, Chennai, Hyderabad, Kolkata, Ahmedabad, Pune." />
              </Label>
              <Select value={inputs.taCity} onValueChange={(v) => updateInput("taCity", v as typeof inputs.taCity)}>
                <SelectTrigger data-testid="select-ta-city">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" className="max-h-[min(40vh,18rem)] overflow-y-auto">
                  {TA_CITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div>
                        <span>{opt.label}</span>
                        <span className="block text-xs text-muted-foreground">{opt.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="bg-muted/30 rounded-md p-2.5 text-xs text-muted-foreground space-y-1 mt-1">
                <p>
                  <strong>Base TA:</strong> {formatCurrency(comparison.before.taBase)} &nbsp;+&nbsp;
                  <strong>DA on TA:</strong> {formatCurrency(comparison.before.taDA)} &nbsp;=&nbsp;
                  <strong className="text-foreground">{formatCurrency(comparison.before.taAmount)}</strong>
                </p>
                <p className="text-[10px]">
                  Level {inputs.payLevel} · {TA_CITY_OPTIONS.find(o => o.value === inputs.taCity)?.label}
                </p>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Step 6: Fitment Factor slider */}
            <SectionLabel>Step 5 — Fitment Factor</SectionLabel>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm flex items-center gap-1">
                  Expected Fitment Factor
                  <InfoTip text="The fitment factor multiplies your current basic pay to arrive at new basic pay. Drag or click a label below to select." />
                </Label>
                <Badge variant="secondary" className="font-mono text-base px-3 py-1">
                  {inputs.fitmentFactor.toFixed(2)}×
                </Badge>
              </div>

              <div className="px-1 pt-1">
                <Slider
                  min={FITMENT_MIN}
                  max={FITMENT_MAX}
                  step={0.01}
                  value={sliderValue}
                  onValueChange={handleSliderChange}
                  onPointerUp={snapToStop}
                  data-testid="slider-fitment"
                  className="w-full"
                />
              </div>

              {/* Stop labels */}
              <div className="flex flex-wrap gap-1.5 mt-1">
                {FITMENT_STOPS.map((stop) => {
                  const isActive = Math.abs(inputs.fitmentFactor - stop.value) < 0.005;
                  return (
                    <button
                      key={stop.value}
                      onClick={() => { updateInput("fitmentFactor", stop.value); setSliderValue([stop.value]); }}
                      className={`px-2.5 py-1 rounded text-xs border transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground border-primary font-semibold"
                          : "bg-card hover:bg-muted border-border text-muted-foreground"
                      }`}
                      data-testid={`btn-fitment-${stop.value}`}
                    >
                      {stop.label}
                      <span className="block text-[9px] leading-none mt-0.5 opacity-75">{stop.description}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Selected: <strong>{nearestStop.description}</strong> — New Basic Pay will be{" "}
                <strong className="text-foreground">{formatCurrency(Math.round(inputs.basicPay * inputs.fitmentFactor / 100) * 100)}</strong>
              </p>
            </div>

            <Separator className="my-4" />

            {/* Step 7: NPS / OPS */}
            <SectionLabel>Step 6 — Pension System</SectionLabel>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 p-3 rounded-lg border">
                <div>
                  <Label className="font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    Pension Type
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {inputs.pensionType === "nps"
                      ? "NPS: 10% of (Basic + DA) deducted monthly. Employer contributes 14%."
                      : "OPS: No employee deduction. Pension guaranteed by government."}
                  </p>
                </div>
                <RadioGroup
                  value={inputs.pensionType}
                  onValueChange={(v) => updateInput("pensionType", v as "nps" | "ops")}
                  className="flex gap-3"
                  data-testid="radio-pension"
                >
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="nps" id="pen-nps" />
                    <Label htmlFor="pen-nps" className="cursor-pointer font-medium">NPS</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="ops" id="pen-ops" />
                    <Label htmlFor="pen-ops" className="cursor-pointer font-medium">OPS</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* CGHS */}
              <div className="flex items-center justify-between gap-4 p-3 rounded-lg border">
                <div>
                  <Label htmlFor="cghs-toggle" className="font-semibold flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-primary" />
                    CGHS Beneficiary
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Central Govt Health Scheme subscription deducted monthly
                  </p>
                </div>
                <Switch
                  id="cghs-toggle"
                  checked={inputs.isCGHSBeneficiary}
                  onCheckedChange={(v) => updateInput("isCGHSBeneficiary", v)}
                  data-testid="switch-cghs"
                />
              </div>

              {/* Tax regime */}
              <div className="flex items-center justify-between gap-4 p-3 rounded-lg border">
                <div>
                  <Label className="font-semibold flex items-center gap-1.5">
                    Income Tax Regime
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {inputs.taxRegime === "new"
                      ? "New regime: Lower rates, standard deduction ₹75,000, no 80C."
                      : "Old regime: 80C/80D deductions, NPS benefits, higher rates above 5L."}
                  </p>
                </div>
                <RadioGroup
                  value={inputs.taxRegime}
                  onValueChange={(v) => updateInput("taxRegime", v as "new" | "old")}
                  className="flex gap-3"
                  data-testid="radio-tax-regime"
                >
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="new" id="tax-new" />
                    <Label htmlFor="tax-new" className="cursor-pointer font-medium">New</Label>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <RadioGroupItem value="old" id="tax-old" />
                    <Label htmlFor="tax-old" className="cursor-pointer font-medium">Old</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* ── OUTPUT PANEL ─────────────────────────────────────────────── */}
      <div className="xl:col-span-7 space-y-5">
        <div className="flex justify-between items-center no-print">
          <h2 className="text-xl font-bold text-foreground font-serif">Salary Projection</h2>
          <Button variant="outline" size="sm" onClick={handlePrint} className="flex gap-2">
            <Printer className="h-4 w-4" /> Print Report
          </Button>
        </div>

        {/* Before / After cards */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* BEFORE */}
          <Card className="card-lift">
            <CardHeader className="pb-3 border-b border-border/60 bg-muted/20">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">7th CPC — Current</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-0">
              <RowItem label="Basic Pay" value={formatCurrency(comparison.before.basicPay)} />
              <RowItem label="DA" sub={`(${comparison.before.daPercent}%)`} value={formatCurrency(comparison.before.daAmount)} />
              <RowItem label="HRA" sub={`(${currentHRALabel})`} value={formatCurrency(comparison.before.hraAmount)} />
              <RowItem label="Transport Allowance" value={formatCurrency(comparison.before.taAmount)} />
              <RowItem label="Gross Pay" value={formatCurrency(comparison.before.grossPay)} highlight />

              <div className="mt-4 pt-3 border-t border-dashed space-y-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">Deductions</p>
                {inputs.pensionType === "nps" && (
                  <RowItem label="NPS (10% Basic+DA)" value={`− ${formatCurrency(comparison.before.deductions.nps)}`} />
                )}
                <RowItem label="CGEGIS" value={`− ${formatCurrency(comparison.before.deductions.cgegis)}`} />
                {inputs.isCGHSBeneficiary && (
                  <RowItem label="CGHS Subscription" value={`− ${formatCurrency(comparison.before.deductions.cghs)}`} />
                )}
                <RowItem label={`Income Tax (${inputs.taxRegime === "new" ? "New" : "Old"} Regime, est.)`} value={`− ${formatCurrency(comparison.before.deductions.incomeTax)}`} />
                <RowItem label="Total Deductions" value={formatCurrency(comparison.before.deductions.total)} highlight />
                <div className="flex justify-between items-center pt-3 mt-1">
                  <span className="font-extrabold text-base">Net In-Hand</span>
                  <span className="font-extrabold text-base text-primary animated-value">{formatCurrency(animBeforeNet)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AFTER */}
          <Card className="card-lift border-primary/25 ring-1 ring-primary/10 shadow-lg shadow-primary/5">
            <CardHeader className="pb-3 border-b border-primary/20 bg-primary/5">
              <CardTitle className="text-sm font-semibold text-primary uppercase tracking-widest flex items-center justify-between">
                <span>8th CPC — Projected</span>
                <Badge variant="outline" className="border-primary/40 text-primary font-mono text-xs">
                  {inputs.fitmentFactor.toFixed(2)}×
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-0">
              <RowItem label="New Basic Pay" value={formatCurrency(comparison.after.basicPay)} />
              <RowItem label="DA" sub="(0% — resets)" value="₹0" />
              <RowItem label="HRA" sub={`(${inputs.hraPercent8CPC}%)`} value={formatCurrency(comparison.after.hraAmount)} />
              <RowItem label="Transport Allowance" value={formatCurrency(comparison.after.taAmount)} />
              <RowItem label="Gross Pay" value={formatCurrency(comparison.after.grossPay)} highlight />

              <div className="mt-4 pt-3 border-t border-dashed border-primary/20 space-y-0">
                <p className="text-[10px] uppercase tracking-widest text-primary/60 font-bold mb-2">Deductions</p>
                {inputs.pensionType === "nps" && (
                  <RowItem label="NPS (10% of Basic)" value={`− ${formatCurrency(comparison.after.deductions.nps)}`} />
                )}
                <RowItem label="CGEGIS" value={`− ${formatCurrency(comparison.after.deductions.cgegis)}`} />
                {inputs.isCGHSBeneficiary && (
                  <RowItem label="CGHS Subscription" value={`− ${formatCurrency(comparison.after.deductions.cghs)}`} />
                )}
                <RowItem label={`Income Tax (${inputs.taxRegime === "new" ? "New" : "Old"} Regime, est.)`} value={`− ${formatCurrency(comparison.after.deductions.incomeTax)}`} />
                <RowItem label="Total Deductions" value={formatCurrency(comparison.after.deductions.total)} highlight />
                <div className="flex justify-between items-center pt-3 mt-1">
                  <span className="font-extrabold text-base">Net In-Hand</span>
                  <span className="font-extrabold text-xl text-primary animated-value">{formatCurrency(animAfterNet)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impact summary bar */}
        <Card className="bg-primary text-primary-foreground shadow-md">
          <CardContent className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-x divide-primary-foreground/20">
              <div>
                <p className="text-primary-foreground/60 text-[10px] uppercase tracking-widest mb-1">Gross Increase</p>
                <p className="text-2xl font-bold animated-value">{formatCurrency(animNetInc)}</p>
                <p className="text-primary-foreground/60 text-xs">per month</p>
              </div>
              <div>
                <p className="text-primary-foreground/60 text-[10px] uppercase tracking-widest mb-1">Net Increase</p>
                <p className="text-2xl font-bold text-secondary animated-value">{formatCurrency(animNetPayInc)}</p>
                <p className="text-primary-foreground/60 text-xs">after deductions</p>
              </div>
              <div>
                <p className="text-primary-foreground/60 text-[10px] uppercase tracking-widest mb-1">Gross Hike</p>
                <p className="text-2xl font-bold">+{comparison.percentIncrease.toFixed(1)}%</p>
                <p className="text-primary-foreground/60 text-xs">on gross salary</p>
              </div>
              <div>
                <p className="text-primary-foreground/60 text-[10px] uppercase tracking-widest mb-1">Min Pension</p>
                <p className="text-sm font-bold mt-1">{formatCurrency(comparison.minimumPensionBefore)}</p>
                <ChevronRight className="h-3 w-3 inline mx-1 opacity-60" />
                <p className="text-sm font-bold">{formatCurrency(comparison.minimumPensionAfter)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fitment factor comparison table */}
        <Card className="no-print">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Fitment Factor Scenario Comparison</CardTitle>
            <CardDescription className="text-xs">
              Your Level {inputs.payLevel} · {formatCurrency(inputs.basicPay)} basic pay across all scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-muted/50 text-muted-foreground text-[11px] uppercase">
                <tr>
                  <th className="px-4 py-3 font-semibold text-left">Scenario</th>
                  <th className="px-4 py-3 font-semibold text-right">Factor</th>
                  <th className="px-4 py-3 font-semibold text-right">New Basic</th>
                  <th className="px-4 py-3 font-semibold text-right">Gross Pay</th>
                  <th className="px-4 py-3 font-semibold text-right">Net Pay</th>
                  <th className="px-4 py-3 font-semibold text-right">Gross Hike</th>
                </tr>
              </thead>
              <tbody>
                {FITMENT_STOPS.map((stop) => {
                  const temp = calculateSalary({ ...inputs, fitmentFactor: stop.value });
                  const isSelected = Math.abs(inputs.fitmentFactor - stop.value) < 0.005;
                  return (
                    <tr
                      key={stop.value}
                      className={`border-b last:border-0 cursor-pointer transition-colors ${
                        isSelected ? "bg-primary/5" : "hover:bg-muted/30"
                      }`}
                      onClick={() => { updateInput("fitmentFactor", stop.value); setSliderValue([stop.value]); }}
                    >
                      <td className="px-4 py-2.5 font-medium">
                        {stop.description}
                        {isSelected && <Badge className="ml-2 text-[9px] py-0 h-4" variant="default">Selected</Badge>}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono">{stop.value}×</td>
                      <td className="px-4 py-2.5 text-right">{formatCurrency(temp.after.basicPay)}</td>
                      <td className="px-4 py-2.5 text-right font-semibold">{formatCurrency(temp.after.grossPay)}</td>
                      <td className="px-4 py-2.5 text-right">{formatCurrency(temp.after.netPay)}</td>
                      <td className="px-4 py-2.5 text-right text-secondary font-medium">+{temp.percentIncrease.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Notes */}
        <div className="text-xs text-muted-foreground space-y-1 no-print">
          <p>Income tax estimate is approximate (no surcharge, assumes standard deduction only). Actual liability depends on other income and exemptions.</p>
          <p>TA after 8th CPC shown at base rate (no DA component, as DA resets to 0%). Will increase as DA rises.</p>
          {inputs.pensionType === "ops" && <p>OPS employees have no NPS deduction. Pension is 50% of last drawn basic pay — a defined benefit, not subject to market risk.</p>}
        </div>
      </div>
    </div>
  );
}
