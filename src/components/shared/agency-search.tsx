"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Loader2, ChevronDown } from "lucide-react";
import { useAllAgencies, useCDEAgenciesByState } from "@/lib/hooks/use-crime-data";
import type { AgencyListItem } from "@/lib/types";

interface AgencySearchProps {
  /** If set, only show agencies in this state */
  stateAbbr?: string | null;
  /** Currently selected agency ORI */
  value: string | null;
  /** Called when user selects or clears an agency */
  onSelect: (ori: string | null, agency?: AgencyListItem) => void;
  className?: string;
}

export function AgencySearch({
  stateAbbr,
  value,
  onSelect,
  className = "",
}: AgencySearchProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // If state is given, use per-state fetch (fast). Otherwise load all.
  const { data: stateAgencies, isLoading: loadingState } = useCDEAgenciesByState(stateAbbr || null);
  const { data: allAgencies, isLoading: loadingAll } = useAllAgencies();

  const agencies: AgencyListItem[] = stateAbbr
    ? (stateAgencies ?? [])
    : (allAgencies ?? []);
  const isLoading = stateAbbr ? loadingState : loadingAll;

  // Sort alphabetically then filter by search query
  const sorted = [...agencies].sort((a, b) =>
    (a.agency_name ?? "").localeCompare(b.agency_name ?? ""),
  );

  const filtered = (() => {
    const list = query.length > 0
      ? sorted.filter((a) => {
          const q = query.toLowerCase();
          return (
            a.agency_name?.toLowerCase().includes(q) ||
            a.ori?.toLowerCase().includes(q) ||
            a.county_name?.toLowerCase().includes(q) ||
            a.state_name?.toLowerCase().includes(q)
          );
        })
      : sorted;
    return list.slice(0, 200);
  })();

  const selectedAgency = value ? agencies.find((a) => a.ori === value) : null;

  const handleSelect = useCallback(
    (agency: AgencyListItem) => {
      onSelect(agency.ori, agency);
      setQuery("");
      setOpen(false);
    },
    [onSelect],
  );

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(null);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(filtered[highlightIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (!open || !listRef.current) return;
    const items = listRef.current.querySelectorAll("[data-agency-item]");
    items[highlightIndex]?.scrollIntoView({ block: "nearest" });
  }, [highlightIndex, open]);

  // Reset highlight when query changes
  useEffect(() => {
    setHighlightIndex(0);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger / display */}
      <button
        type="button"
        className="flex h-8 w-full items-center gap-1.5 rounded-md border border-border bg-white px-2 text-xs transition-colors hover:bg-muted/50"
        onClick={() => setOpen(!open)}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <Search className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}
        {selectedAgency ? (
          <>
            <span className="truncate font-medium text-navy">
              {selectedAgency.agency_name}
            </span>
            <span className="shrink-0 font-mono text-muted-foreground">
              ({selectedAgency.state_abbr})
            </span>
            <span
              role="button"
              className="ml-auto shrink-0 text-muted-foreground hover:text-navy"
              onClick={handleClear}
            >
              <X className="h-3 w-3" />
            </span>
          </>
        ) : (
          <>
            <span className="truncate text-muted-foreground">
              {isLoading
                ? "Loading..."
                : `Select agency (${agencies.length.toLocaleString()})`}
            </span>
            <ChevronDown className="ml-auto h-3 w-3 shrink-0 text-muted-foreground" />
          </>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 top-full z-[200] mt-1 w-[420px] rounded-lg border border-border bg-white shadow-lg">
          {/* Search input inside dropdown */}
          <div className="flex items-center border-b border-border px-3">
            <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type to filter agencies..."
              className="h-9 w-full bg-transparent px-2 text-xs outline-none placeholder:text-muted-foreground"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="shrink-0 text-muted-foreground hover:text-navy"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Agency list */}
          <div ref={listRef} className="max-h-72 overflow-y-auto">
            {filtered.length === 0 && !isLoading && (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                {query
                  ? `No agencies found for "${query}"`
                  : "No agencies available"}
              </div>
            )}
            {isLoading && (
              <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                Loading agencies...
              </div>
            )}
            {filtered.map((agency, i) => (
              <button
                key={agency.ori}
                data-agency-item
                className={`flex w-full items-start gap-2 px-3 py-2 text-left text-xs transition-colors ${
                  i === highlightIndex ? "bg-muted" : "hover:bg-muted/50"
                }`}
                onMouseEnter={() => setHighlightIndex(i)}
                onClick={() => handleSelect(agency)}
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-navy">
                    {agency.agency_name}
                  </p>
                  <p className="text-muted-foreground">
                    {agency.agency_type_name} &middot; {agency.county_name},{" "}
                    {agency.state_abbr}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-muted-foreground">
                  {agency.ori}
                </span>
              </button>
            ))}
            {filtered.length === 200 && (
              <div className="border-t border-border px-3 py-2 text-center text-[10px] text-muted-foreground">
                Showing first 200. Type more to narrow results.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
