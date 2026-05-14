import { useState } from "react";
import { calculateSalary } from "@/lib/calculator";
import { formatCurrency, formatLargeCurrency } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle, IndianRupee, Calendar as CalendarIcon, ArrowRight, Info, CheckCircle } from "lucide-react";
import { useCalculatorStore } from "@/hooks/use-calculator-store";

const CPC8_EFFECTIVE_DATE = new Date(2026, 0, 1); // Jan 1, 2026

/**
 * Arrears calculation per government rules:
 * - Effective from Jan 1, 2026
 * - Monthly arrears = (8th CPC Gross) − (7th CPC Gross with DA at effective date)
 * - Arrears accumulate until actual implementation/payout date
 * - Taxable in year of receipt; Sec 89(1) relief available
 * - Estimated tax @ flat 30% for illustration (actual depends on total income slab)
 */
function calcArrears(monthlyDiff: number, fromDate: Date, toDate: Date) {
  const months =
    (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
    (toDate.getMonth() - fromDate.getMonth());
  if (months <= 0) return null;
  const grossArrears = monthlyDiff * months;
  const estimatedTax = Math.round(grossArrears * 0.30);
  const netArrears = grossArrears - estimatedTax;
  return { months, grossArrears, estimatedTax, netArrears, monthlyDiff };
}

export default function Arrears() {
  const { inputs } = useCalculatorStore();
  const [implementationMonth, setImplementationMonth] = useState<string>("2027-01");

  const hasLevel = inputs.payLevel !== "" && inputs.basicPay > 0;

  if (!hasLevel) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center space-y-4">
        <CalendarIcon className="h-12 w-12 text-primary/40 mx-auto" />
        <h2 className="text-xl font-semibold text-foreground">Set Your Pay Details First</h2>
        <p className="text-muted-foreground">
          Please go to the Calculator page and select your Pay Level and Basic Pay to estimate your arrears.
        </p>
      </div>
    );
  }

  const comparison = calculateSalary(inputs);
  const monthlyDiff = comparison.after.grossPay - comparison.before.grossPay;

  const implDate = new Date(implementationMonth + "-01");
  const result = calcArrears(monthlyDiff, CPC8_EFFECTIVE_DATE, implDate);

  // Build month-by-month rows
  const monthRows: Array<{ label: string; gross: number; cumulative: number }> = [];
  if (result && result.months <= 48) {
    for (let i = 0; i < result.months; i++) {
      const d = new Date(2026, i, 1);
      monthRows.push({
        label: d.toLocaleDateString("en-IN", { month: "short", year: "2-digit" }),
        gross: monthlyDiff,
        cumulative: monthlyDiff * (i + 1),
      });
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Arrears Estimator</h1>
        <p className="text-muted-foreground text-sm">
          Estimate arrears payable if 8th CPC salary revision (effective 1 Jan 2026) is implemented later.
        </p>
      </div>

      {/* ── Salary snapshot ────────────────────────────────────── */}
      <Card className="bg-muted/30">
        <CardContent className="p-4 grid sm:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">7th CPC Gross (Current)</p>
            <p className="text-xl font-bold">{formatCurrency(comparison.before.grossPay)}<span className="text-xs text-muted-foreground font-normal">/month</span></p>
            <p className="text-xs text-muted-foreground">Basic {formatCurrency(inputs.basicPay)} + DA {inputs.currentDA}% + HRA + TA</p>
          </div>
          <div className="flex items-center justify-center">
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">8th CPC Gross (Projected)</p>
            <p className="text-xl font-bold text-primary">{formatCurrency(comparison.after.grossPay)}<span className="text-xs text-muted-foreground font-normal">/month</span></p>
            <p className="text-xs text-muted-foreground">New Basic {formatCurrency(comparison.after.basicPay)} · DA reset to 0%</p>
          </div>
        </CardContent>
      </Card>

      {/* ── Monthly diff + date picker ─────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-primary" /> Monthly Arrears
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-3xl font-bold text-primary">{formatCurrency(monthlyDiff)}</p>
            <p className="text-sm text-muted-foreground">per month of delay</p>
            <p className="text-xs text-muted-foreground mt-2">
              = 8th CPC Gross ({formatCurrency(comparison.after.grossPay)}) − 7th CPC Gross ({formatCurrency(comparison.before.grossPay)})
            </p>
            {monthlyDiff < 0 && (
              <p className="text-xs text-destructive mt-1">Note: Negative value — your 7th CPC salary exceeds projected 8th CPC gross. Consider a higher fitment factor.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-primary" /> Implementation Date
            </CardTitle>
            <CardDescription className="text-xs">When do you expect the revised pay to be actually implemented?</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="text-center px-3 py-2 rounded-lg bg-muted/30 border text-sm">
                <p className="font-semibold">Jan 2026</p>
                <p className="text-[10px] text-muted-foreground">Effective date</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="flex-1">
                <Input
                  type="month"
                  value={implementationMonth}
                  onChange={(e) => setImplementationMonth(e.target.value)}
                  min="2026-02"
                  className="w-full"
                />
              </div>
            </div>
            {result && (
              <p className="text-xs text-muted-foreground">
                Arrears period: <strong className="text-foreground">{result.months} months</strong> (Feb 2026 → {implDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" })})
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Result ────────────────────────────────────────────── */}
      {!result ? (
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="p-4 flex items-center gap-3 text-sm text-amber-300">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>No arrears if implementation happens on or before January 2026 (effective date).</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-4">
                <p className="text-primary-foreground/60 text-[10px] uppercase tracking-widest mb-1">Gross Arrears</p>
                <p className="text-3xl font-bold">{formatLargeCurrency(result.grossArrears)}</p>
                <p className="text-primary-foreground/60 text-xs mt-1">Over {result.months} months</p>
              </CardContent>
            </Card>
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-4">
                <p className="text-muted-foreground text-[10px] uppercase tracking-widest mb-1">Estimated Tax</p>
                <p className="text-3xl font-bold text-destructive">{formatLargeCurrency(result.estimatedTax)}</p>
                <p className="text-muted-foreground text-xs mt-1">~30% flat (illustrative)</p>
              </CardContent>
            </Card>
            <Card className="border-secondary/20 bg-secondary/5">
              <CardContent className="p-4">
                <p className="text-muted-foreground text-[10px] uppercase tracking-widest mb-1">Net Arrears</p>
                <p className="text-3xl font-bold text-secondary">{formatLargeCurrency(result.netArrears)}</p>
                <p className="text-muted-foreground text-xs mt-1">After 30% tax estimate</p>
              </CardContent>
            </Card>
          </div>

          {/* Section 89(1) info */}
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                <CheckCircle className="h-4 w-4" /> Section 89(1) Relief — Claim it!
              </div>
              <div className="text-xs text-muted-foreground space-y-1.5">
                <p>
                  Arrears are taxable as income in the year of receipt. However, <strong className="text-foreground">Section 89(1) of the Income Tax Act</strong> lets you spread the tax liability across the years to which the arrears relate — so you don't pay a higher slab rate just because a large lump sum arrives in one year.
                </p>
                <p>
                  <strong className="text-foreground">How to claim:</strong> File Form 10E on the Income Tax e-filing portal before filing your ITR for the year in which arrears are received. The portal calculates the exact relief amount automatically.
                </p>
                <p>
                  <strong className="text-foreground">Example:</strong> If ₹{(result.months).toFixed(0)} months of arrears worth {formatLargeCurrency(result.grossArrears)} push you into a higher slab this year, Sec 89(1) computes the tax as if the arrears were received in the respective earlier years — reducing your effective tax liability significantly.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Month-by-month schedule */}
          {monthRows.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Month-by-Month Arrears Schedule</CardTitle>
                <CardDescription className="text-xs">
                  Each month below accumulates {formatCurrency(monthlyDiff)} in arrears from Jan 2026
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead className="bg-muted/50 text-muted-foreground text-[11px] uppercase">
                    <tr>
                      <th className="px-4 py-2.5 font-semibold text-left">Month</th>
                      <th className="px-4 py-2.5 font-semibold text-right">Monthly Arrear</th>
                      <th className="px-4 py-2.5 font-semibold text-right">Cumulative (Gross)</th>
                      <th className="px-4 py-2.5 font-semibold text-right">Cumulative (Net ~70%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthRows.map((row, i) => (
                      <tr key={i} className={`border-b border-border/30 ${i === monthRows.length - 1 ? "bg-primary/5 font-semibold" : "hover:bg-muted/20"} transition-colors`}>
                        <td className="px-4 py-2 text-muted-foreground">{row.label}</td>
                        <td className="px-4 py-2 text-right font-mono">{formatCurrency(row.gross)}</td>
                        <td className="px-4 py-2 text-right font-mono font-medium">{formatLargeCurrency(row.cumulative)}</td>
                        <td className="px-4 py-2 text-right font-mono text-secondary">{formatLargeCurrency(Math.round(row.cumulative * 0.70))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {result.months > 48 && (
            <Card className="border-amber-500/20 bg-amber-500/5">
              <CardContent className="p-3 text-xs text-amber-300 flex gap-2">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                Month-by-month schedule shown only for periods up to 48 months. The gross and net totals above are still accurate.
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Notes */}
      <div className="text-xs text-muted-foreground space-y-1 p-3 rounded-lg bg-muted/20 border border-border/40">
        <p><strong className="text-foreground">7th CPC DA during arrears period:</strong> DA at 60% is used for the entire arrears period. In reality, DA may be revised upward every 6 months; this calculator uses the DA rate at the effective date as a conservative baseline.</p>
        <p><strong className="text-foreground">Tax estimate:</strong> 30% flat is illustrative only. Actual tax depends on your other income, deductions, and the slab rates applicable. The Sec 89(1) relief can reduce this significantly.</p>
      </div>
    </div>
  );
}
