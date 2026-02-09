import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { DatasetInfo, DatasetColumn } from "@/context/DatasetContext";

function detectColumnType(values: unknown[]): "numeric" | "text" | "date" | "unknown" {
  const sample = values.filter((v) => v !== null && v !== undefined && v !== "").slice(0, 100);
  if (sample.length === 0) return "unknown";

  const numCount = sample.filter((v) => !isNaN(Number(v))).length;
  if (numCount / sample.length > 0.8) return "numeric";

  const dateCount = sample.filter((v) => !isNaN(Date.parse(String(v)))).length;
  if (dateCount / sample.length > 0.8) return "date";

  return "text";
}

function analyzeData(data: Record<string, unknown>[], fileName: string, fileSize: number, fileType: string): DatasetInfo {
  if (data.length === 0) {
    return {
      fileName, fileSize, fileType, uploadedAt: new Date(),
      rows: 0, columns: [], data: [], duplicateCount: 0, missingPercentage: 0,
    };
  }

  const colNames = Object.keys(data[0]);
  let totalMissing = 0;
  const totalCells = data.length * colNames.length;

  const columns: DatasetColumn[] = colNames.map((name) => {
    const values = data.map((row) => row[name]);
    const missingCount = values.filter((v) => v === null || v === undefined || v === "").length;
    totalMissing += missingCount;
    const uniqueCount = new Set(values.filter((v) => v !== null && v !== undefined && v !== "")).size;
    return { name, type: detectColumnType(values), missingCount, uniqueCount };
  });

  // Count duplicates
  const seen = new Set<string>();
  let duplicateCount = 0;
  for (const row of data) {
    const key = JSON.stringify(row);
    if (seen.has(key)) duplicateCount++;
    else seen.add(key);
  }

  return {
    fileName, fileSize, fileType, uploadedAt: new Date(),
    rows: data.length, columns, data,
    duplicateCount,
    missingPercentage: totalCells > 0 ? (totalMissing / totalCells) * 100 : 0,
  };
}

export async function parseCSV(file: File): Promise<DatasetInfo> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(analyzeData(results.data as Record<string, unknown>[], file.name, file.size, "csv"));
      },
      error: (err) => reject(new Error(err.message)),
    });
  });
}

export async function parseExcel(file: File): Promise<DatasetInfo> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];
  return analyzeData(data, file.name, file.size, "xlsx");
}

export async function parsePDF(file: File): Promise<DatasetInfo> {
  // Basic PDF text extraction - limited but functional for tabular PDFs
  const text = await file.text();
  const lines = text.split("\n").filter((l) => l.trim());
  
  if (lines.length < 2) {
    throw new Error("Could not extract tabular data from this PDF. Try converting to CSV first.");
  }

  // Attempt simple CSV-like parsing from text
  const delimiter = lines[0].includes("\t") ? "\t" : ",";
  const headers = lines[0].split(delimiter).map((h) => h.trim());
  const data = lines.slice(1).map((line) => {
    const values = line.split(delimiter);
    const row: Record<string, unknown> = {};
    headers.forEach((h, i) => { row[h] = values[i]?.trim() ?? ""; });
    return row;
  });

  return analyzeData(data, file.name, file.size, "pdf");
}

export function parseFile(file: File): Promise<DatasetInfo> {
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "csv") return parseCSV(file);
  if (ext === "xlsx" || ext === "xls") return parseExcel(file);
  if (ext === "pdf") return parsePDF(file);
  throw new Error(`Unsupported file type: .${ext}. Please use CSV, Excel, or PDF files.`);
}

export { analyzeData };
