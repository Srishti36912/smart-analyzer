import { useMemo } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import type { DatasetColumn, DatasetInfo } from "@/context/DatasetContext";

interface ColumnProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: DatasetColumn | null;
  data: DatasetInfo["data"];
  totalRows: number;
}

export function ColumnProfileDrawer({ open, onOpenChange, column, data, totalRows }: ColumnProfileDrawerProps) {
  const profile = useMemo(() => {
    if (!column) return null;

    const values = data.map((r) => r[column.name]);
    const nonEmpty = values.filter((v) => v !== null && v !== undefined && v !== "");
    const missingPct = totalRows > 0 ? (column.missingCount / totalRows) * 100 : 0;

    if (column.type === "numeric") {
      const nums = nonEmpty.map(Number).filter((v) => !isNaN(v));
      const sorted = [...nums].sort((a, b) => a - b);
      const mean = nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
      const median = nums.length > 0
        ? nums.length % 2 === 0
          ? (sorted[nums.length / 2 - 1] + sorted[nums.length / 2]) / 2
          : sorted[Math.floor(nums.length / 2)]
        : 0;
      const min = nums.length > 0 ? sorted[0] : 0;
      const max = nums.length > 0 ? sorted[sorted.length - 1] : 0;
      const stdDev = nums.length > 0
        ? Math.sqrt(nums.reduce((sum, v) => sum + (v - mean) ** 2, 0) / nums.length)
        : 0;

      return { missingPct, mean, median, min, max, stdDev, type: "numeric" as const };
    }

    // Categorical
    const freq: Record<string, number> = {};
    nonEmpty.forEach((v) => {
      const key = String(v);
      freq[key] = (freq[key] || 0) + 1;
    });
    const topCategories = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);

    return { missingPct, topCategories, type: "text" as const };
  }, [column, data, totalRows]);

  if (!column || !profile) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[380px] sm:w-[420px] overflow-y-auto">
        <SheetHeader className="pb-4">
          <SheetTitle className="flex items-center gap-2 text-lg">
            {column.name}
            <Badge variant="secondary" className="text-xs font-normal">
              {column.type}
            </Badge>
          </SheetTitle>
          <SheetDescription>Column profiling details</SheetDescription>
        </SheetHeader>

        <div className="space-y-5">
          {/* Overview stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatBlock label="Unique Values" value={column.uniqueCount.toLocaleString()} />
            <StatBlock label="Missing Values" value={column.missingCount.toLocaleString()} />
            <StatBlock label="Total Rows" value={totalRows.toLocaleString()} />
            <StatBlock label="Data Type" value={column.type} />
          </div>

          <Separator />

          {/* Missing bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Missing</span>
              <span className="font-medium text-foreground">{profile.missingPct.toFixed(1)}%</span>
            </div>
            <Progress value={profile.missingPct} className="h-2" />
          </div>

          <Separator />

          {/* Numeric stats */}
          {profile.type === "numeric" && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Numeric Summary</h4>
              <div className="grid grid-cols-2 gap-3">
                <StatBlock label="Mean" value={profile.mean.toFixed(2)} />
                <StatBlock label="Median" value={profile.median.toFixed(2)} />
                <StatBlock label="Min" value={profile.min.toFixed(2)} />
                <StatBlock label="Max" value={profile.max.toFixed(2)} />
                <StatBlock label="Std Dev" value={profile.stdDev.toFixed(2)} />
              </div>
            </div>
          )}

          {/* Categorical stats */}
          {profile.type === "text" && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground">Top Categories</h4>
              <div className="space-y-2">
                {profile.topCategories.map(([label, count]) => {
                  const pct = totalRows > 0 ? (count / totalRows) * 100 : 0;
                  return (
                    <div key={label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="truncate text-foreground max-w-[200px]">{label}</span>
                        <span className="text-muted-foreground shrink-0 ml-2">{count} ({pct.toFixed(1)}%)</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-muted/30 px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
