import { useDataset } from "@/context/DatasetContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, BarChart3, Sparkles, FileText, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const HomePage = () => {
  const { dataset } = useDataset();
  const navigate = useNavigate();

  return (
    <div className="space-y-12 py-4">
      {/* Welcome */}
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          <span className="text-gradient">Smart Analyzer</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Transform your raw data into professional insights with our smart cleaning and analytics platform.
        </p>
      </div>

      {/* Quick start */}
      {!dataset ? (
        <Card className="glass-card border-dashed bg-transparent overflow-hidden">
          <CardContent className="flex flex-col items-center py-20 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-info/5 pointer-events-none" />
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl brand-gradient shadow-xl shadow-primary/20 animate-in fade-in zoom-in duration-500">
              <Upload className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Ready to start?</h2>
            <p className="mt-2 text-center text-muted-foreground">
              Drop your CSV, Excel, or PDF file here to begin your data journey
            </p>
            <Button size="lg" className="mt-8 rounded-full px-8 shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95" onClick={() => navigate("/upload")}>
              <Upload className="mr-2 h-5 w-5" /> Start Analyzing
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Dataset summary */}
          <Card className="glass-card bg-transparent">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Active Dataset: {dataset.fileName}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                <StatCard label="Total Rows" value={dataset.rows.toLocaleString()} />
                <StatCard label="Total Columns" value={dataset.columns.length.toString()} />
                <StatCard
                  label="Data Health"
                  value={`${(100 - dataset.missingPercentage).toFixed(1)}%`}
                  status={dataset.missingPercentage < 5 ? "good" : dataset.missingPercentage < 15 ? "warn" : "bad"}
                />
                <StatCard
                  label="Clean State"
                  value={dataset.duplicateCount === 0 ? "Perfect" : `${dataset.duplicateCount} Dups`}
                  status={dataset.duplicateCount === 0 ? "good" : "warn"}
                />
              </div>
            </CardContent>
          </Card>

          {/* Quick actions */}
          <div className="grid gap-6 sm:grid-cols-3">
            <QuickAction
              icon={Sparkles}
              title="Clean Data"
              desc="Remove duplicates, handle missing values"
              onClick={() => navigate("/cleaning")}
              color="bg-purple-500/10 text-purple-500"
            />
            <QuickAction
              icon={BarChart3}
              title="Analyze"
              desc="Visualize distributions and correlations"
              onClick={() => navigate("/analysis")}
              color="bg-blue-500/10 text-blue-500"
            />
            <QuickAction
              icon={FileText}
              title="Export Report"
              desc="Download cleaned data and insights"
              onClick={() => navigate("/reports")}
              color="bg-emerald-500/10 text-emerald-500"
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
    <div className="space-y-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className={`text-3xl font-bold tracking-tight ${status ? colors[status] : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  title,
  desc,
  onClick,
  color,
}: {
  icon: React.ElementType;
  title: string;
  desc: string;
  onClick: () => void;
  color?: string;
}) {
  return (
    <Card
      className="glass-card group cursor-pointer border-none bg-transparent"
      onClick={onClick}
    >
      <CardContent className="flex flex-col gap-4 p-6">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110 group-hover:rotate-3", color || "bg-primary/10 text-primary")}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <p className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{title}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
        </div>
        <div className="pt-2 flex items-center text-xs font-semibold text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
          Get Started <ArrowRight className="ml-1 h-3 w-3" />
        </div>
      </CardContent>
    </Card>
  );
}


export default HomePage;
