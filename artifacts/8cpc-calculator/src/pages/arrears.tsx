import { useState } from "react";
import { calculateArrears } from "@/lib/calculator";
import { formatCurrency, formatLargeCurrency } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { AlertCircle, IndianRupee, Calendar as CalendarIcon, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useCalculatorStore } from "@/hooks/use-calculator-store";

export default function Arrears() {
  const { inputs } = useCalculatorStore();
  
  const [implementationMonth, setImplementationMonth] = useState<string>("2027-01");
  const startDate = new Date(2026, 0, 1); // Jan 1, 2026

  const implDate = new Date(implementationMonth);
  // Default to 1st of month for diff calc
  implDate.setDate(1);

  const arrearsCalc = calculateArrears({
    ...inputs,
    implementationDate: implDate,
    startDate
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold font-serif">Arrears Estimator</h1>
        <p className="text-muted-foreground text-lg">
          Calculate estimated arrears if implementation is delayed beyond January 1, 2026.
        </p>
      </div>

      <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            Set Implementation Date
          </CardTitle>
          <CardDescription>
            The 8th CPC is effective from Jan 2026, but physical payouts often start later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="w-full sm:w-1/3">
              <Label className="mb-2 block">Expected Implementation Month</Label>
              <Input 
                type="month" 
                value={implementationMonth} 
                onChange={(e) => setImplementationMonth(e.target.value)}
                min="2026-01"
              />
            </div>
            
            <div className="flex-1 flex items-center justify-center gap-4 text-sm font-medium text-muted-foreground mt-6 sm:mt-0">
              <div className="bg-card px-4 py-2 rounded border text-center">
                Jan 2026
                <div className="text-xs font-normal mt-1">Effective Date</div>
              </div>
              <ArrowRight className="h-5 w-5" />
              <div className="bg-primary/10 text-primary px-4 py-2 rounded border border-primary/20 text-center">
                {implDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                <div className="text-xs font-normal mt-1">Payout Date</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {arrearsCalc.months <= 0 ? (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>No Arrears</AlertTitle>
          <AlertDescription>
            If implementation happens in or before January 2026, there are no arrears to calculate.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          <Card className="bg-primary text-primary-foreground shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-primary-foreground/80 text-base font-normal uppercase tracking-wider">Total Estimated Arrears</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl sm:text-5xl font-bold mb-2">
                {formatLargeCurrency(arrearsCalc.totalArrears)}
              </div>
              <p className="text-secondary font-medium">For {arrearsCalc.months} months</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-muted-foreground text-base font-normal uppercase tracking-wider">Monthly Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2 text-foreground">
                {formatCurrency(arrearsCalc.monthlyArrears)}
              </div>
              <p className="text-muted-foreground text-sm">Net difference per month</p>
              
              <div className="mt-4 p-3 bg-orange-50 dark:bg-orange-950/20 rounded border border-orange-100 dark:border-orange-900 text-sm text-orange-800 dark:text-orange-200">
                <strong>Tax Note:</strong> Arrears are fully taxable in the year of receipt. However, you can claim relief under Section 89(1) of the Income Tax Act to distribute the tax burden to the respective years.
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {arrearsCalc.months > 0 && arrearsCalc.months <= 36 && (
        <Card>
          <CardHeader>
            <CardTitle>Arrears Accumulation Schedule</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Array.from({ length: arrearsCalc.months }).map((_, i) => {
                const d = new Date(2026, i, 1);
                return (
                  <div key={i} className="flex justify-between items-center p-2 border rounded text-sm bg-muted/20">
                    <span className="text-muted-foreground">{d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}</span>
                    <span className="font-medium">{formatCurrency(arrearsCalc.monthlyArrears)}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
