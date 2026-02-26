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
import { Slider } from "@/components/ui/slider";
import { useFilterStore } from "@/lib/stores/filter-store";
import { US_STATES } from "@/lib/us-states";

const CRIME_TYPES = [
  { value: "violent-crime", label: "Violent Crime" },
  { value: "property-crime", label: "Property Crime" },
  { value: "homicide", label: "Homicide" },
  { value: "rape-revised", label: "Rape" },
  { value: "robbery", label: "Robbery" },
  { value: "aggravated-assault", label: "Aggravated Assault" },
  { value: "burglary", label: "Burglary" },
  { value: "larceny", label: "Larceny" },
  { value: "motor-vehicle-theft", label: "Motor Vehicle Theft" },
  { value: "arson", label: "Arson" },
];

interface FilterBarProps {
  showCrimeType?: boolean;
  showState?: boolean;
  showYearRange?: boolean;
}

export function FilterBar({
  showCrimeType = true,
  showState = true,
  showYearRange = true,
}: FilterBarProps) {
  const {
    stateAbbr,
    startYear,
    endYear,
    crimeType,
    setStateAbbr,
    setStartYear,
    setEndYear,
    setCrimeType,
    resetFilters,
  } = useFilterStore();

  const hasFilters = stateAbbr || crimeType !== "violent-crime" || startYear !== 1985 || endYear !== 2023;

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

        {showCrimeType && (
          <Select value={crimeType} onValueChange={setCrimeType}>
            <SelectTrigger className="h-8 w-[180px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CRIME_TYPES.map((ct) => (
                <SelectItem key={ct.value} value={ct.value}>
                  {ct.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {showYearRange && (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{startYear}</span>
            <Slider
              min={1985}
              max={2023}
              step={1}
              value={[startYear, endYear]}
              onValueChange={([s, e]) => {
                setStartYear(s);
                setEndYear(e);
              }}
              className="w-[140px]"
            />
            <span className="font-mono text-xs text-muted-foreground">{endYear}</span>
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
