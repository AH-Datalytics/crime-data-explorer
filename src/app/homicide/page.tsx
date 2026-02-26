"use client";

import { PageHeader } from "@/components/shared/page-header";
import { KPIBanner } from "@/components/shared/kpi-banner";
import { FilterBar } from "@/components/shared/filter-bar";
import { TrendChart } from "@/components/shared/trend-chart";
import { DemographicChart } from "@/components/shared/demographic-chart";
import { DataTable } from "@/components/shared/data-table";
import { SAMPLE_HOMICIDE_TREND, SAMPLE_WEAPONS } from "@/lib/sample-data";
import { useFilterStore } from "@/lib/stores/filter-store";
import { formatNumber } from "@/lib/measures";
import { COLORS } from "@/lib/config";
import type { DemographicBreakdown } from "@/lib/types";

const VICTIM_RELATIONSHIP: DemographicBreakdown[] = [
  { category: "Stranger", value: 3200, percentage: 21.3 },
  { category: "Unknown", value: 7500, percentage: 50.0 },
  { category: "Acquaintance", value: 1890, percentage: 12.6 },
  { category: "Intimate Partner", value: 1200, percentage: 8.0 },
  { category: "Other Family", value: 780, percentage: 5.2 },
  { category: "Friend", value: 430, percentage: 2.9 },
];

const CIRCUMSTANCES: DemographicBreakdown[] = [
  { category: "Unknown", value: 5200, percentage: 34.7 },
  { category: "Other Arguments", value: 3100, percentage: 20.7 },
  { category: "Other Felony", value: 1800, percentage: 12.0 },
  { category: "Narcotic Drug Laws", value: 1200, percentage: 8.0 },
  { category: "Robbery", value: 1050, percentage: 7.0 },
  { category: "Juvenile Gang", value: 890, percentage: 5.9 },
  { category: "Domestic Violence", value: 780, percentage: 5.2 },
  { category: "Other", value: 980, percentage: 6.5 },
];

export default function HomicidePage() {
  const { startYear, endYear } = useFilterStore();

  const filtered = SAMPLE_HOMICIDE_TREND.filter(
    (d) => d.year >= Math.max(startYear, 2000) && d.year <= endYear,
  );

  const latest = filtered[filtered.length - 1];
  const prev = filtered[filtered.length - 2];

  const kpis = [
    {
      label: "Total Homicides",
      value: latest?.homicides ?? 0,
      previousValue: prev?.homicides,
      format: "number" as const,
    },
    {
      label: "Male Victims",
      value: latest?.male_victims ?? 0,
      previousValue: prev?.male_victims,
      format: "number" as const,
    },
    {
      label: "Female Victims",
      value: latest?.female_victims ?? 0,
      previousValue: prev?.female_victims,
      format: "number" as const,
    },
  ];

  return (
    <>
      <FilterBar showCrimeType={false} showState showYearRange />
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <PageHeader
          title="Expanded Homicide"
          description="Detailed homicide statistics from the FBI's Supplementary Homicide Report (SHR). Includes weapon type, victim/offender demographics, circumstances, and relationships."
        />

        <KPIBanner metrics={kpis} />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TrendChart
            data={filtered}
            dataKeys={[
              { key: "homicides", label: "Total Homicides" },
              { key: "male_victims", label: "Male Victims" },
              { key: "female_victims", label: "Female Victims" },
            ]}
            title="Homicide Trend by Victim Sex"
            chartId="homicide-trend"
          />
          <DemographicChart
            data={SAMPLE_WEAPONS}
            title="Homicides by Weapon Type"
            chartId="homicide-weapons"
            color={COLORS.chart3}
          />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DemographicChart
            data={VICTIM_RELATIONSHIP}
            title="Victim-Offender Relationship"
            chartId="homicide-relationship"
            color={COLORS.chart2}
          />
          <DemographicChart
            data={CIRCUMSTANCES}
            title="Homicide Circumstances"
            chartId="homicide-circumstances"
            color={COLORS.chart5}
          />
        </div>

        <div className="mt-6">
          <DataTable
            data={filtered}
            columns={[
              { key: "year", label: "Year", align: "left" },
              { key: "homicides", label: "Total", align: "right", format: (v) => formatNumber(v as number) },
              { key: "male_victims", label: "Male", align: "right", format: (v) => formatNumber(v as number) },
              { key: "female_victims", label: "Female", align: "right", format: (v) => formatNumber(v as number) },
            ]}
            title="Annual Homicide Data"
            tableId="homicide-table"
          />
        </div>
      </div>
    </>
  );
}
