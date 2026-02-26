"use client";

import { useRouter } from "next/navigation";
import useSWR from "swr";
import { PageHeader } from "@/components/shared/page-header";
import { USChoropleth } from "@/components/shared/us-choropleth";
import { DataTable } from "@/components/shared/data-table";
import { Loading } from "@/components/shared/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { CRIME_TYPE_GROUPS, getCrimeTypeLabel } from "@/lib/config";
import { formatNumber } from "@/lib/measures";
import type { StateMapData } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function MapPage() {
  const router = useRouter();
  const [crimeType, setCrimeType] = useState("violent-crime");
  const [year, setYear] = useState(2024);

  const { data: rawMapData, isLoading } = useSWR<StateMapData[]>(
    `/api/state-map?crime=${crimeType}&year=${year}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 3600000 },
  );

  const mapData = Array.isArray(rawMapData) ? rawMapData : [];
  const label = getCrimeTypeLabel(crimeType);

  const sortedByRate = [...mapData].sort((a, b) => b.rate - a.rate);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <PageHeader
        title="State Crime Map"
        description={`${label} rates across all 50 states and DC. Click a state to drill into its data.`}
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Select value={crimeType} onValueChange={setCrimeType}>
          <SelectTrigger className="h-8 w-[200px] text-xs">
            <SelectValue>{label}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {CRIME_TYPE_GROUPS.slice(0, 2).map((group) => (
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

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">Year:</span>
          <input
            type="number"
            min={2015}
            max={2024}
            value={year}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (!isNaN(v) && v >= 2015 && v <= 2024) setYear(v);
            }}
            className="h-8 w-[64px] rounded-md border border-border bg-white px-2 text-center font-mono text-xs tabular-nums outline-none focus:border-navy"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="mt-8">
          <Loading />
        </div>
      ) : mapData.length === 0 ? (
        <div className="mt-8 rounded-lg border border-border bg-muted/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No state map data available for {label} ({year}).
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <USChoropleth
              data={mapData}
              valueField="rate"
              title={`${label} Rate per 100,000 (${year})`}
              onStateClick={(abbr) => router.push(`/crime?state=${abbr}`)}
            />
          </div>

          <div className="mt-6">
            <DataTable
              data={sortedByRate.map((d) => ({ state_name: d.state_name, state_abbr: d.state_abbr, value: d.value, rate: d.rate, population: d.population }))}
              columns={[
                { key: "state_name", label: "State", align: "left" },
                { key: "state_abbr", label: "Abbr", align: "left" },
                { key: "value", label: label, align: "right", format: (v) => formatNumber(v as number) },
                { key: "rate", label: "Rate/100k", align: "right", format: (v) => Number(v ?? 0).toFixed(1) },
                { key: "population", label: "Population", align: "right", format: (v) => formatNumber(v as number) },
              ]}
              title={`${label} by State (${year})`}
              tableId="state-map-table"
            />
          </div>
        </>
      )}
    </div>
  );
}
