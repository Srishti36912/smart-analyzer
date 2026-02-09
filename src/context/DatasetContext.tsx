import React, { createContext, useContext, useState, useCallback } from "react";

export interface DatasetColumn {
  name: string;
  type: "numeric" | "text" | "date" | "unknown";
  missingCount: number;
  uniqueCount: number;
}

export interface DatasetInfo {
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  rows: number;
  columns: DatasetColumn[];
  data: Record<string, unknown>[];
  duplicateCount: number;
  missingPercentage: number;
}

export interface CleaningOptions {
  removeDuplicates: boolean;
  handleMissing: "none" | "remove_rows" | "fill_mean" | "fill_median" | "fill_mode";
  standardizeColumns: boolean;
}

interface DatasetContextType {
  dataset: DatasetInfo | null;
  cleanedDataset: DatasetInfo | null;
  isProcessing: boolean;
  setDataset: (d: DatasetInfo | null) => void;
  setCleanedDataset: (d: DatasetInfo | null) => void;
  setIsProcessing: (v: boolean) => void;
  cleaningOptions: CleaningOptions;
  setCleaningOptions: (o: CleaningOptions) => void;
  history: { action: string; timestamp: Date }[];
  addHistory: (action: string) => void;
}

const DatasetContext = createContext<DatasetContextType | null>(null);

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const [dataset, setDataset] = useState<DatasetInfo | null>(null);
  const [cleanedDataset, setCleanedDataset] = useState<DatasetInfo | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cleaningOptions, setCleaningOptions] = useState<CleaningOptions>({
    removeDuplicates: false,
    handleMissing: "none",
    standardizeColumns: false,
  });
  const [history, setHistory] = useState<{ action: string; timestamp: Date }[]>([]);

  const addHistory = useCallback((action: string) => {
    setHistory((prev) => [...prev, { action, timestamp: new Date() }]);
  }, []);

  return (
    <DatasetContext.Provider
      value={{
        dataset,
        cleanedDataset,
        isProcessing,
        setDataset,
        setCleanedDataset,
        setIsProcessing,
        cleaningOptions,
        setCleaningOptions,
        history,
        addHistory,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error("useDataset must be used within DatasetProvider");
  return ctx;
}
