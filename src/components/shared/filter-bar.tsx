"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFilterStore } from "@/lib/stores/filter-store";
import { US_STATES } from "@/lib/us-states";
import { CRIME_TYPE_GROUPS, getCrimeTypeLabel } from "@/lib/config";
import { AgencySearch } from "./agency-search";

interface FilterBarProps {
  showCrimeType?: boolean;
  showState?: boolean;
  showYearRange?: boolean;
  showAgency?: boolean;
}

export function FilterBar({
  showCrimeType = true,
  showState = true,
  showYearRange = true,
  showAgency = false,
}: FilterBarProps) {
  const {
    stateAbbr,
    startYear,
    endYear,
    crimeType,
    agencyOri,
    setStateAbbr,
    setStartYear,
    setEndYear,
    setCrimeType,
    setAgencyOri,
    resetFilters,
  } = useFilterStore();

  const hasFilters =
    stateAbbr || crimeType !== "violent-crime" || startYear !== 2015 || endYear !== 2024 || agencyOri;

  const applyPreset = (years: number) => {
    setEndYear(2024);
    setStartYear(2024 - years + 1);
  };

  return (
    <div className="sticky top-12 z-50 border-b border-border bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 md:px-6">
        {showState && (
          <Select
            value={stateAbbr || "national"}
            onValueChange={(v) => setStateAbbr(v === "national" ? null : v)}
          >
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="National" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="national">National</SelectItem>
              {Object.entries(US_STATES).map(([abbr, name]) => (
                <SelectItem key={abbr} value={abbr}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {showAgency && (
          <AgencySearch
            stateAbbr={stateAbbr}
            value={agencyOri}
            onSelect={(ori) => setAgencyOri(ori)}
            className="w-[260px]"
          />
        )}

        {showCrimeType && (
          <Select value={crimeType} onValueChange={setCrimeType}>
            <SelectTrigger className="h-8 w-[200px] text-xs">
              <SelectValue>{getCrimeTypeLabel(crimeType)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {CRIME_TYPE_GROUPS.map((group) => (
                <div key={group.label}>
                  <div className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group.label}
                  </div>
                  {group.types.map((ct) => (
                    <SelectItem key={ct.value} value={ct.value}>
                      {ct.label}
                    </SelectItem>
                  ))}
                </div>
              ))}
            </SelectContent>
          </Select>
        )}

        {showYearRange && (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={2000}
              max={endYear}
              value={startYear}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (!isNaN(v) && v >= 2000 && v <= endYear) setStartYear(v);
              }}
              className="h-8 w-[64px] rounded-md border border-border bg-white px-2 text-center font-mono text-xs tabular-nums outline-none focus:border-navy"
            />
            <span className="text-xs text-muted-foreground">to</span>
            <input
              type="number"
              min={startYear}
              max={2024}
              value={endYear}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                if (!isNaN(v) && v >= startYear && v <= 2024) setEndYear(v);
              }}
              className="h-8 w-[64px] rounded-md border border-border bg-white px-2 text-center font-mono text-xs tabular-nums outline-none focus:border-navy"
            />
            <div className="flex items-center gap-1 ml-1">
              {[5, 10].map((n) => (
                <button
                  key={n}
                  onClick={() => applyPreset(n)}
                  className="h-6 rounded border border-border bg-muted/50 px-1.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-navy"
                >
                  {n}Y
                </button>
              ))}
            </div>
          </div>
        )}

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs text-muted-foreground"
            onClick={resetFilters}
          >
            <X className="mr-1 h-3 w-3" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
