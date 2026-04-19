import { useDataset } from "@/context/DatasetContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload, FileText, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const ReportsPage = () => {
  const { dataset, cleanedDataset, history } = useDataset();
  const navigate = useNavigate();
  const { toast } = useToast();
  const active = cleanedDataset || dataset;

  if (!active) {
    return (
      <div className="space-y-10 py-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-gradient">Smart Analyzer</h1>
          <p className="text-muted-foreground">Export your final results.</p>
        </div>
        <Card className="glass-card bg-transparent border-dashed border-white/10">
          <CardContent className="flex flex-col items-center py-20">
            <div className="mb-6 h-16 w-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-lg font-bold text-foreground">No Reports Available</p>
            <p className="text-sm text-muted-foreground mt-2">Upload and analyze data to generate exportable reports.</p>
            <Button size="lg" variant="default" className="mt-8 rounded-full px-8 shadow-lg shadow-primary/20" onClick={() => navigate("/upload")}>
              Go to Upload
            </Button>
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
      "=".repeat(40),
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
    <div className="space-y-10 py-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="text-gradient">Smart Analyzer</span>
        </h1>
        <p className="text-muted-foreground">
          Ready to present your findings? Download your data and reports here.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1 space-y-6">
          {/* Dataset info */}
          <Card className="glass-card bg-transparent border-none overflow-hidden">
            <div className="h-1 w-full bg-info rounded-t-xl" />
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-lg font-bold">Project Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <MetadataItem label="Source File" value={active.fileName} />
              <MetadataItem label="Generated On" value={active.uploadedAt.toLocaleDateString()} />
              <MetadataItem label="Total Records" value={active.rows.toLocaleString()} />
              <MetadataItem label="Column Count" value={active.columns.length.toString()} />
            </CardContent>
          </Card>

          {/* History */}
          {history.length > 0 && (
            <Card className="glass-card bg-transparent border-none">
              <CardHeader className="pb-3 border-b border-white/5">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" /> Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ul className="space-y-6 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
                  {history.map((h, i) => (
                    <li key={i} className="flex gap-4 relative">
                      <div className="h-4 w-4 rounded-full bg-accent border-2 border-primary mt-1 shrink-0 z-10 box-content -ml-[1px]" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-foreground">{h.action}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">{h.timestamp.toLocaleTimeString()}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div className="grid gap-6 sm:grid-cols-2">
            <DownloadCard
              title="Cleaned Dataset"
              description="Full record export in CSV format"
              onDownload={downloadCSV}
              icon={<Download className="h-6 w-6 text-success" />}
            />
            <DownloadCard
              title="Analysis Summary"
              description="Detailed metrics and column profiles"
              onDownload={downloadReport}
              icon={<FileText className="h-6 w-6 text-info" />}
            />
          </div>

          <Card className="glass-card bg-transparent border-none overflow-hidden">
            <CardHeader className="pb-3 border-b border-white/5 bg-accent/20">
              <CardTitle className="text-lg font-bold">Export Preview</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="rounded-xl border border-white/5 bg-black/20 p-6 font-mono text-[11px] leading-relaxed text-muted-foreground shadow-inner">
                <p className="text-primary/70 mb-2">// DATA ANALYSIS REPORT PREVIEW</p>
                <p>FILE: {active.fileName}</p>
                <p>ROWS: {active.rows}</p>
                <p>COLS: {active.columns.length}</p>
                <p className="mt-4">COLUMN_MAP:</p>
                {active.columns.slice(0, 5).map(c => (
                  <p key={c.name} className="pl-4">• {c.name} ({c.type})</p>
                ))}
                {active.columns.length > 5 && <p className="pl-4 opacity-50">...and {active.columns.length - 5} more</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

function MetadataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1 border-b border-white/5 last:border-0">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-xs font-bold text-foreground truncate max-w-[150px]">{value}</span>
    </div>
  );
}

function DownloadCard({ title, description, onDownload, icon }: { title: string; description: string; onDownload: () => void; icon: React.ReactNode }) {
  return (
    <Card
      className="glass-card bg-transparent cursor-pointer group transition-all hover:scale-[1.02] hover:bg-white/5 active:scale-[0.98] border-none shadow-xl"
      onClick={onDownload}
    >
      <CardContent className="flex items-center gap-5 p-6">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-accent/50 group-hover:brand-gradient group-hover:shadow-lg group-hover:shadow-primary/20 transition-all">
          <div className="group-hover:text-white transition-colors">{icon}</div>
        </div>
        <div>
          <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{title}</p>
          <p className="text-xs text-muted-foreground font-medium">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}


export default ReportsPage;
