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

  if (!dataset) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Data Cleaning</h1>
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

  const handleApply = async () => {
    setIsProcessing(true);
    // Simulate async work
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

  

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Data Cleaning</h1>

      {/* Options */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Cleaning Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Duplicates */}
          <div className="flex items-center justify-between">
            <Label htmlFor="dup" className="text-sm">Remove duplicate rows</Label>
            <Switch
              id="dup"
              checked={cleaningOptions.removeDuplicates}
              onCheckedChange={(v) => updateOption("removeDuplicates", v)}
            />
          </div>

          {/* Missing values */}
          <div className="flex items-center justify-between gap-4">
            <Label className="text-sm shrink-0">Handle missing values</Label>
            <Select
              value={cleaningOptions.handleMissing}
              onValueChange={(v) => updateOption("handleMissing", v as CleaningOptions["handleMissing"])}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Do nothing</SelectItem>
                <SelectItem value="remove_rows">Remove rows</SelectItem>
                <SelectItem value="fill_mean">Fill with mean</SelectItem>
                <SelectItem value="fill_median">Fill with median</SelectItem>
                <SelectItem value="fill_mode">Fill with mode</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Standardize */}
          <div className="flex items-center justify-between">
            <Label htmlFor="std" className="text-sm">Standardize column names (snake_case)</Label>
            <Switch
              id="std"
              checked={cleaningOptions.standardizeColumns}
              onCheckedChange={(v) => updateOption("standardizeColumns", v)}
            />
          </div>

          <Button onClick={handleApply} disabled={isProcessing} className="w-full">
            {isProcessing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
            ) : (
              <><Sparkles className="mr-2 h-4 w-4" /> Apply Cleaning</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Before / After */}
      <div className="grid gap-4 sm:grid-cols-2">
        <MetricCard title="Before" info={dataset} />
        {cleanedDataset && <MetricCard title="After" info={cleanedDataset} />}
      </div>

      {/* Preview table */}
      {cleanedDataset && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cleaned Data Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <DataPreviewTable data={cleanedDataset.data.slice(0, 10)} columns={cleanedDataset.columns.map((c) => c.name)} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

function MetricCard({ title, info }: { title: string; info: { rows: number; missingPercentage: number; duplicateCount: number; columns: { name: string }[] } }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        <Stat label="Rows" value={info.rows.toLocaleString()} />
        <Stat label="Columns" value={info.columns.length.toString()} />
        <Stat label="Missing %" value={`${info.missingPercentage.toFixed(1)}%`} />
        <Stat label="Duplicates" value={info.duplicateCount.toString()} />
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

function DataPreviewTable({ data, columns }: { data: Record<string, unknown>[]; columns: string[] }) {
  return (
    <div className="overflow-auto rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {columns.map((col) => (
              <th key={col} className="px-3 py-2 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b last:border-0">
              {columns.map((col) => (
                <td key={col} className="px-3 py-2 text-xs text-foreground whitespace-nowrap">
                  {row[col] === null || row[col] === undefined || row[col] === ""
                    ? <span className="text-muted-foreground italic">empty</span>
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
