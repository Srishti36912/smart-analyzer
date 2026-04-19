import { useState } from "react";
import { useDataset } from "@/context/DatasetContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { applyCleaningOptions } from "@/lib/cleaning-utils";
import { Sparkles, Loader2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ColumnProfileDrawer } from "@/components/ColumnProfileDrawer";
import type { CleaningOptions, DatasetColumn } from "@/context/DatasetContext";

const CleaningPage = () => {
  const {
    dataset, cleanedDataset, setCleanedDataset,
    isProcessing, setIsProcessing,
    cleaningOptions, setCleaningOptions,
    addHistory,
  } = useDataset();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileCol, setProfileCol] = useState<DatasetColumn | null>(null);

  if (!dataset) {
    return (
      <div className="space-y-10 py-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gradient">Smart Analyzer</h1>
          <p className="text-muted-foreground">Please upload data to begin cleaning.</p>
        </div>
        <Card className="glass-card bg-transparent border-dashed border-white/10">
          <CardContent className="flex flex-col items-center py-20">
            <div className="mb-6 h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">No Dataset Found</p>
            <p className="text-sm text-muted-foreground mt-2">Active session data is required to access tools.</p>
            <Button size="lg" variant="default" className="mt-8 rounded-full px-8 shadow-lg shadow-primary/20" onClick={() => navigate("/upload")}>
              Go to Upload
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleApply = async () => {
    setIsProcessing(true);
    await new Promise((r) => setTimeout(r, 600));
    const cleaned = applyCleaningOptions(dataset, cleaningOptions);
    setCleanedDataset(cleaned);
    setIsProcessing(false);
    addHistory("Applied data cleaning");
    toast({ title: "Cleaning applied", description: `${cleaned.rows} rows remaining after cleaning.` });
  };

  const updateOption = <K extends keyof CleaningOptions>(key: K, value: CleaningOptions[K]) => {
    setCleaningOptions({ ...cleaningOptions, [key]: value });
  };

  const active = cleanedDataset || dataset;

  return (
    <div className="space-y-10 py-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="text-gradient">Smart Analyzer</span>
        </h1>
        <p className="text-muted-foreground">
          Refine and prep your dataset for analysis.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Options */}
        <Card className="glass-card bg-transparent lg:col-span-1 h-fit">
          <CardHeader className="pb-3 border-b border-white/5">
            <CardTitle className="text-lg font-bold">Cleaning Strategy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="dup" className="text-sm font-medium">Remove Duplicates</Label>
              <Switch id="dup" checked={cleaningOptions.removeDuplicates} onCheckedChange={(v) => updateOption("removeDuplicates", v)} />
            </div>
            <div className="space-y-3">
              <Label className="text-sm font-medium">Missing Values</Label>
              <Select value={cleaningOptions.handleMissing} onValueChange={(v) => updateOption("handleMissing", v as CleaningOptions["handleMissing"])}>
                <SelectTrigger className="w-full bg-accent/50 border-white/10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Do nothing</SelectItem>
                  <SelectItem value="remove_rows">Remove rows</SelectItem>
                  <SelectItem value="fill_mean">Fill with mean</SelectItem>
                  <SelectItem value="fill_median">Fill with median</SelectItem>
                  <SelectItem value="fill_mode">Fill with mode</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="std" className="text-sm font-medium">Standardize Headers</Label>
              <Switch id="std" checked={cleaningOptions.standardizeColumns} onCheckedChange={(v) => updateOption("standardizeColumns", v)} />
            </div>
            <Button onClick={handleApply} disabled={isProcessing} className="w-full rounded-xl shadow-lg shadow-primary/20 mt-4 transition-transform hover:scale-[1.02] active:scale-[0.98]">
              {isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : <><Sparkles className="mr-2 h-4 w-4" /> Apply Cleaning</>}
            </Button>
          </CardContent>
        </Card>

        {/* Before / After Metrics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <MetricCard title="Original Metrics" info={dataset} variant="muted" />
            {cleanedDataset && <MetricCard title="Optimized Metrics" info={cleanedDataset} variant="success" />}
          </div>

          <Card className="glass-card bg-transparent overflow-hidden">
            <CardHeader className="pb-3 border-b border-white/5 bg-accent/30">
              <CardTitle className="text-base font-bold flex items-center justify-between">
                <span>{cleanedDataset ? "Cleaned" : "Preview"} Data</span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-white/5 px-2 py-1 rounded">Interactive</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="px-4 py-2 border-b border-white/5 bg-white/5">
                <span className="text-xs text-muted-foreground font-medium">✨ Click a column header to see detailed insights</span>
              </div>
              <DataPreviewTable
                data={active.data.slice(0, 10)}
                columns={active.columns.map((c) => c.name)}
                onColumnClick={(name) => {
                  const col = active.columns.find((c) => c.name === name);
                  if (col) setProfileCol(col);
                }}
              />
            </CardContent>
          </Card>
        </div>
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

function MetricCard({ title, info, variant }: { title: string; info: any; variant: "muted" | "success" }) {
  return (
    <Card className={cn("glass-card bg-transparent border-none", variant === "success" && "shadow-success/10")}>
      <div className={cn("h-1 w-full rounded-t-xl", variant === "success" ? "bg-success" : "bg-muted-foreground/30")} />
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-y-4 gap-x-2">
        <Stat label="Total Rows" value={info.rows.toLocaleString()} />
        <Stat label="Columns" value={info.columns.length.toString()} />
        <Stat label="Missing Data" value={`${info.missingPercentage.toFixed(1)}%`} />
        <Stat label="Duplicates" value={info.duplicateCount.toString()} />
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-[10px] sm:text-xs font-bold text-muted-foreground/70 uppercase">{label}</p>
      <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

function DataPreviewTable({ data, columns, onColumnClick }: { data: Record<string, unknown>[]; columns: string[]; onColumnClick?: (col: string) => void }) {
  return (
    <div className="overflow-auto max-h-[400px]">
      <table className="w-full text-sm">
        <thead className="sticky top-0 z-10">
          <tr className="bg-accent/80 backdrop-blur-sm border-b border-white/10">
            {columns.map((col) => (
              <th
                key={col}
                className={cn(
                  "px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap",
                  onColumnClick && "cursor-pointer hover:bg-white/5 hover:text-primary transition-all active:scale-95"
                )}
                onClick={() => onColumnClick?.(col)}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
              {columns.map((col) => (
                <td key={col} className="px-4 py-2.5 text-xs text-foreground/80 whitespace-nowrap font-medium">
                  {row[col] === null || row[col] === undefined || row[col] === ""
                    ? <span className="text-muted-foreground/40 italic font-normal">empty</span>
                    : String(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


export default CleaningPage;
