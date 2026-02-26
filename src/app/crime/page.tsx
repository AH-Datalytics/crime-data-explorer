"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { KPIBanner } from "@/components/shared/kpi-banner";
import { FilterBar } from "@/components/shared/filter-bar";
import { TrendChart } from "@/components/shared/trend-chart";
import { DataTable } from "@/components/shared/data-table";
import { YoYTable } from "@/components/shared/yoy-table";
import { Loading } from "@/components/shared/loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFilterStore } from "@/lib/stores/filter-store";
import { useSummarized } from "@/lib/hooks/use-crime-data";
import { getCrimeTypeLabel } from "@/lib/config";
import { formatNumber } from "@/lib/measures";
import type { KPIMetric } from "@/lib/types";

function StateParamSync() {
  const searchParams = useSearchParams();
  const setStateAbbr = useFilterStore((s) => s.setStateAbbr);
  useEffect(() => {
    const sp = searchParams.get("state");
    if (sp) setStateAbbr(sp);
  }, [searchParams, setStateAbbr]);
  return null;
}

export default function CrimeTrendsPage() {
  const { stateAbbr, startYear, endYear, crimeType, agencyOri } = useFilterStore();

  // Build scope string for the API
  const scope = agencyOri
    ? `agency/${agencyOri}`
    : stateAbbr
      ? `state/${stateAbbr}`
      : "national";

  const { data, isLoading } = useSummarized(scope, crimeType, startYear, endYear);

  const fieldLabel = getCrimeTypeLabel(crimeType);
  const scopeLabel = agencyOri || (stateAbbr ? `State: ${stateAbbr}` : "National");

  const latest = data[data.length - 1];
  const prev = data[data.length - 2];

  const kpis: KPIMetric[] = latest
    ? [
        { label: fieldLabel, value: latest.count, previousValue: prev?.count, format: "number" },
        { label: "Population", value: latest.population, format: "number" },
        { label: `${fieldLabel} Rate`, value: latest.rate, previousValue: prev?.rate, format: "rate" },
        { label: "Clearances", value: latest.clearances, previousValue: prev?.clearances, format: "number" },
      ]
    : [];

  const trendData = data.map((d) => ({
    year: d.year,
    count: d.count,
    rate: d.rate,
    clearances: d.clearances,
  }));

  const tableData = data.map((d) => ({
    year: d.year,
    count: d.count,
    rate: d.rate,
    clearances: d.clearances,
    population: d.population,
  }));

  return (
    <>
      <Suspense><StateParamSync /></Suspense>
      <FilterBar showCrimeType showState showYearRange showAgency />
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <PageHeader
          title="Crime Trends"
          description={`${scopeLabel} ${fieldLabel.toLowerCase()} statistics from ${startYear} to ${endYear}. Use the filters above to explore by crime type, state, agency, and year range.`}
        />

        {isLoading ? (
          <Loading />
        ) : data.length === 0 ? (
          <div className="mt-8 rounded-lg border border-border bg-muted/50 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No data available for {fieldLabel.toLowerCase()} ({scopeLabel}, {startYear}–{endYear}).
              Try a different crime type, location, or year range.
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

            <Tabs defaultValue="trend" className="mt-6">
              <TabsList>
                <TabsTrigger value="trend">Crime Trend</TabsTrigger>
                <TabsTrigger value="demographics">Demographics</TabsTrigger>
              </TabsList>

              <TabsContent value="trend" className="mt-4 space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <TrendChart
                    data={trendData}
                    dataKeys={[{ key: "count", label: `${fieldLabel} Count` }]}
                    rateKey="rate"
                    rateLabel={`${fieldLabel} Rate per 100k`}
                    title={`${fieldLabel} Trend`}
                    chartId="crime-trend-count"
                  />
                  <TrendChart
                    data={trendData}
                    dataKeys={[{ key: "clearances", label: "Clearances" }]}
                    title={`${fieldLabel} Clearances`}
                    chartId="crime-trend-clearances"
                  />
                </div>

                <YoYTable data={data} label={fieldLabel} />

                <DataTable
                  data={tableData}
                  columns={[
                    { key: "year", label: "Year", align: "left" },
                    { key: "count", label: fieldLabel, align: "right", format: (v) => formatNumber(v as number) },
                    { key: "rate", label: "Rate/100k", align: "right", format: (v) => Number(v ?? 0).toFixed(1) },
                    { key: "clearances", label: "Clearances", align: "right", format: (v) => formatNumber(v as number) },
                    { key: "population", label: "Population", align: "right", format: (v) => formatNumber(v as number) },
                  ]}
                  title="Annual Crime Statistics"
                  tableId="crime-stats-table"
                />
              </TabsContent>

              <TabsContent value="demographics" className="mt-4">
                <div className="rounded-lg border border-border bg-muted/50 p-6 text-center">
                  <h3 className="font-serif text-sm font-bold text-navy">Demographics Not Available</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    The FBI&apos;s NIBRS victim/offender demographic endpoints require authentication
                    and currently return null data for public API consumers. Demographic breakdowns
                    (age, sex, race of victims and offenders) are available on the official{" "}
                    <a
                      href="https://cde.ucr.cjis.gov"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-navy underline"
                    >
                      FBI Crime Data Explorer
                    </a>.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </>
  );
}
