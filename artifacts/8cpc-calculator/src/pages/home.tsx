import { useCalculatorStore } from "@/hooks/use-calculator-store";
import { calculateSalary, FITMENT_FACTORS, CITY_CATEGORIES, PAY_MATRIX_DATA } from "@/lib/calculator";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, IndianRupee, Printer, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const { inputs, updateInput } = useCalculatorStore();
  const comparison = calculateSalary(inputs);

  const handlePrint = () => {
    window.print();
  };

  const isInvalidBasicPay = inputs.basicPay < 18000 || inputs.basicPay > 250000;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Input Section */}
      <div className="lg:col-span-4 space-y-6 no-print">
        <Card className="shadow-md border-primary/10">
          <CardHeader className="bg-primary/5 pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <IndianRupee className="h-5 w-5 text-primary" />
              Current Details
            </CardTitle>
            <CardDescription>Enter your 7th CPC parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            
            <div className="space-y-2">
              <Label htmlFor="basicPay">Basic Pay (₹)</Label>
              <Input
                id="basicPay"
                type="number"
                value={inputs.basicPay || ""}
                onChange={(e) => updateInput("basicPay", Number(e.target.value))}
                className={isInvalidBasicPay ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {isInvalidBasicPay && (
                <p className="text-xs text-destructive">
                  Basic pay typically ranges from ₹18,000 to ₹2,50,000
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="payLevel">Pay Level</Label>
              <Select 
                value={inputs.payLevel.toString()} 
                onValueChange={(val) => updateInput("payLevel", Number(val))}
              >
                <SelectTrigger id="payLevel">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {PAY_MATRIX_DATA.map((row) => (
                    <SelectItem key={row.level} value={row.level.toString()}>
                      Level {row.level} ({row.postCategory})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>City Category (for HRA & TA)</Label>
              <RadioGroup 
                value={inputs.cityCategory} 
                onValueChange={(val: any) => updateInput("cityCategory", val)}
                className="flex gap-4"
              >
                {CITY_CATEGORIES.map((cat) => (
                  <div key={cat.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={cat.value} id={`city-${cat.value}`} />
                    <Label htmlFor={`city-${cat.value}`} className="cursor-pointer">
                      {cat.label} <span className="text-muted-foreground text-xs block font-normal">{cat.description}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currentDA">Current DA % (Optional Simulation)</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="currentDA"
                  type="number"
                  value={inputs.currentDA || ""}
                  onChange={(e) => updateInput("currentDA", Number(e.target.value))}
                />
                <span className="text-muted-foreground">%</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Fitment Factor
              </Label>
              <RadioGroup 
                value={inputs.fitmentFactor.toString()} 
                onValueChange={(val) => updateInput("fitmentFactor", Number(val))}
                className="space-y-2"
              >
                {FITMENT_FACTORS.map((factor) => (
                  <div 
                    key={factor.value} 
                    className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      inputs.fitmentFactor === factor.value 
                        ? "bg-primary/5 border-primary" 
                        : "bg-card border-border hover:bg-muted"
                    }`}
                    onClick={() => updateInput("fitmentFactor", factor.value)}
                  >
                    <RadioGroupItem value={factor.value.toString()} id={`factor-${factor.value}`} className="mt-1" />
                    <div className="grid gap-1">
                      <Label htmlFor={`factor-${factor.value}`} className="font-semibold text-base cursor-pointer">
                        {factor.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {factor.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

          </CardContent>
        </Card>
      </div>

      {/* Output Section */}
      <div className="lg:col-span-8 space-y-6">
        <div className="flex justify-between items-center no-print">
          <h2 className="text-2xl font-bold text-foreground font-serif">Salary Projection</h2>
          <Button variant="outline" size="sm" onClick={handlePrint} className="flex gap-2">
            <Printer className="h-4 w-4" /> Print Report
          </Button>
        </div>

        {isInvalidBasicPay ? (
           <Alert variant="destructive">
             <AlertCircle className="h-4 w-4" />
             <AlertTitle>Invalid Basic Pay</AlertTitle>
             <AlertDescription>
               Please enter a valid 7th CPC basic pay to see projections. It usually ranges from ₹18,000 to ₹2,50,000.
             </AlertDescription>
           </Alert>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Before Card */}
              <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader className="pb-4 border-b border-slate-200 dark:border-slate-800">
                  <CardTitle className="text-lg text-slate-700 dark:text-slate-300">7th CPC (Current)</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Basic Pay</span>
                    <span className="font-medium">{formatCurrency(comparison.before.basicPay)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">DA ({comparison.before.daPercent}%)</span>
                    <span className="font-medium">{formatCurrency(comparison.before.daAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">HRA ({(comparison.before.hraRate * 100).toFixed(0)}%)</span>
                    <span className="font-medium">{formatCurrency(comparison.before.hraAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">TA (with DA)</span>
                    <span className="font-medium">{formatCurrency(comparison.before.taAmount)}</span>
                  </div>
                  <Separator className="bg-slate-300 dark:bg-slate-700" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-lg">Gross Pay</span>
                    <span className="font-bold text-lg">{formatCurrency(comparison.before.grossPay)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* After Card */}
              <Card className="bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50 shadow-md ring-1 ring-orange-100 dark:ring-orange-900">
                <CardHeader className="pb-4 border-b border-orange-200 dark:border-orange-900/50">
                  <CardTitle className="text-lg text-orange-800 dark:text-orange-400 flex items-center gap-2">
                    8th CPC (Projected)
                    <span className="text-xs bg-orange-200 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full font-medium ml-auto">
                      {inputs.fitmentFactor}× Factor
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-orange-900/70 dark:text-orange-200/70">New Basic Pay</span>
                    <span className="font-medium text-orange-950 dark:text-orange-100">{formatCurrency(comparison.after.basicPay)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-900/70 dark:text-orange-200/70">DA (Merged / 0%)</span>
                    <span className="font-medium text-orange-950 dark:text-orange-100">{formatCurrency(comparison.after.daAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-900/70 dark:text-orange-200/70">Base HRA ({(comparison.after.hraRate * 100).toFixed(0)}%)</span>
                    <span className="font-medium text-orange-950 dark:text-orange-100">{formatCurrency(comparison.after.hraAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-orange-900/70 dark:text-orange-200/70">Base TA</span>
                    <span className="font-medium text-orange-950 dark:text-orange-100">{formatCurrency(comparison.after.taAmount)}</span>
                  </div>
                  <Separator className="bg-orange-300 dark:bg-orange-800" />
                  <div className="flex justify-between items-center pt-2">
                    <span className="font-bold text-xl text-orange-900 dark:text-orange-400">Gross Pay</span>
                    <span className="font-bold text-xl text-orange-900 dark:text-orange-400">{formatCurrency(comparison.after.grossPay)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Impact Summary */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <div className="grid sm:grid-cols-3 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-primary-foreground/20">
                  <div className="pt-4 sm:pt-0">
                    <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wider mb-1">Net Monthly Increase</p>
                    <p className="text-3xl font-bold">{formatCurrency(comparison.netIncrease)}</p>
                  </div>
                  <div className="pt-4 sm:pt-0">
                    <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wider mb-1">Percentage Hike</p>
                    <p className="text-3xl font-bold text-secondary">+{comparison.percentIncrease.toFixed(1)}%</p>
                  </div>
                  <div className="pt-4 sm:pt-0">
                    <p className="text-primary-foreground/70 text-sm font-medium uppercase tracking-wider mb-1">Min Pension Effect</p>
                    <p className="text-xl font-bold mt-2">{formatCurrency(comparison.minimumPensionBefore)} → {formatCurrency(comparison.minimumPensionAfter)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fitment Factor Comparison Table */}
            <Card className="no-print">
              <CardHeader>
                <CardTitle className="text-lg">Scenario Comparison</CardTitle>
                <CardDescription>How different union demands affect your projected gross salary.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-muted/50 text-muted-foreground uppercase text-xs">
                    <tr>
                      <th className="px-4 py-3 font-semibold border-b">Scenario</th>
                      <th className="px-4 py-3 font-semibold border-b text-right">Factor</th>
                      <th className="px-4 py-3 font-semibold border-b text-right">New Basic</th>
                      <th className="px-4 py-3 font-semibold border-b text-right">Proj. Gross</th>
                      <th className="px-4 py-3 font-semibold border-b text-right">Increase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {FITMENT_FACTORS.map((factor) => {
                      const tempComp = calculateSalary({ ...inputs, fitmentFactor: factor.value });
                      const isSelected = inputs.fitmentFactor === factor.value;
                      return (
                        <tr key={factor.value} className={`border-b last:border-0 ${isSelected ? "bg-primary/5" : ""}`}>
                          <td className="px-4 py-3 font-medium flex items-center gap-2">
                            {factor.description}
                            {isSelected && <span className="text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">Selected</span>}
                          </td>
                          <td className="px-4 py-3 text-right">{factor.value}×</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(tempComp.after.basicPay)}</td>
                          <td className="px-4 py-3 text-right font-bold">{formatCurrency(tempComp.after.grossPay)}</td>
                          <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">+{formatCurrency(tempComp.netIncrease)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
