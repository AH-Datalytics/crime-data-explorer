"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCSV, downloadCSV } from "@/lib/chart-utils";

interface Column<T> {
  key: string;
  label: string;
  format?: (value: unknown, row: T) => string;
  align?: "left" | "right";
  sortable?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title: string;
  tableId: string;
  showExport?: boolean;
}

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  title,
  tableId,
  showExport = true,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const sorted = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (typeof av === "number" && typeof bv === "number") {
        return sortDir === "asc" ? av - bv : bv - av;
      }
      return sortDir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [data, sortKey, sortDir]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const handleCSV = () => {
    const headers = columns.map((c) => c.label);
    const rows = data.map((row) =>
      columns.map((c) => {
        const val = row[c.key];
        return c.format ? c.format(val, row) : String(val ?? "");
      }),
    );
    downloadCSV(`${tableId}.csv`, generateCSV(headers, rows));
  };

  return (
    <div className="rounded-lg border border-border bg-white">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="font-serif text-sm font-bold text-navy">{title}</h3>
        {showExport && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCSV} title="Download CSV">
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-2 font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground ${
                    col.align === "right" ? "text-right" : "text-left"
                  }`}
                >
                  {col.sortable !== false ? (
                    <button
                      className="inline-flex items-center gap-1 hover:text-navy"
                      onClick={() => handleSort(col.key)}
                    >
                      {col.label}
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50">
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-2 font-mono text-xs tabular-nums ${
                      col.align === "right" ? "text-right" : "text-left"
                    }`}
                  >
                    {col.format
                      ? col.format(row[col.key], row)
                      : String(row[col.key] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
