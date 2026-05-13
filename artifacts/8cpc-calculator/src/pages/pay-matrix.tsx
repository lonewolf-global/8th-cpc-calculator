import { useState } from "react";
import { FITMENT_FACTORS, getProjectedPayMatrix } from "@/lib/calculator";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { useCalculatorStore } from "@/hooks/use-calculator-store";

export default function PayMatrix() {
  const { inputs } = useCalculatorStore();
  const [selectedFactor, setSelectedFactor] = useState<number>(inputs.fitmentFactor || 2.57);

  const matrixData = getProjectedPayMatrix(selectedFactor);

  // Data for chart showing comparison across all factors for a few key levels
  const chartData = [1, 6, 10, 14, 18].map(level => {
    const row = matrixData.find(r => r.level === level) || matrixData[0];
    const dataPoint: any = { name: `Level ${level}` };
    FITMENT_FACTORS.forEach(factor => {
      dataPoint[`Factor ${factor.value}x`] = Math.round(row.entryPay * factor.value / 100) * 100;
    });
    return dataPoint;
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">Projected 8th CPC Pay Matrix</h1>
        <p className="text-muted-foreground max-w-3xl">
          This table shows the entry-level basic pay for all pay levels under the 7th CPC compared to the projected 8th CPC basic pay based on the selected fitment factor.
        </p>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm max-w-sm">
        <label className="font-semibold whitespace-nowrap">View Scenario:</label>
        <Select value={selectedFactor.toString()} onValueChange={(val) => setSelectedFactor(Number(val))}>
          <SelectTrigger>
            <SelectValue placeholder="Select Fitment Factor" />
          </SelectTrigger>
          <SelectContent>
            {FITMENT_FACTORS.map((factor) => (
              <SelectItem key={factor.value} value={factor.value.toString()}>
                {factor.label} ({factor.description})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entry Pay Comparison by Level</CardTitle>
          <CardDescription>Visualizing how different fitment factors affect key entry levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis 
                  tickFormatter={(value) => `₹${value / 1000}k`}
                  stroke="hsl(var(--muted-foreground))"
                />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                />
                <Legend />
                <Bar dataKey="Factor 1.92x" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Factor 2.57x" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Factor 2.86x" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Factor 3.83x" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="bg-primary text-primary-foreground">
              <tr>
                <th className="px-4 py-4 font-semibold border-b border-primary-foreground/20 text-center">Level</th>
                <th className="px-4 py-4 font-semibold border-b border-primary-foreground/20">Post Category</th>
                <th className="px-4 py-4 font-semibold border-b border-primary-foreground/20 text-right">Grade Pay (6th)</th>
                <th className="px-4 py-4 font-semibold border-b border-primary-foreground/20 text-right">7th CPC Entry</th>
                <th className="px-4 py-4 font-semibold border-b border-primary-foreground/20 text-right bg-primary/80">Projected 8th CPC</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {matrixData.map((row) => (
                <tr key={row.level} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-center font-medium bg-muted/30">{row.level}</td>
                  <td className="px-4 py-3">{row.postCategory}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{row.gradePay}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(row.entryPay)}</td>
                  <td className="px-4 py-3 text-right font-bold text-primary bg-primary/5">{formatCurrency(row.projectedPay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

    </div>
  );
}
