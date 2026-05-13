import { useState } from "react";
import { FITMENT_STOPS, getProjectedPayMatrix } from "@/lib/calculator";
import { formatCurrency } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useCalculatorStore } from "@/hooks/use-calculator-store";

const CHART_STOPS = [1.92, 2.57, 2.86, 3.83];

export default function PayMatrix() {
  const { inputs } = useCalculatorStore();
  const [selectedFactor, setSelectedFactor] = useState<number>(inputs.fitmentFactor || 2.57);

  const matrixData = getProjectedPayMatrix(selectedFactor);

  const chartData = ["1", "6", "10", "13", "14", "18"].map((level) => {
    const row = matrixData.find((r) => r.level === level);
    if (!row) return null;
    const dataPoint: Record<string, string | number> = { name: `L${level}` };
    CHART_STOPS.forEach((factor) => {
      dataPoint[`${factor}×`] = Math.round(row.entryPay * factor / 100) * 100;
    });
    return dataPoint;
  }).filter(Boolean) as Record<string, string | number>[];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-serif mb-2">Projected 8th CPC Pay Matrix</h1>
        <p className="text-muted-foreground max-w-3xl">
          Entry-level basic pay for all 7th CPC levels alongside projected 8th CPC entry pay
          based on the selected fitment factor.
        </p>
      </div>

      <div className="flex items-center gap-4 bg-card p-4 rounded-lg border shadow-sm max-w-sm">
        <label className="font-semibold whitespace-nowrap text-sm">View Scenario:</label>
        <Select value={selectedFactor.toString()} onValueChange={(val) => setSelectedFactor(Number(val))}>
          <SelectTrigger>
            <SelectValue placeholder="Select Fitment Factor" />
          </SelectTrigger>
          <SelectContent>
            {FITMENT_STOPS.map((stop) => (
              <SelectItem key={stop.value} value={stop.value.toString()}>
                {stop.label} — {stop.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Entry Pay Comparison — Key Levels</CardTitle>
          <CardDescription>
            Comparing four fitment factor scenarios across Level 1, 6, 10, 13, 14, and 18
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[360px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                <YAxis
                  tickFormatter={(v) => v >= 100000 ? `₹${(v / 100000).toFixed(1)}L` : `₹${v / 1000}k`}
                  stroke="hsl(var(--muted-foreground))"
                  tick={{ fontSize: 11 }}
                  width={60}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                />
                <Legend />
                <Bar dataKey="1.92×" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                <Bar dataKey="2.57×" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="2.86×" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="3.83×" fill="#10b981" radius={[4, 4, 0, 0]} />
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
                <th className="px-4 py-4 font-semibold border-b border-primary-foreground/20 text-center w-16">Level</th>
                <th className="px-4 py-4 font-semibold border-b border-primary-foreground/20 text-right">Grade Pay</th>
                <th className="px-4 py-4 font-semibold border-b border-primary-foreground/20 text-right">7th CPC Entry</th>
                <th className="px-4 py-4 font-semibold border-b border-primary-foreground/20 text-right">7th CPC Max</th>
                <th className="px-4 py-4 font-semibold border-b border-primary-foreground/20 text-right bg-primary/80">
                  8th CPC Entry ({selectedFactor}×)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {matrixData.map((row) => (
                <tr key={row.level} className="hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 text-center font-bold bg-muted/20">
                    {row.level}
                  </td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{row.gradePay}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(row.entryPay)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">
                    {formatCurrency(row.cells[row.cells.length - 1])}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-primary bg-primary/5">
                    {formatCurrency(row.projectedPay)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
