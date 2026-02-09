import { useDataset } from "@/context/DatasetContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, BarChart3, Sparkles, FileText, ArrowRight } from "lucide-react";

const HomePage = () => {
  const { dataset } = useDataset();
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Welcome to DataClean</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload datasets, assess quality, clean issues, and generate insights — no code required.
        </p>
      </div>

      {/* Quick start */}
      {!dataset ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center py-12">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">Upload your first dataset</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Drag and drop a CSV, Excel, or PDF file to get started
            </p>
            <Button className="mt-4" onClick={() => navigate("/upload")}>
              <Upload className="mr-2 h-4 w-4" /> Upload Data
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Dataset summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Current Dataset: {dataset.fileName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard label="Rows" value={dataset.rows.toLocaleString()} />
                <StatCard label="Columns" value={dataset.columns.length.toString()} />
                <StatCard
                  label="Missing"
                  value={`${dataset.missingPercentage.toFixed(1)}%`}
                  status={dataset.missingPercentage < 5 ? "good" : dataset.missingPercentage < 15 ? "warn" : "bad"}
                />
                <StatCard
                  label="Duplicates"
                  value={dataset.duplicateCount.toString()}
                  status={dataset.duplicateCount === 0 ? "good" : "warn"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <div className="grid gap-4 sm:grid-cols-3">
            <QuickAction
              icon={Sparkles}
              title="Clean Data"
              desc="Remove duplicates, handle missing values"
              onClick={() => navigate("/cleaning")}
            />
            <QuickAction
              icon={BarChart3}
              title="Analyze"
              desc="Visualize distributions and correlations"
              onClick={() => navigate("/analysis")}
            />
            <QuickAction
              icon={FileText}
              title="Export Report"
              desc="Download cleaned data and insights"
              onClick={() => navigate("/reports")}
            />
          </div>
        </>
      )}
    </div>
  );
};

function StatCard({ label, value, status }: { label: string; value: string; status?: "good" | "warn" | "bad" }) {
  const colors = {
    good: "text-success",
    warn: "text-warning",
    bad: "text-destructive",
  };
  return (
    <div className="rounded-lg border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${status ? colors[status] : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <Card
      className="cursor-pointer transition-colors hover:bg-accent/50"
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">{title}</p>
          <p className="text-xs text-muted-foreground">{desc}</p>
        </div>
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
      </CardContent>
    </Card>
  );
}

export default HomePage;
