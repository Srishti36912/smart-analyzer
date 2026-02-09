import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDataset } from "@/context/DatasetContext";
import { parseFile } from "@/lib/data-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileSpreadsheet, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Upload Data</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload a CSV, Excel (.xlsx), or PDF file to begin analysis.
        </p>
      </div>

      {/* Drop zone */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive ? "border-primary bg-primary/5" : "border-border"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
      >
        <CardContent className="flex flex-col items-center py-16">
          {status === "idle" && (
            <>
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Upload className="h-7 w-7 text-muted-foreground" />
              </div>
              <p className="text-base font-medium text-foreground">
                Drag & drop your file here
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                or click to browse — CSV, Excel, PDF supported
              </p>
              <label className="mt-4">
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls,.pdf"
                  onChange={onInputChange}
                />
                <Button variant="outline" asChild>
                  <span>Browse Files</span>
                </Button>
              </label>
            </>
          )}

          {status === "loading" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Parsing {file?.name}...</p>
            </div>
          )}

          {status === "success" && file && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-7 w-7 text-destructive" />
              </div>
              <p className="max-w-md text-center text-sm text-destructive">{errorMsg}</p>
              <label>
                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls,.pdf"
                  onChange={onInputChange}
                />
                <Button variant="outline" size="sm" asChild>
                  <span>Try Another File</span>
                </Button>
              </label>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CTA */}
      {status === "success" && (
        <div className="flex justify-end">
          <Button size="lg" onClick={() => navigate("/cleaning")}>
            Start Analysis <FileSpreadsheet className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload another */}
      {(status === "success") && (
        <div className="text-center">
          <label>
            <input
              type="file"
              className="hidden"
              accept=".csv,.xlsx,.xls,.pdf"
              onChange={onInputChange}
            />
            <Button variant="link" size="sm" asChild>
              <span>Upload a different file</span>
            </Button>
          </label>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
