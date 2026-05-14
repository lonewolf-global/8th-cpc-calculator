import { useState } from "react";
import { useCalculatorStore } from "@/hooks/use-calculator-store";
import { calculateOPSPension, calculateNPSProjection, getLevelRow } from "@/lib/calculator";
import { formatCurrency, formatLargeCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShieldCheck, TrendingUp, IndianRupee, Info, AlertCircle } from "lucide-react";

function StatRow({ label, value, sub, positive }: { label: string; value: string; sub?: string; positive?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
      <span className="text-sm text-muted-foreground">
        {label}
        {sub && <span className="block text-[10px] opacity-60">{sub}</span>}
      </span>
      <span className={`font-semibold tabular-nums text-sm ${positive ? "text-secondary" : ""}`}>{value}</span>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 mt-4 first:mt-0">
      {children}
    </p>
  );
}

export default function Pension() {
  const { inputs } = useCalculatorStore();
  const [qualifyingYears, setQualifyingYears] = useState(20);
  const [yearsToRetirement, setYearsToRetirement] = useState(15);
  const [retirementAge, setRetirementAge] = useState(60);

  const levelRow = getLevelRow(inputs.payLevel);
  const hasLevel = inputs.payLevel !== "" && inputs.basicPay > 0;

  if (!hasLevel) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <ShieldCheck className="h-12 w-12 text-primary/40 mx-auto" />
        <h2 className="text-xl font-semibold text-foreground">Set Your Pay Details First</h2>
        <p className="text-muted-foreground">
          Please go to the Calculator page and select your Pay Level and Basic Pay to use the Pension Calculator.
        </p>
      </div>
    );
  }

  const opsResult = calculateOPSPension(inputs.basicPay, inputs.currentDA, qualifyingYears, retirementAge, inputs.fitmentFactor);
  const npsResult = calculateNPSProjection(inputs.basicPay, inputs.currentDA, inputs.fitmentFactor, yearsToRetirement);

  const afterBasicPay = Math.round(inputs.basicPay * inputs.fitmentFactor / 100) * 100;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Pension Calculator</h1>
        <p className="text-muted-foreground text-sm">
          Compare OPS (Old Pension Scheme) and NPS (National Pension System) benefits — before and after 8th CPC.
        </p>
      </div>

      {/* ── Inputs ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3 border-b border-border/50">
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" /> Your Details
          </CardTitle>
          <CardDescription className="text-xs">
            Pay Level {inputs.payLevel} · Basic Pay {formatCurrency(inputs.basicPay)} · DA {inputs.currentDA}% · Fitment {inputs.fitmentFactor}×
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 grid sm:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Qualifying Service</Label>
              <Badge variant="outline" className="font-mono">{qualifyingYears} yrs</Badge>
            </div>
            <Slider min={10} max={40} step={1} value={[qualifyingYears]} onValueChange={([v]) => setQualifyingYears(v)} />
            <p className="text-[11px] text-muted-foreground">
              {qualifyingYears >= 33 ? "Full pension (≥33 yrs)" : `Pro-rated: ${(qualifyingYears/33*100).toFixed(0)}% of max`}
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Years to Retirement</Label>
              <Badge variant="outline" className="font-mono">{yearsToRetirement} yrs</Badge>
            </div>
            <Slider min={1} max={35} step={1} value={[yearsToRetirement]} onValueChange={([v]) => setYearsToRetirement(v)} />
            <p className="text-[11px] text-muted-foreground">Used for NPS corpus projection</p>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-sm">Retirement Age</Label>
              <Badge variant="outline" className="font-mono">{retirementAge} yrs</Badge>
            </div>
            <Slider min={55} max={62} step={1} value={[retirementAge]} onValueChange={([v]) => setRetirementAge(v)} />
            <p className="text-[11px] text-muted-foreground">
              Commutation factor: {retirementAge <= 55 ? "10.645" : retirementAge <= 58 ? "9.188" : "8.194"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ── OPS Section ─────────────────────────────────────────── */}
      {inputs.pensionType === "ops" ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Old Pension Scheme (OPS)
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* BEFORE */}
            <Card className="card-lift">
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-widest">7th CPC — Current</CardTitle>
                <CardDescription className="text-xs">Basic: {formatCurrency(inputs.basicPay)} · DA: {inputs.currentDA}%</CardDescription>
              </CardHeader>
              <CardContent className="pt-3 space-y-0">
                <SectionLabel>Monthly Pension</SectionLabel>
                <StatRow label="Basic Pension (50%)" value={formatCurrency(opsResult.before.basicPension)} positive />
                <StatRow label="Minimum Pension" value={formatCurrency(opsResult.before.minPension)} sub="Govt. guaranteed floor" />
                <StatRow label="Family Pension" value={formatCurrency(opsResult.before.familyPension)} sub="30% of last basic" />
                <StatRow label="Enhanced Family Pension" value={formatCurrency(opsResult.before.enhancedFamilyPension)} sub="50% for first 7 yrs (if service > 7 yrs)" />

                <SectionLabel>After Commutation (40%)</SectionLabel>
                <StatRow label="Commuted Lump Sum" value={formatLargeCurrency(opsResult.before.commutedLumpSum)} sub={`40% × 12 × ${retirementAge <= 55 ? "10.645" : retirementAge <= 58 ? "9.188" : "8.194"} factor`} positive />
                <StatRow label="Reduced Monthly Pension" value={formatCurrency(opsResult.before.reducedMonthlyPension)} sub="Restored after 15 years" />

                <SectionLabel>Terminal Benefits</SectionLabel>
                <StatRow label="Retirement Gratuity" value={formatLargeCurrency(opsResult.before.gratuity)} sub="Capped at ₹20 lakhs (7th CPC)" positive />
                <StatRow label="Leave Encashment (300 days)" value={formatLargeCurrency(opsResult.before.leaveEncashment)} sub="(Basic + DA) ÷ 30 × 300" positive />
              </CardContent>
            </Card>

            {/* AFTER */}
            <Card className="card-lift border-primary/25 ring-1 ring-primary/10">
              <CardHeader className="pb-3 border-b border-primary/20 bg-primary/5">
                <CardTitle className="text-sm text-primary uppercase tracking-widest flex justify-between">
                  <span>8th CPC — Projected</span>
                  <Badge variant="outline" className="border-primary/40 text-primary text-xs font-mono">{inputs.fitmentFactor}×</Badge>
                </CardTitle>
                <CardDescription className="text-xs">New Basic: {formatCurrency(afterBasicPay)} · DA reset to 0%</CardDescription>
              </CardHeader>
              <CardContent className="pt-3 space-y-0">
                <SectionLabel>Monthly Pension</SectionLabel>
                <StatRow label="Basic Pension (50%)" value={formatCurrency(opsResult.after.basicPension)} positive />
                <StatRow label="Minimum Pension" value={formatCurrency(opsResult.after.minPension)} sub="Expected floor (8th CPC)" />
                <StatRow label="Family Pension" value={formatCurrency(opsResult.after.familyPension)} sub="30% of new basic" />
                <StatRow label="Enhanced Family Pension" value={formatCurrency(opsResult.after.enhancedFamilyPension)} sub="50% for first 7 yrs" />

                <SectionLabel>After Commutation (40%)</SectionLabel>
                <StatRow label="Commuted Lump Sum" value={formatLargeCurrency(opsResult.after.commutedLumpSum)} positive />
                <StatRow label="Reduced Monthly Pension" value={formatCurrency(opsResult.after.reducedMonthlyPension)} sub="Restored after 15 years" />

                <SectionLabel>Terminal Benefits</SectionLabel>
                <StatRow label="Retirement Gratuity" value={formatLargeCurrency(opsResult.after.gratuity)} sub="Expected cap ₹30 lakhs (8th CPC)" positive />
                <StatRow label="Leave Encashment (300 days)" value={formatLargeCurrency(opsResult.after.leaveEncashment)} sub="(New Basic) ÷ 30 × 300" positive />
              </CardContent>
            </Card>
          </div>

          {/* OPS hike summary */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-x divide-primary-foreground/20">
              <div>
                <p className="text-primary-foreground/60 text-[10px] uppercase tracking-widest mb-1">Pension Hike</p>
                <p className="text-2xl font-bold">{formatCurrency(opsResult.after.basicPension - opsResult.before.basicPension)}</p>
                <p className="text-primary-foreground/60 text-xs">per month</p>
              </div>
              <div>
                <p className="text-primary-foreground/60 text-[10px] uppercase tracking-widest mb-1">Gratuity Hike</p>
                <p className="text-2xl font-bold">{formatLargeCurrency(opsResult.after.gratuity - opsResult.before.gratuity)}</p>
                <p className="text-primary-foreground/60 text-xs">lump sum</p>
              </div>
              <div>
                <p className="text-primary-foreground/60 text-[10px] uppercase tracking-widest mb-1">Commuted Value</p>
                <p className="text-2xl font-bold">{formatLargeCurrency(opsResult.after.commutedLumpSum)}</p>
                <p className="text-primary-foreground/60 text-xs">lump sum (40%)</p>
              </div>
              <div>
                <p className="text-primary-foreground/60 text-[10px] uppercase tracking-widest mb-1">Pension % Hike</p>
                <p className="text-2xl font-bold">
                  +{opsResult.before.basicPension > 0
                    ? ((opsResult.after.basicPension - opsResult.before.basicPension) / opsResult.before.basicPension * 100).toFixed(1)
                    : "—"}%
                </p>
                <p className="text-primary-foreground/60 text-xs">on basic pension</p>
              </div>
            </CardContent>
          </Card>

          {/* OPS Notes */}
          <div className="text-xs text-muted-foreground space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
            <p><strong className="text-foreground">Dearness Relief (DR)</strong> is paid on the basic pension at the same rate as DA for serving employees, and is not shown above as it will change over time.</p>
            <p><strong className="text-foreground">Commutation</strong>: Up to 40% of basic pension can be commuted. The commuted portion is restored after 15 years from date of retirement. Commutation values are per the Government of India's commutation table (Schedule of Commutation Values, 2003).</p>
            <p><strong className="text-foreground">Gratuity</strong>: Formula — (1/4 × emoluments) × number of completed 6-monthly periods of qualifying service. Capped at ₹20L (7th CPC) and estimated ₹30L under 8th CPC.</p>
          </div>
        </div>
      ) : (
        /* ── NPS Section ─────────────────────────────────────────── */
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" /> National Pension System (NPS)
          </h2>

          <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300 flex gap-2 items-start">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>NPS corpus and pension projections assume <strong>10% p.a. returns</strong> on corpus and <strong>6% p.a. annuity rate</strong>. Actual returns may vary. Past NPS returns (Tier-I) have been 9–12% p.a. historically.</span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* BEFORE */}
            <Card className="card-lift">
              <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-widest">7th CPC — Current</CardTitle>
                <CardDescription className="text-xs">Basic {formatCurrency(inputs.basicPay)} + DA {inputs.currentDA}%</CardDescription>
              </CardHeader>
              <CardContent className="pt-3 space-y-0">
                <SectionLabel>Monthly Contributions</SectionLabel>
                <StatRow label="Employee (10%)" value={formatCurrency(npsResult.before.monthlyEmployeeContrib)} />
                <StatRow label="Government (14%)" value={formatCurrency(npsResult.before.monthlyGovtContrib)} />
                <StatRow label="Total (24% of Basic+DA)" value={formatCurrency(npsResult.before.monthlyTotalContrib)} positive />

                <SectionLabel>At Retirement ({yearsToRetirement} yrs, 10% p.a.)</SectionLabel>
                <StatRow label="Projected Corpus" value={formatLargeCurrency(npsResult.before.projectedCorpus)} positive />
                <StatRow label="Lump Sum (60%, tax-free)" value={formatLargeCurrency(npsResult.before.lumpSum)} positive />
                <StatRow label="Annuity Corpus (40%)" value={formatLargeCurrency(npsResult.before.annuityCorpus)} />
                <StatRow label="Monthly Pension (6% p.a.)" value={formatCurrency(npsResult.before.monthlyPension)} positive />
              </CardContent>
            </Card>

            {/* AFTER */}
            <Card className="card-lift border-primary/25 ring-1 ring-primary/10">
              <CardHeader className="pb-3 border-b border-primary/20 bg-primary/5">
                <CardTitle className="text-sm text-primary uppercase tracking-widest flex justify-between">
                  <span>8th CPC — Projected</span>
                  <Badge variant="outline" className="border-primary/40 text-primary text-xs font-mono">{inputs.fitmentFactor}×</Badge>
                </CardTitle>
                <CardDescription className="text-xs">New Basic {formatCurrency(afterBasicPay)} · DA reset to 0%</CardDescription>
              </CardHeader>
              <CardContent className="pt-3 space-y-0">
                <SectionLabel>Monthly Contributions</SectionLabel>
                <StatRow label="Employee (10%)" value={formatCurrency(npsResult.after.monthlyEmployeeContrib)} />
                <StatRow label="Government (14%)" value={formatCurrency(npsResult.after.monthlyGovtContrib)} />
                <StatRow label="Total (24% of New Basic)" value={formatCurrency(npsResult.after.monthlyTotalContrib)} positive />

                <SectionLabel>At Retirement ({yearsToRetirement} yrs, 10% p.a.)</SectionLabel>
                <StatRow label="Projected Corpus" value={formatLargeCurrency(npsResult.after.projectedCorpus)} positive />
                <StatRow label="Lump Sum (60%, tax-free)" value={formatLargeCurrency(npsResult.after.lumpSum)} positive />
                <StatRow label="Annuity Corpus (40%)" value={formatLargeCurrency(npsResult.after.annuityCorpus)} />
                <StatRow label="Monthly Pension (6% p.a.)" value={formatCurrency(npsResult.after.monthlyPension)} positive />
              </CardContent>
            </Card>
          </div>

          {/* NPS summary bar */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center divide-x divide-primary-foreground/20">
              <div>
                <p className="text-primary-foreground/60 text-[10px] uppercase tracking-widest mb-1">Corpus Increase</p>
                <p className="text-2xl font-bold">{formatLargeCurrency(npsResult.after.projectedCorpus - npsResult.before.projectedCorpus)}</p>
                <p className="text-primary-foreground/60 text-xs">at retirement</p>
              </div>
              <div>
                <p className="text-primary-foreground/60 text-[10px] uppercase tracking-widest mb-1">Extra Lump Sum</p>
                <p className="text-2xl font-bold">{formatLargeCurrency(npsResult.after.lumpSum - npsResult.before.lumpSum)}</p>
                <p className="text-primary-foreground/60 text-xs">tax-free (60%)</p>
              </div>
              <div>
                <p className="text-primary-foreground/60 text-[10px] uppercase tracking-widest mb-1">Monthly Pension Hike</p>
                <p className="text-2xl font-bold">{formatCurrency(npsResult.after.monthlyPension - npsResult.before.monthlyPension)}</p>
                <p className="text-primary-foreground/60 text-xs">annuity income</p>
              </div>
              <div>
                <p className="text-primary-foreground/60 text-[10px] uppercase tracking-widest mb-1">Extra Contribution</p>
                <p className="text-2xl font-bold">{formatCurrency(npsResult.after.monthlyTotalContrib - npsResult.before.monthlyTotalContrib)}</p>
                <p className="text-primary-foreground/60 text-xs">per month</p>
              </div>
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
            <p><strong className="text-foreground">NPS Tier-I</strong>: Mandatory for Central Govt employees (except those under OPS). Employee contributes 10% of (Basic+DA), Government contributes 14%.</p>
            <p><strong className="text-foreground">At retirement</strong>: Minimum 40% of corpus must be used to purchase annuity. Up to 60% can be withdrawn as tax-free lump sum.</p>
            <p><strong className="text-foreground">DA reset effect</strong>: Immediately after 8th CPC implementation, DA resets to 0%, so NPS contributions drop temporarily as they're 24% of (Basic+DA). Contributions will rise as DA builds up again.</p>
          </div>
        </div>
      )}

      {/* OPS vs NPS switch hint */}
      <div className="flex items-center gap-2 p-3 rounded-lg border border-border/30 text-xs text-muted-foreground">
        <IndianRupee className="h-4 w-4 shrink-0 text-primary" />
        <span>
          Showing <strong className="text-foreground">{inputs.pensionType === "ops" ? "OPS" : "NPS"}</strong> results.
          To switch, go to the Calculator page and change the Pension Type toggle.
        </span>
      </div>
    </div>
  );
}
