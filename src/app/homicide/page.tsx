"use client";

import { PageHeader } from "@/components/shared/page-header";
import { KPIBanner } from "@/components/shared/kpi-banner";
import { FilterBar } from "@/components/shared/filter-bar";
import { TrendChart } from "@/components/shared/trend-chart";
import { DataTable } from "@/components/shared/data-table";
import { YoYTable } from "@/components/shared/yoy-table";
import { Loading } from "@/components/shared/loading";
import { useFilterStore } from "@/lib/stores/filter-store";
import { useSummarized } from "@/lib/hooks/use-crime-data";
import { formatNumber } from "@/lib/measures";
import type { KPIMetric } from "@/lib/types";

export default function HomicidePage() {
  const { stateAbbr, startYear, endYear, agencyOri } = useFilterStore();

  const scope = agencyOri
    ? `agency/${agencyOri}`
    : stateAbbr
      ? `state/${stateAbbr}`
      : "national";

  const { data, isLoading } = useSummarized(scope, "homicide", startYear, endYear);

  const scopeLabel = agencyOri || (stateAbbr ? `State: ${stateAbbr}` : "National");

  const latest = data[data.length - 1];
  const prev = data[data.length - 2];

  const kpis: KPIMetric[] = latest
    ? [
        { label: "Total Homicides", value: latest.count, previousValue: prev?.count, format: "number" },
        { label: "Homicide Rate", value: latest.rate, previousValue: prev?.rate, format: "rate" },
        { label: "Clearances", value: latest.clearances, previousValue: prev?.clearances, format: "number" },
        { label: "Population", value: latest.population, format: "number" },
      ]
    : [];

  const trendData = data.map((d) => ({
    year: d.year,
    homicides: d.count,
    rate: d.rate,
    clearances: d.clearances,
  }));

  return (
    <>
      <FilterBar showCrimeType={false} showState showYearRange showAgency />
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <PageHeader
          title="Expanded Homicide"
          description={`${scopeLabel} homicide statistics from the FBI's Summarized Reporting System (SRS).`}
        />

        {isLoading ? (
          <Loading />
        ) : data.length === 0 ? (
          <div className="mt-8 rounded-lg border border-border bg-muted/50 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No homicide data available for {scopeLabel} ({startYear}–{endYear}).
            </p>
          </div>
        ) : (
          <>
            <KPIBanner metrics={kpis} />

            {latest && (
              <p className="mt-2 text-right font-mono text-[10px] text-muted-foreground">
                Data through {latest.year}
              </p>
            )}

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <TrendChart
                data={trendData}
                dataKeys={[{ key: "homicides", label: "Homicides" }]}
                rateKey="rate"
                rateLabel="Homicide Rate per 100k"
                title="Homicide Trend"
                chartId="homicide-trend"
              />
              <TrendChart
                data={trendData}
                dataKeys={[{ key: "clearances", label: "Clearances" }]}
                title="Homicide Clearances"
                chartId="homicide-clearances"
              />
            </div>

            <div className="mt-6">
              <YoYTable data={data} label="Homicides" />
            </div>

            <div className="mt-6 rounded-lg border border-border bg-muted/50 p-4">
              <h3 className="font-serif text-sm font-bold text-navy">Detailed Demographics Not Available</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Victim/offender demographics, weapon breakdowns, and circumstance data from the
                Supplementary Homicide Report (SHR) endpoint require authentication and return null
                for public API consumers. Detailed homicide breakdowns are available on the official{" "}
                <a href="https://cde.ucr.cjis.gov" target="_blank" rel="noopener noreferrer" className="text-navy underline">
                  FBI Crime Data Explorer
                </a>.
              </p>
            </div>

            <div className="mt-6">
              <DataTable
                data={data.map((d) => ({
                  year: d.year,
                  count: d.count,
                  rate: d.rate,
                  clearances: d.clearances,
                  population: d.population,
                }))}
                columns={[
                  { key: "year", label: "Year", align: "left" },
                  { key: "count", label: "Homicides", align: "right", format: (v) => formatNumber(v as number) },
                  { key: "rate", label: "Rate/100k", align: "right", format: (v) => Number(v ?? 0).toFixed(1) },
                  { key: "clearances", label: "Clearances", align: "right", format: (v) => formatNumber(v as number) },
                  { key: "population", label: "Population", align: "right", format: (v) => formatNumber(v as number) },
                ]}
                title="Annual Homicide Data"
                tableId="homicide-table"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
