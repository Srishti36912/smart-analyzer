import { useDataset } from "@/context/DatasetContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileText, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ReportsPage = () => {
  const { dataset, cleanedDataset, history } = useDataset();
  const navigate = useNavigate();
  const { toast } = useToast();
  const active = cleanedDataset || dataset;

  if (!active) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Reports & Export</h1>
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

  const downloadCSV = () => {
    const cols = active.columns.map((c) => c.name);
    const header = cols.join(",");
    const rows = active.data.map((row) =>
      cols.map((c) => {
        const val = String(row[c] ?? "");
        return val.includes(",") ? `"${val}"` : val;
      }).join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cleaned_${active.fileName.replace(/\.[^.]+$/, "")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Download started", description: "Cleaned dataset CSV is downloading." });
  };

  const downloadReport = () => {
    const lines = [
      "DATA ANALYSIS REPORT",
      "=" .repeat(40),
      "",
      `File: ${active.fileName}`,
      `Date: ${new Date().toLocaleDateString()}`,
      `Rows: ${active.rows}`,
      `Columns: ${active.columns.length}`,
      `Missing: ${active.missingPercentage.toFixed(1)}%`,
      `Duplicates: ${active.duplicateCount}`,
      "",
      "COLUMN DETAILS",
      "-".repeat(40),
      ...active.columns.map(
        (c) => `  ${c.name} (${c.type}) — ${c.missingCount} missing, ${c.uniqueCount} unique`
      ),
      "",
      "PROCESSING HISTORY",
      "-".repeat(40),
      ...history.map((h) => `  [${h.timestamp.toLocaleTimeString()}] ${h.action}`),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report_${active.fileName.replace(/\.[^.]+$/, "")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Report downloaded", description: "Analysis summary report is downloading." });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Reports & Export</h1>

      {/* Dataset info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Dataset Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">File</span><span className="font-medium text-foreground">{active.fileName}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Uploaded</span><span className="font-medium text-foreground">{active.uploadedAt.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Rows</span><span className="font-medium text-foreground">{active.rows.toLocaleString()}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Columns</span><span className="font-medium text-foreground">{active.columns.length}</span></div>
        </CardContent>
      </Card>

      {/* Downloads */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="cursor-pointer transition-colors hover:bg-accent/50" onClick={downloadCSV}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10">
              <Download className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Download Cleaned CSV</p>
              <p className="text-xs text-muted-foreground">Export processed dataset</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-accent/50" onClick={downloadReport}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info/10">
              <FileText className="h-5 w-5 text-info" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Download Analysis Report</p>
              <p className="text-xs text-muted-foreground">Summary with column details</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History */}
      {history.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" /> Processing History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {history.map((h, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {h.timestamp.toLocaleTimeString()}
                  </span>
                  <span className="text-foreground">{h.action}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;
