"use client";

import { PageHeader } from "@/components/shared/page-header";
import { KPIBanner } from "@/components/shared/kpi-banner";
import { FilterBar } from "@/components/shared/filter-bar";
import { TrendChart } from "@/components/shared/trend-chart";
import { DemographicChart } from "@/components/shared/demographic-chart";
import { DataTable } from "@/components/shared/data-table";
import { SAMPLE_ARREST_TREND } from "@/lib/sample-data";
import { useFilterStore } from "@/lib/stores/filter-store";
import { formatNumber } from "@/lib/measures";
import type { DemographicBreakdown } from "@/lib/types";

const ARREST_BY_AGE: DemographicBreakdown[] = [
  { category: "25-29", value: 142000, percentage: 18.2 },
  { category: "30-34", value: 128000, percentage: 16.4 },
  { category: "20-24", value: 125000, percentage: 16.0 },
  { category: "35-39", value: 103000, percentage: 13.2 },
  { category: "18-19", value: 78000, percentage: 10.0 },
  { category: "40-44", value: 72000, percentage: 9.2 },
  { category: "Under 18", value: 52000, percentage: 6.7 },
  { category: "45+", value: 80000, percentage: 10.3 },
];

const ARREST_BY_SEX: DemographicBreakdown[] = [
  { category: "Male", value: 560000, percentage: 73.1 },
  { category: "Female", value: 206000, percentage: 26.9 },
];

export default function ArrestsPage() {
  const { startYear, endYear } = useFilterStore();

  const filtered = SAMPLE_ARREST_TREND.filter(
    (d) => d.year >= startYear && d.year <= endYear,
  );

  const latest = filtered[filtered.length - 1];
  const prev = filtered[filtered.length - 2];

  const kpis = [
    {
      label: "Total Arrests",
      value: latest?.total_arrests ?? 0,
      previousValue: prev?.total_arrests,
      format: "number" as const,
    },
    {
      label: "Drug Abuse Arrests",
      value: latest?.drug_abuse ?? 0,
      previousValue: prev?.drug_abuse,
      format: "number" as const,
    },
    {
      label: "DUI Arrests",
      value: latest?.dui ?? 0,
      previousValue: prev?.dui,
      format: "number" as const,
    },
    {
      label: "Simple Assault",
      value: latest?.simple_assault ?? 0,
      previousValue: prev?.simple_assault,
      format: "number" as const,
    },
  ];

  const trendData = filtered.map((d) => ({
    year: d.year,
    total: d.total_arrests,
    drug: d.drug_abuse,
    dui: d.dui,
    assault: d.simple_assault,
  }));

  return (
    <>
      <FilterBar showCrimeType={false} showState showYearRange />
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <PageHeader
          title="Arrests"
          description="National arrest trends by offense type and arrestee demographics. Data includes all reporting law enforcement agencies."
        />

        <KPIBanner metrics={kpis} />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TrendChart
            data={trendData}
            dataKeys={[{ key: "total", label: "Total Arrests" }]}
            title="Total Arrest Trend"
            chartId="arrest-trend-total"
          />
          <TrendChart
            data={trendData}
            dataKeys={[
              { key: "drug", label: "Drug Abuse" },
              { key: "dui", label: "DUI" },
              { key: "assault", label: "Simple Assault" },
            ]}
            title="Arrests by Offense Type"
            chartId="arrest-trend-by-type"
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DemographicChart
            data={ARREST_BY_AGE}
            title="Arrests by Age Group"
            chartId="arrest-demographics-age"
          />
          <DemographicChart
            data={ARREST_BY_SEX}
            title="Arrests by Sex"
            chartId="arrest-demographics-sex"
            height={140}
          />
        </div>

        <div className="mt-6">
          <DataTable
            data={filtered.map((d) => ({
              year: d.year,
              total_arrests: d.total_arrests,
              drug_abuse: d.drug_abuse,
              dui: d.dui,
              simple_assault: d.simple_assault,
            }))}
            columns={[
              { key: "year", label: "Year", align: "left" },
              { key: "total_arrests", label: "Total Arrests", align: "right", format: (v) => formatNumber(v as number) },
              { key: "drug_abuse", label: "Drug Abuse", align: "right", format: (v) => formatNumber(v as number) },
              { key: "dui", label: "DUI", align: "right", format: (v) => formatNumber(v as number) },
              { key: "simple_assault", label: "Simple Assault", align: "right", format: (v) => formatNumber(v as number) },
            ]}
            title="Annual Arrest Data"
            tableId="arrest-data-table"
          />
        </div>
      </div>
    </>
  );
}
