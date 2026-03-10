import { useState, useMemo } from "react";
import { useDataset } from "@/context/DatasetContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, BarChart3 } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { ColumnProfileDrawer } from "@/components/ColumnProfileDrawer";
import type { DatasetColumn } from "@/context/DatasetContext";

const AnalysisPage = () => {
  const { dataset, cleanedDataset } = useDataset();
  const navigate = useNavigate();
  const active = cleanedDataset || dataset;
  const [selectedCol, setSelectedCol] = useState<string>("");
  const [profileCol, setProfileCol] = useState<DatasetColumn | null>(null);

  const numericCols = useMemo(
    () => active?.columns.filter((c) => c.type === "numeric").map((c) => c.name) || [],
    [active]
  );
  const textCols = useMemo(
    () => active?.columns.filter((c) => c.type === "text").map((c) => c.name) || [],
    [active]
  );

  const col = selectedCol || numericCols[0] || textCols[0] || "";
  const isNumeric = numericCols.includes(col);

  const chartData = useMemo(() => {
    if (!col || !active) return [];

    if (isNumeric) {
      const values = active.data.map((r) => Number(r[col])).filter((v) => !isNaN(v));
      if (values.length === 0) return [];
      const min = Math.min(...values);
      const max = Math.max(...values);
      const binCount = Math.min(15, Math.ceil(Math.sqrt(values.length)));
      const binSize = (max - min) / binCount || 1;
      const bins = Array.from({ length: binCount }, (_, i) => ({
        label: `${(min + i * binSize).toFixed(1)}`,
        count: 0,
      }));
      values.forEach((v) => {
        const idx = Math.min(Math.floor((v - min) / binSize), binCount - 1);
        bins[idx].count++;
      });
      return bins;
    } else {
      const freq: Record<string, number> = {};
      active.data.forEach((r) => {
        const val = String(r[col] ?? "empty");
        freq[val] = (freq[val] || 0) + 1;
      });
      return Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([label, count]) => ({ label, count }));
    }
  }, [col, active, isNumeric]);

  const insights = useMemo(() => {
    if (!active) return [];
    const msgs: string[] = [];
    active.columns.forEach((c) => {
      const missPct = ((c.missingCount / active.rows) * 100).toFixed(1);
      if (c.missingCount > 0) msgs.push(`Column "${c.name}" has ${missPct}% missing values.`);
      if (c.type === "numeric") {
        const vals = active.data.map((r) => Number(r[c.name])).filter((v) => !isNaN(v));
        if (vals.length > 0) {
          const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
          msgs.push(`Column "${c.name}" has a mean of ${mean.toFixed(2)}.`);
        }
      }
    });
    return msgs.slice(0, 8);
  }, [active]);

  const chartConfig: ChartConfig = { count: { label: "Count", color: "hsl(var(--primary))" } };
  const allCols = [...numericCols, ...textCols];

  if (!active) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Analysis Dashboard</h1>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-12">
            <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No dataset loaded.</p>
            <Button variant="outline" className="mt-3" onClick={() => navigate("/upload")}>Upload Data</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Analysis Dashboard</h1>
        <Select value={col} onValueChange={setSelectedCol}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="Select column" />
          </SelectTrigger>
          <SelectContent>
            {allCols.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              {isNumeric ? "Distribution" : "Category Counts"}: {col}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Column Summary
            <span className="ml-2 text-xs font-normal text-muted-foreground">Click a row to profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-md border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Column</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Type</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Missing</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Unique</th>
                </tr>
              </thead>
              <tbody>
                {active.columns.map((c) => (
                  <tr key={c.name} className="border-b last:border-0">
                    <td className="px-3 py-2 text-xs font-medium text-foreground">{c.name}</td>
                    <td className="px-3 py-2">
                      <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{c.type}</span>
                    </td>
                    <td className="px-3 py-2 text-xs text-foreground">{c.missingCount}</td>
                    <td className="px-3 py-2 text-xs text-foreground">{c.uniqueCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {insights.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Summary Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1.5">
              {insights.map((msg, i) => (
                <li key={i} className="text-sm text-muted-foreground">• {msg}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AnalysisPage;
