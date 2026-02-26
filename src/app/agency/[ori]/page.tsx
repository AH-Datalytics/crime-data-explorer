"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KPIBanner } from "@/components/shared/kpi-banner";
import { TrendChart } from "@/components/shared/trend-chart";
import { DataTable } from "@/components/shared/data-table";
import { YoYTable } from "@/components/shared/yoy-table";
import { Loading } from "@/components/shared/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSummarized, useCDEAgenciesByState } from "@/lib/hooks/use-crime-data";
import { CRIME_TYPE_GROUPS, getCrimeTypeLabel } from "@/lib/config";
import { formatNumber } from "@/lib/measures";
import type { KPIMetric, AgencyListItem } from "@/lib/types";

interface PageProps {
  params: Promise<{ ori: string }>;
}

export default function AgencyDetailPage({ params }: PageProps) {
  const { ori } = use(params);

  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(2024);
  const [crimeType, setCrimeType] = useState("violent-crime");

  // Fetch crime data via summarized proxy
  const { data, isLoading: loadingCrime } = useSummarized(
    `agency/${ori}`,
    crimeType,
    startYear,
    endYear,
  );

  // Also fetch secondary crime type for comparison
  const secondaryCrimeType = crimeType === "property-crime" ? "violent-crime" : "property-crime";
  const { data: secondaryData } = useSummarized(
    `agency/${ori}`,
    secondaryCrimeType,
    startYear,
    endYear,
  );

  // Lookup agency info — use agency state_abbr from the ORI-based list lookup
  // ORI prefix is NOT always state abbr, so we try the agency list
  const statePrefix = ori.substring(0, 2).toUpperCase();
  const { data: stateAgencies } = useCDEAgenciesByState(statePrefix);
  const agencyInfo: AgencyListItem | undefined = stateAgencies?.find(
    (a) => a.ori === ori,
  );

  const crimeTypeLabel = getCrimeTypeLabel(crimeType);
  const secondaryLabel = getCrimeTypeLabel(secondaryCrimeType);

  // KPIs from latest year
  const latest = data[data.length - 1];
  const prev = data[data.length - 2];

  const kpis: KPIMetric[] = latest
    ? [
        {
          label: `${crimeTypeLabel} (${latest.year})`,
          value: latest.count,
          previousValue: prev?.count,
          format: "number",
        },
        {
          label: "Rate per 100k",
          value: latest.rate,
          previousValue: prev?.rate,
          format: "rate",
        },
        {
          label: "Clearances",
          value: latest.clearances,
          previousValue: prev?.clearances,
          format: "number",
        },
      ]
    : [];

  // Combined trend chart data
  const trendData = data.map((d) => {
    const secondary = secondaryData.find((s) => s.year === d.year);
    return {
      year: d.year,
      count: d.count,
      rate: d.rate,
      secondary: secondary?.count ?? 0,
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <Link
        href="/agencies"
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-navy"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to Agencies
      </Link>

      <PageHeader
        title={agencyInfo?.agency_name || ori}
        description={
          agencyInfo
            ? `${agencyInfo.agency_type_name} · ${agencyInfo.county_name}, ${agencyInfo.state_name || agencyInfo.state_abbr} · ORI: ${ori}${agencyInfo.nibrs ? " · NIBRS Reporting" : ""}`
            : `Agency ORI: ${ori}`
        }
      />

      {/* Year range + crime type controls */}
      <div className="mt-4 flex flex-wrap items-center gap-4 rounded-lg border border-border bg-white px-4 py-3">
        <Select value={crimeType} onValueChange={setCrimeType}>
          <SelectTrigger className="h-8 w-[200px] text-xs">
            <SelectValue>{crimeTypeLabel}</SelectValue>
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
        </div>
      </div>

      {/* Loading */}
      {loadingCrime && <div className="mt-8"><Loading /></div>}

      {/* No data */}
      {!loadingCrime && data.length === 0 && (
        <div className="mt-8 rounded-lg border border-border bg-muted/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No {crimeTypeLabel.toLowerCase()} data available for this agency ({startYear}–{endYear}).
            The agency may not report to the FBI&apos;s UCR program, or data may not be available for the
            selected crime type and year range. Try selecting a different crime type above.
          </p>
        </div>
      )}

      {/* Main content */}
      {!loadingCrime && data.length > 0 && (
        <>
          <div className="mt-4">
            <KPIBanner metrics={kpis} />
          </div>

          {latest && (
            <p className="mt-2 text-right font-mono text-[10px] text-muted-foreground">
              Data through {latest.year}
            </p>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TrendChart
              data={data.map((d) => ({ year: d.year, count: d.count, rate: d.rate }))}
              dataKeys={[{ key: "count", label: `${crimeTypeLabel} Count` }]}
              rateKey="rate"
              rateLabel="Rate per 100k"
              title={`${crimeTypeLabel} Trend (${startYear}–${endYear})`}
              chartId={`agency-${ori}-trend`}
            />
            <TrendChart
              data={trendData}
              dataKeys={[
                { key: "count", label: crimeTypeLabel },
                { key: "secondary", label: secondaryLabel },
              ]}
              title={`${crimeTypeLabel} vs ${secondaryLabel}`}
              chartId={`agency-${ori}-comparison`}
            />
          </div>

          <div className="mt-6">
            <YoYTable data={data} label={crimeTypeLabel} />
          </div>

          <div className="mt-6">
            <DataTable
              data={trendData}
              columns={[
                { key: "year", label: "Year", align: "left" },
                { key: "count", label: crimeTypeLabel, align: "right", format: (v) => formatNumber(Number(v ?? 0)) },
                { key: "rate", label: "Rate/100k", align: "right", format: (v) => Number(v ?? 0).toFixed(1) },
                { key: "secondary", label: secondaryLabel, align: "right", format: (v) => formatNumber(Number(v ?? 0)) },
              ]}
              title={`Annual ${crimeTypeLabel} Data`}
              tableId={`agency-${ori}-crime`}
            />
          </div>
        </>
      )}
    </div>
  );
}
