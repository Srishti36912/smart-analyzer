import type { DatasetInfo, CleaningOptions, DatasetColumn } from "@/context/DatasetContext";

function getMode(values: number[]): number {
  const freq: Record<number, number> = {};
  values.forEach((v) => { freq[v] = (freq[v] || 0) + 1; });
  let maxFreq = 0, mode = values[0];
  Object.entries(freq).forEach(([val, count]) => {
    if (count > maxFreq) { maxFreq = count; mode = Number(val); }
  });
  return mode;
}

export function applyCleaningOptions(dataset: DatasetInfo, options: CleaningOptions): DatasetInfo {
  let data = dataset.data.map((row) => ({ ...row }));

  // Remove duplicates
  if (options.removeDuplicates) {
    const seen = new Set<string>();
    data = data.filter((row) => {
      const key = JSON.stringify(row);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  // Handle missing values
  if (options.handleMissing === "remove_rows") {
    data = data.filter((row) =>
      Object.values(row).every((v) => v !== null && v !== undefined && v !== "")
    );
  } else if (options.handleMissing !== "none") {
    const numericCols = dataset.columns.filter((c) => c.type === "numeric").map((c) => c.name);

    numericCols.forEach((col) => {
      const validValues = data
        .map((row) => Number(row[col]))
        .filter((v) => !isNaN(v));

      if (validValues.length === 0) return;

      let fillValue: number;
      if (options.handleMissing === "fill_mean") {
        fillValue = validValues.reduce((a, b) => a + b, 0) / validValues.length;
      } else if (options.handleMissing === "fill_median") {
        const sorted = [...validValues].sort((a, b) => a - b);
        fillValue = sorted.length % 2 === 0
          ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
          : sorted[Math.floor(sorted.length / 2)];
      } else {
        fillValue = getMode(validValues);
      }

      data.forEach((row) => {
        if (row[col] === null || row[col] === undefined || row[col] === "" || isNaN(Number(row[col]))) {
          row[col] = fillValue;
        }
      });
    });
  }

  // Standardize column names
  if (options.standardizeColumns) {
    data = data.map((row) => {
      const newRow: Record<string, unknown> = {};
      Object.entries(row).forEach(([key, val]) => {
        const newKey = key.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
        newRow[newKey] = val;
      });
      return newRow;
    });
  }

  // Recalculate stats
  const colNames = Object.keys(data[0] || {});
  let totalMissing = 0;
  const totalCells = data.length * colNames.length;

  const columns: DatasetColumn[] = colNames.map((name) => {
    const values = data.map((r) => r[name]);
    const missingCount = values.filter((v) => v === null || v === undefined || v === "").length;
    totalMissing += missingCount;
    const sample = values.filter((v) => v !== null && v !== undefined && v !== "").slice(0, 100);
    const numCount = sample.filter((v) => !isNaN(Number(v))).length;
    const type = sample.length > 0 && numCount / sample.length > 0.8 ? "numeric" as const : "text" as const;
    return { name, type, missingCount, uniqueCount: new Set(values.filter(Boolean)).size };
  });

  const seen = new Set<string>();
  let duplicateCount = 0;
  for (const row of data) {
    const key = JSON.stringify(row);
    if (seen.has(key)) duplicateCount++;
    else seen.add(key);
  }

  return {
    ...dataset,
    rows: data.length,
    columns,
    data,
    duplicateCount,
    missingPercentage: totalCells > 0 ? (totalMissing / totalCells) * 100 : 0,
  };
}
