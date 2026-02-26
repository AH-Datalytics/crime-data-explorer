"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Download, FileSpreadsheet, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KPIBanner } from "@/components/shared/kpi-banner";
import { Loading } from "@/components/shared/loading";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAllAgencies, useCDEAgenciesByState } from "@/lib/hooks/use-crime-data";
import { US_STATES } from "@/lib/us-states";
import { generateCSV, downloadCSV, downloadExcel } from "@/lib/chart-utils";
import type { AgencyListItem, KPIMetric } from "@/lib/types";

export default function AgenciesBrowsePage() {
  const [stateAbbr, setStateAbbr] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Use per-state when selected, otherwise all
  const { data: stateAgencies, isLoading: loadingState } = useCDEAgenciesByState(stateAbbr);
  const { data: allAgencies, isLoading: loadingAll } = useAllAgencies();

  const agencies: AgencyListItem[] = stateAbbr
    ? (stateAgencies ?? [])
    : (allAgencies ?? []);
  const isLoading = stateAbbr ? loadingState : loadingAll;

  // Sort alphabetically
  const sorted = useMemo(
    () => [...agencies].sort((a, b) => (a.agency_name ?? "").localeCompare(b.agency_name ?? "")),
    [agencies],
  );

  const filtered = search
    ? sorted.filter((a) => {
        const q = search.toLowerCase();
        return (
          a.agency_name?.toLowerCase().includes(q) ||
          a.ori?.toLowerCase().includes(q) ||
          a.county_name?.toLowerCase().includes(q) ||
          a.agency_type_name?.toLowerCase().includes(q) ||
          a.state_name?.toLowerCase().includes(q)
        );
      })
    : sorted;

  // KPI summary
  const kpis: KPIMetric[] = [
    { label: "Total Agencies", value: filtered.length, format: "number" },
    { label: "NIBRS Reporting", value: filtered.filter((a) => a.nibrs).length, format: "number" },
    {
      label: "Agency Types",
      value: new Set(filtered.map((a) => a.agency_type_name)).size,
      format: "number",
    },
    {
      label: stateAbbr ? "Counties" : "States",
      value: stateAbbr
        ? new Set(filtered.map((a) => a.county_name)).size
        : new Set(filtered.map((a) => a.state_abbr)).size,
      format: "number",
    },
  ];

  const getExportRows = () =>
    filtered.map((a) => [
      a.agency_name,
      a.ori,
      a.agency_type_name,
      a.county_name,
      a.state_abbr,
      a.state_name,
      a.nibrs ? "Yes" : "No",
    ]);

  const HEADERS = ["Agency Name", "ORI", "Type", "County", "State", "State Name", "NIBRS"];

  const handleExportCSV = () => {
    downloadCSV("agencies.csv", generateCSV(HEADERS, getExportRows()));
  };

  const handleExportExcel = () => {
    downloadExcel("agencies.xlsx", HEADERS, getExportRows());
  };

  // Pagination
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 50;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  // Reset page when filters change
  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(0);
  };
  const handleState = (v: string | null) => {
    setStateAbbr(v);
    setSearch("");
    setPage(0);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <PageHeader
        title="Agency Browser"
        description="Browse and search 19,000+ law enforcement agencies reporting crime data to the FBI. Filter by state, search by name or ORI, then click any agency for detailed crime statistics."
      />

      {/* Controls */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Select
          value={stateAbbr || "all"}
          onValueChange={(v) => handleState(v === "all" ? null : v)}
        >
          <SelectTrigger className="h-9 w-[200px] text-sm">
            <SelectValue placeholder="All States" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All States</SelectItem>
            {Object.entries(US_STATES).map(([abbr, name]) => (
              <SelectItem key={abbr} value={abbr}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center rounded-md border border-border bg-white px-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={
              isLoading
                ? "Loading agencies..."
                : `Search ${agencies.length.toLocaleString()} agencies...`
            }
            className="h-9 w-[280px] bg-transparent px-2 text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={handleExportCSV}
            disabled={filtered.length === 0}
          >
            <Download className="mr-1 h-3.5 w-3.5" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 text-xs"
            onClick={handleExportExcel}
            disabled={filtered.length === 0}
          >
            <FileSpreadsheet className="mr-1 h-3.5 w-3.5" />
            Excel
          </Button>
        </div>
      </div>

      {/* KPI Banner */}
      {!isLoading && agencies.length > 0 && (
        <div className="mt-4">
          <KPIBanner metrics={kpis} />
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="mt-8">
          <Loading />
        </div>
      )}

      {/* Results table */}
      {!isLoading && filtered.length > 0 && (
        <div className="mt-4">
          <div className="rounded-lg border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-sm font-bold text-navy">
                  {stateAbbr
                    ? `Agencies in ${US_STATES[stateAbbr]}`
                    : "All Agencies"}
                </h3>
                <span className="font-mono text-[10px] text-muted-foreground">
                  {filtered.length.toLocaleString()} results
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-4 py-2 text-left font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Agency Name
                    </th>
                    <th className="px-4 py-2 text-left font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      ORI
                    </th>
                    <th className="px-4 py-2 text-left font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      County
                    </th>
                    {!stateAbbr && (
                      <th className="px-4 py-2 text-left font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        State
                      </th>
                    )}
                    <th className="px-4 py-2 text-left font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      NIBRS
                    </th>
                    <th className="px-4 py-2 text-right font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                      Detail
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((a) => (
                    <tr
                      key={a.ori}
                      className="border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      <td className="px-4 py-2 text-xs font-medium text-navy">
                        {a.agency_name}
                      </td>
                      <td className="px-4 py-2 font-mono text-xs tabular-nums text-muted-foreground">
                        {a.ori}
                      </td>
                      <td className="px-4 py-2 text-xs">{a.agency_type_name}</td>
                      <td className="px-4 py-2 text-xs">{a.county_name}</td>
                      {!stateAbbr && (
                        <td className="px-4 py-2 text-xs">{a.state_abbr}</td>
                      )}
                      <td className="px-4 py-2 text-xs">
                        {a.nibrs ? (
                          <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                            Yes
                          </span>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Link
                          href={`/agency/${a.ori}`}
                          className="inline-flex items-center gap-1 text-xs text-navy hover:underline"
                        >
                          View
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filtered.length > PAGE_SIZE && (
              <div className="flex items-center justify-between border-t border-border px-4 py-2">
                <span className="text-xs text-muted-foreground">
                  {page * PAGE_SIZE + 1}–
                  {Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length.toLocaleString()}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage(page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && agencies.length > 0 && (
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            No agencies found for &quot;{search}&quot;. Try a different search term.
          </p>
        </div>
      )}
    </div>
  );
}
