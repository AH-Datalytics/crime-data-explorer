"use client";

import { useState, useMemo } from "react";
import { ArrowUpDown, Download, FileSpreadsheet, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateCSV, downloadCSV, downloadExcel } from "@/lib/chart-utils";

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
  pageSize?: number;
}

const PAGE_SIZES = [25, 50, 100];

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  title,
  tableId,
  showExport = true,
  pageSize: initialPageSize = 25,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(initialPageSize);

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

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize);
  const showPagination = data.length > PAGE_SIZES[0];

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
    setPage(0);
  };

  const getRawRows = () =>
    data.map((row) =>
      columns.map((c) => {
        const val = row[c.key];
        return c.format ? c.format(val, row) : (val ?? "");
      }),
    );

  const handleCSV = () => {
    const headers = columns.map((c) => c.label);
    downloadCSV(`${tableId}.csv`, generateCSV(headers, getRawRows() as (string | number)[][]));
  };

  const handleExcel = () => {
    const headers = columns.map((c) => c.label);
    downloadExcel(`${tableId}.xlsx`, headers, getRawRows() as (string | number)[][]);
  };

  return (
    <div className="rounded-lg border border-border bg-white">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-serif text-sm font-bold text-navy">{title}</h3>
          <span className="font-mono text-[10px] text-muted-foreground">
            {data.length.toLocaleString()} rows
          </span>
        </div>
        {showExport && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCSV} title="Download CSV">
              <Download className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleExcel} title="Download Excel">
              <FileSpreadsheet className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
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
            {paginated.map((row, i) => (
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

      {showPagination && (
        <div className="flex items-center justify-between border-t border-border px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(0); }}
              className="h-7 rounded border border-border bg-white px-1 text-xs"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length.toLocaleString()}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
