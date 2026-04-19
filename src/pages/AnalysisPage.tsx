import { useState, useMemo } from "react";
import { useDataset } from "@/context/DatasetContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, BarChart3, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
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
      <div className="space-y-10 py-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gradient">Smart Analyzer</h1>
          <p className="text-muted-foreground">Visualize your processed data here.</p>
        </div>
        <Card className="glass-card bg-transparent border-dashed border-white/10">
          <CardContent className="flex flex-col items-center py-20">
            <div className="mb-6 h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">No Data to Analyze</p>
            <p className="text-sm text-muted-foreground mt-2">Upload and clean data to unlock the dashboard.</p>
            <Button size="lg" variant="default" className="mt-8 rounded-full px-8 shadow-lg shadow-primary/20" onClick={() => navigate("/upload")}>
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-10 py-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            <span className="text-gradient">Smart Analyzer</span>
          </h1>
          <p className="text-muted-foreground">
            Visualize patterns and uncover deeper insights.
          </p>
        </div>
        <Select value={col} onValueChange={setSelectedCol}>
          <SelectTrigger className="w-full sm:w-64 glass shadow-sm py-6">
            <SelectValue placeholder="Select column for analysis" />
          </SelectTrigger>
          <SelectContent className="glass">
            {allCols.map((c) => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {chartData.length > 0 && (
        <Card className="glass-card bg-transparent border-none overflow-hidden">
          <CardHeader className="pb-3 border-b border-white/5 bg-accent/20">
            <CardTitle className="text-lg font-bold flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg brand-gradient shadow-md">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span>{isNumeric ? "Distribution Analysis" : "Categorical Overview"}: {col}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <BarChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-white/5" />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <ChartTooltip content={<ChartTooltipContent className="glass shadow-2xl" />} />
                <Bar
                  dataKey="count"
                  fill="url(#barGradient)"
                  radius={[6, 6, 0, 0]}
                  animationDuration={1500}
                />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                    <stop offset="100%" stopColor="hsl(var(--info))" stopOpacity={0.5} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="glass-card bg-transparent lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-3 border-b border-white/5 bg-accent/30">
            <CardTitle className="text-base font-bold flex items-center justify-between">
              <span>Detailed Column Metrics</span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-white/5 px-2 py-1 rounded">interactive report</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-auto max-h-[500px]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="bg-accent/90 backdrop-blur-md border-b border-white/10">
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Column Name</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Data Type</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Missing</th>
                    <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Unique</th>
                  </tr>
                </thead>
                <tbody>
                  {active.columns.map((c) => (
                    <tr
                      key={c.name}
                      className="border-b border-white/5 last:border-0 cursor-pointer hover:bg-white/5 transition-all group"
                      onClick={() => setProfileCol(c)}
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                          <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-full bg-white/5 border border-white/5 px-2 py-0.5 text-[10px] font-bold text-muted-foreground uppercase">{c.type}</span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-foreground font-medium">{c.missingCount}</td>
                      <td className="px-4 py-3.5 text-xs text-foreground font-medium">{c.uniqueCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {insights.length > 0 && (
          <Card className="glass-card bg-transparent lg:col-span-1 h-fit border-none shadow-primary/5">
            <div className="h-1 w-full bg-primary rounded-t-xl" />
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Smart Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {insights.map((msg, i) => (
                  <li key={i} className="flex gap-3 text-sm animate-in slide-in-from-right-4 transition-all duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                    <span className="text-muted-foreground leading-relaxed leading-6">{msg}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      <ColumnProfileDrawer
        open={!!profileCol}
        onOpenChange={(open) => !open && setProfileCol(null)}
        column={profileCol}
        data={active.data}
        totalRows={active.rows}
      />
    </div>
  );
};


export default AnalysisPage;
