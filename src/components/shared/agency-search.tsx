"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
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
  placeholder?: string;
}

export function AgencySearch({
  stateAbbr,
  value,
  onSelect,
  className = "",
  placeholder,
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

  // Filter by search query — only show results when query has 2+ chars (or state narrows it)
  const filtered = (() => {
    if (query.length < 2 && !stateAbbr) return [];
    if (query.length === 0) return agencies.slice(0, 100);
    const q = query.toLowerCase();
    return agencies
      .filter(
        (a) =>
          a.agency_name?.toLowerCase().includes(q) ||
          a.ori?.toLowerCase().includes(q) ||
          a.county_name?.toLowerCase().includes(q) ||
          a.state_name?.toLowerCase().includes(q),
      )
      .slice(0, 100);
  })();

  const selectedAgency = value
    ? agencies.find((a) => a.ori === value)
    : null;

  const handleSelect = useCallback(
    (agency: AgencyListItem) => {
      onSelect(agency.ori, agency);
      setQuery("");
      setOpen(false);
    },
    [onSelect],
  );

  const handleClear = () => {
    onSelect(null);
    setQuery("");
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || filtered.length === 0) return;

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

  // Show selected agency chip
  if (selectedAgency) {
    return (
      <div
        className={`flex items-center gap-1.5 rounded-md border border-border bg-white px-2 py-1 text-xs ${className}`}
      >
        <Search className="h-3 w-3 shrink-0 text-muted-foreground" />
        <span className="truncate font-medium text-navy" title={selectedAgency.agency_name}>
          {selectedAgency.agency_name}
        </span>
        <span className="shrink-0 font-mono text-muted-foreground">
          ({selectedAgency.state_abbr})
        </span>
        <button
          onClick={handleClear}
          className="ml-auto shrink-0 text-muted-foreground hover:text-navy"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    );
  }

  const defaultPlaceholder = isLoading
    ? "Loading agencies..."
    : stateAbbr
      ? `Search ${agencies.length} agencies...`
      : `Search all agencies (${agencies.length.toLocaleString()})...`;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="flex items-center rounded-md border border-border bg-white px-2">
        {isLoading ? (
          <Loader2 className="h-3 w-3 shrink-0 animate-spin text-muted-foreground" />
        ) : (
          <Search className="h-3 w-3 shrink-0 text-muted-foreground" />
        )}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (query.length >= 2 || stateAbbr) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || defaultPlaceholder}
          className="h-7 w-full bg-transparent px-2 text-xs outline-none placeholder:text-muted-foreground"
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

      {open && filtered.length > 0 && (
        <div
          ref={listRef}
          className="absolute left-0 top-full z-[200] mt-1 max-h-72 w-[400px] overflow-y-auto rounded-lg border border-border bg-white shadow-lg"
        >
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
                <p className="truncate font-medium text-navy">{agency.agency_name}</p>
                <p className="text-muted-foreground">
                  {agency.agency_type_name} &middot; {agency.county_name}, {agency.state_abbr}
                </p>
              </div>
              <span className="shrink-0 font-mono text-muted-foreground">{agency.ori}</span>
            </button>
          ))}
          {filtered.length === 100 && (
            <div className="border-t border-border px-3 py-2 text-center text-[10px] text-muted-foreground">
              Showing first 100 results. Type more to narrow down.
            </div>
          )}
        </div>
      )}

      {open && query.length >= 2 && filtered.length === 0 && !isLoading && (
        <div className="absolute left-0 top-full z-[200] mt-1 w-[400px] rounded-lg border border-border bg-white p-3 text-center text-xs text-muted-foreground shadow-lg">
          No agencies found for &quot;{query}&quot;
        </div>
      )}

      {open && query.length < 2 && !stateAbbr && !isLoading && (
        <div className="absolute left-0 top-full z-[200] mt-1 w-[400px] rounded-lg border border-border bg-white p-3 text-center text-xs text-muted-foreground shadow-lg">
          Type at least 2 characters to search agencies
        </div>
      )}
    </div>
  );
}
