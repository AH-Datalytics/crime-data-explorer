"use client";

import { PageHeader } from "@/components/shared/page-header";
import { KPIBanner } from "@/components/shared/kpi-banner";
import { FilterBar } from "@/components/shared/filter-bar";
import { TrendChart } from "@/components/shared/trend-chart";
import { DemographicChart } from "@/components/shared/demographic-chart";
import { DataTable } from "@/components/shared/data-table";
import { Loading } from "@/components/shared/loading";
import { useFilterStore } from "@/lib/stores/filter-store";
import { useHateCrime } from "@/lib/hooks/use-crime-data";
import { formatNumber } from "@/lib/measures";
import { COLORS } from "@/lib/config";
import type { KPIMetric, DemographicBreakdown } from "@/lib/types";

export default function HateCrimePage() {
  const { stateAbbr, startYear, endYear, agencyOri } = useFilterStore();

  // Hate crime API doesn't support agency scope, only national or state
  const scope = stateAbbr ? `state/${stateAbbr}` : "national";
  const { data, biasCategories, offenseTypes, isLoading } = useHateCrime(scope, startYear, endYear);

  const scopeLabel = agencyOri || (stateAbbr ? `State: ${stateAbbr}` : "National");

  const latest = data[data.length - 1];
  const prev = data[data.length - 2];

  const kpis: KPIMetric[] = latest
    ? [
        { label: "Incidents", value: latest.incidents, previousValue: prev?.incidents, format: "number" },
        { label: "Offenses", value: latest.offenses, previousValue: prev?.offenses, format: "number" },
        { label: "Victims", value: latest.victims, previousValue: prev?.victims, format: "number" },
      ]
    : [];

  // Convert bias/offense breakdowns to DemographicBreakdown format
  const totalBias = biasCategories.reduce((sum, b) => sum + b.count, 0);
  const biasBreakdown: DemographicBreakdown[] = biasCategories.map((b) => ({
    category: b.category,
    value: b.count,
    percentage: totalBias > 0 ? (b.count / totalBias) * 100 : 0,
  }));

  const totalOffense = offenseTypes.reduce((sum, o) => sum + o.count, 0);
  const offenseBreakdown: DemographicBreakdown[] = offenseTypes.map((o) => ({
    category: o.category,
    value: o.count,
    percentage: totalOffense > 0 ? (o.count / totalOffense) * 100 : 0,
  }));

  return (
    <>
      <FilterBar showCrimeType={false} showState showYearRange showAgency={false} />
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <PageHeader
          title="Hate Crime"
          description={`${scopeLabel} hate crime statistics reported through the FBI's Hate Crime Statistics program.`}
        />

        {isLoading ? (
          <Loading />
        ) : data.length === 0 ? (
          <div className="mt-8 rounded-lg border border-border bg-muted/50 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No hate crime data available for {scopeLabel} ({startYear}–{endYear}).
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
                data={data.map((d) => ({ year: d.year, incidents: d.incidents, victims: d.victims }))}
                dataKeys={[
                  { key: "incidents", label: "Incidents" },
                  { key: "victims", label: "Victims" },
                ]}
                title="Hate Crime Trend"
                chartId="hate-crime-trend"
              />
              {biasBreakdown.length > 0 && (
                <DemographicChart
                  data={biasBreakdown.slice(0, 10)}
                  title="Incidents by Bias Motivation"
                  chartId="hate-crime-bias"
                  color={COLORS.chart3}
                />
              )}
            </div>

            {offenseBreakdown.length > 0 && (
              <div className="mt-6">
                <DemographicChart
                  data={offenseBreakdown.slice(0, 10)}
                  title="Incidents by Offense Type"
                  chartId="hate-crime-offense"
                  color={COLORS.chart2}
                />
              </div>
            )}

            <div className="mt-6">
              <DataTable
                data={data.map((d) => ({ year: d.year, incidents: d.incidents, offenses: d.offenses, victims: d.victims }))}
                columns={[
                  { key: "year", label: "Year", align: "left" },
                  { key: "incidents", label: "Incidents", align: "right", format: (v) => formatNumber(v as number) },
                  { key: "offenses", label: "Offenses", align: "right", format: (v) => formatNumber(v as number) },
                  { key: "victims", label: "Victims", align: "right", format: (v) => formatNumber(v as number) },
                ]}
                title="Annual Hate Crime Data"
                tableId="hate-crime-table"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
