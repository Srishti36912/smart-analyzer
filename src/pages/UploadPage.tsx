import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDataset } from "@/context/DatasetContext";
import { parseFile } from "@/lib/data-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, FileText, CheckCircle2, AlertCircle, Loader2, ArrowRight, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const UploadPage = () => {
  const { setDataset, addHistory } = useDataset();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setStatus("loading");
    setErrorMsg("");
    try {
      const dataset = await parseFile(f);
      setDataset(dataset);
      addHistory(`Uploaded file: ${f.name}`);
      setStatus("success");
      toast({ title: "File uploaded successfully", description: `${dataset.rows} rows, ${dataset.columns.length} columns detected.` });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Failed to parse file.");
    }
  }, [setDataset, addHistory, toast]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };


  return (
    <div className="space-y-10 py-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          <span className="text-gradient">Upload Data</span>
        </h1>
        <p className="text-muted-foreground">
          Bring your CSV, Excel, or PDF data to life.
        </p>
      </div>

      {/* Drop zone */}
      <Card
        className={cn(
          "glass-card border-2 border-dashed bg-transparent transition-all duration-300",
          dragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-white/10"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
      >
        <CardContent className="flex flex-col items-center py-24 relative overflow-hidden">
          {dragActive && (
            <div className="absolute inset-0 bg-primary/5 backdrop-blur-[2px] animate-in fade-in duration-200" />
          )}

          {status === "idle" && (
            <>
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl brand-gradient shadow-xl shadow-primary/20">
                <Upload className="h-10 w-10 text-white" />
              </div>
              <p className="text-xl font-bold text-foreground">
                Drag & drop your file here
              </p>
              <p className="mt-2 text-muted-foreground max-w-sm text-center">
                CSV, Excel, and PDF files are supported. Max size 50MB.
              </p>
              <label className="mt-8 transition-transform hover:scale-105 active:scale-95">
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls,.pdf"
                  onChange={onInputChange}
                />
                <Button size="lg" className="rounded-full px-10 shadow-lg shadow-primary/20" asChild>
                  <span>Select Files</span>
                </Button>
              </label>
            </>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Database className="h-8 w-8 text-primary animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">Processing Data</p>
                <p className="text-sm text-muted-foreground">Reading {file?.name}...</p>
              </div>
            </div>
          )}

          {status === "success" && file && (
            <div className="flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-500">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/10 shadow-inner">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground font-medium">{formatSize(file.size)}</p>
              </div>
              <div className="flex flex-col gap-2 w-full max-w-[200px]">
                <Button onClick={() => navigate("/cleaning")} className="rounded-full shadow-lg shadow-primary/10">
                  Continue to Cleaning <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <label className="text-center">
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls,.pdf"
                    onChange={onInputChange}
                  />
                  <Button variant="ghost" size="sm" className="text-muted-foreground w-full" asChild>
                    <span>Upload another</span>
                  </Button>
                </label>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-6 animate-in fade-in shake duration-500">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-10 w-10 text-destructive" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-lg font-bold text-foreground">Upload Failed</p>
                <p className="max-w-md text-sm text-destructive px-6">{errorMsg}</p>
              </div>
              <label className="mt-2 transition-transform hover:scale-105 active:scale-95">
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls,.pdf"
                  onChange={onInputChange}
                />
                <Button variant="default" size="lg" className="rounded-full px-10" asChild>
                  <span>Give it another shot</span>
                </Button>
              </label>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


export default UploadPage;
