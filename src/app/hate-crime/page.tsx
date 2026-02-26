"use client";

import { PageHeader } from "@/components/shared/page-header";
import { KPIBanner } from "@/components/shared/kpi-banner";
import { FilterBar } from "@/components/shared/filter-bar";
import { TrendChart } from "@/components/shared/trend-chart";
import { DemographicChart } from "@/components/shared/demographic-chart";
import { DataTable } from "@/components/shared/data-table";
import { SAMPLE_HATE_CRIME_TREND, SAMPLE_BIAS_CATEGORIES } from "@/lib/sample-data";
import { useFilterStore } from "@/lib/stores/filter-store";
import { formatNumber } from "@/lib/measures";
import { COLORS } from "@/lib/config";
import type { DemographicBreakdown } from "@/lib/types";

const OFFENSE_TYPES: DemographicBreakdown[] = [
  { category: "Intimidation", value: 3421, percentage: 31.2 },
  { category: "Simple Assault", value: 2387, percentage: 21.8 },
  { category: "Vandalism/Destruction", value: 2165, percentage: 19.8 },
  { category: "Aggravated Assault", value: 1543, percentage: 14.1 },
  { category: "Robbery", value: 498, percentage: 4.5 },
  { category: "Burglary", value: 312, percentage: 2.8 },
  { category: "Other", value: 634, percentage: 5.8 },
];

export default function HateCrimePage() {
  const { startYear, endYear } = useFilterStore();

  const filtered = SAMPLE_HATE_CRIME_TREND.filter(
    (d) => d.year >= Math.max(startYear, 2000) && d.year <= endYear,
  );

  const latest = filtered[filtered.length - 1];
  const prev = filtered[filtered.length - 2];

  const kpis = [
    {
      label: "Incidents",
      value: latest?.incidents ?? 0,
      previousValue: prev?.incidents,
      format: "number" as const,
    },
    {
      label: "Offenses",
      value: latest?.offenses ?? 0,
      previousValue: prev?.offenses,
      format: "number" as const,
    },
    {
      label: "Victims",
      value: latest?.victims ?? 0,
      previousValue: prev?.victims,
      format: "number" as const,
    },
  ];

  return (
    <>
      <FilterBar showCrimeType={false} showState showYearRange />
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <PageHeader
          title="Hate Crime"
          description="Hate crime statistics reported through the FBI's Hate Crime Statistics program. Includes incidents by bias motivation, offense type, and victim demographics."
        />

        <KPIBanner metrics={kpis} />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TrendChart
            data={filtered}
            dataKeys={[
              { key: "incidents", label: "Incidents" },
              { key: "victims", label: "Victims" },
            ]}
            title="Hate Crime Trend"
            chartId="hate-crime-trend"
          />
          <DemographicChart
            data={SAMPLE_BIAS_CATEGORIES}
            title="Incidents by Bias Motivation"
            chartId="hate-crime-bias"
            color={COLORS.chart3}
          />
        </div>

        <div className="mt-6">
          <DemographicChart
            data={OFFENSE_TYPES}
            title="Incidents by Offense Type"
            chartId="hate-crime-offense"
            color={COLORS.chart2}
          />
        </div>

        <div className="mt-6">
          <DataTable
            data={filtered}
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
      </div>
    </>
  );
}
