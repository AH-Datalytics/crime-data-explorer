"use client";

import { PageHeader } from "@/components/shared/page-header";
import { KPIBanner } from "@/components/shared/kpi-banner";
import { FilterBar } from "@/components/shared/filter-bar";
import { TrendChart } from "@/components/shared/trend-chart";
import { DataTable } from "@/components/shared/data-table";
import { SAMPLE_NATIONAL_TREND } from "@/lib/sample-data";
import { useFilterStore } from "@/lib/stores/filter-store";
import { useNationalEstimates, useStateEstimates, useAgencyCrime } from "@/lib/hooks/use-crime-data";
import { buildKPIFromSummary, buildTrendData, computeRate, formatNumber, formatRate } from "@/lib/measures";
import type { CrimeSummary } from "@/lib/types";

export default function CrimeTrendsPage() {
  const { stateAbbr, startYear, endYear, crimeType, agencyOri } = useFilterStore();

  // Live data hooks — agency overrides state overrides national
  const { data: nationalLive } = useNationalEstimates(crimeType, startYear, endYear);
  const { data: stateLive } = useStateEstimates(agencyOri ? null : stateAbbr, crimeType, startYear, endYear);
  const { data: agencyLive } = useAgencyCrime(agencyOri, crimeType, startYear, endYear);

  // Parse API response
  const parseResponse = (raw: unknown): CrimeSummary[] | null => {
    if (!raw) return null;
    const arr = Array.isArray(raw) ? raw : (raw as Record<string, unknown>)?.results ?? (raw as Record<string, unknown>)?.data ?? null;
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr;
  };

  const liveData = agencyOri
    ? parseResponse(agencyLive)
    : stateAbbr
      ? parseResponse(stateLive)
      : parseResponse(nationalLive);

  // Use live data if available, otherwise fall back to sample (filtered)
  const sampleFiltered = SAMPLE_NATIONAL_TREND.filter(
    (d) => d.year >= startYear && d.year <= endYear,
  );
  const allData: CrimeSummary[] = liveData || sampleFiltered;

  // Map crime type selector to data field
  const fieldMap: Record<string, keyof CrimeSummary> = {
    "violent-crime": "violent_crime",
    "property-crime": "property_crime",
    homicide: "homicide",
    "rape-revised": "rape_revised",
    robbery: "robbery",
    "aggravated-assault": "aggravated_assault",
    burglary: "burglary",
    larceny: "larceny",
    "motor-vehicle-theft": "motor_vehicle_theft",
    arson: "arson",
  };
  const field = fieldMap[crimeType] || "violent_crime";
  const fieldLabel = crimeType.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const scopeLabel = agencyOri || (stateAbbr ? `State: ${stateAbbr}` : "National");

  const filtered = allData.filter(
    (d) => d.year >= startYear && d.year <= endYear,
  );

  const kpis = [
    buildKPIFromSummary(filtered, field, fieldLabel),
    buildKPIFromSummary(filtered, "population", "Population", "number"),
    {
      label: `${fieldLabel} Rate`,
      value: filtered.length > 0
        ? computeRate(filtered[filtered.length - 1][field] as number, filtered[filtered.length - 1].population)
        : 0,
      previousValue: filtered.length > 1
        ? computeRate(filtered[filtered.length - 2][field] as number, filtered[filtered.length - 2].population)
        : undefined,
      format: "rate" as const,
    },
  ];

  const trendData = buildTrendData(filtered, field).map((d) => ({
    year: d.year,
    count: d.value,
    rate: d.rate ? Math.round(d.rate * 10) / 10 : 0,
  }));

  // Multi-crime comparison chart
  const comparisonData = filtered.map((d) => ({
    year: d.year,
    homicide: d.homicide,
    robbery: d.robbery,
    aggravated_assault: d.aggravated_assault,
    rape: d.rape_revised,
  }));

  const tableData = filtered.map((d) => ({
    year: d.year,
    population: d.population,
    violent_crime: d.violent_crime,
    property_crime: d.property_crime,
    homicide: d.homicide,
    robbery: d.robbery,
    aggravated_assault: d.aggravated_assault,
    violent_rate: computeRate(d.violent_crime, d.population),
  }));

  return (
    <>
      <FilterBar showCrimeType showState showYearRange showAgency />
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <PageHeader
          title="Crime Trends"
          description={`${scopeLabel} ${fieldLabel.toLowerCase()} statistics from ${startYear} to ${endYear}. Use the filters above to explore by crime type, state, agency, and year range.`}
        />

        <KPIBanner metrics={kpis} />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TrendChart
            data={trendData}
            dataKeys={[{ key: "count", label: `${fieldLabel} Count` }]}
            title={`${fieldLabel} Trend`}
            chartId="crime-trend-count"
          />
          <TrendChart
            data={trendData}
            dataKeys={[{ key: "rate", label: `${fieldLabel} Rate per 100k` }]}
            title={`${fieldLabel} Rate per 100,000`}
            chartId="crime-trend-rate"
          />
        </div>

        <div className="mt-6">
          <TrendChart
            data={comparisonData}
            dataKeys={[
              { key: "aggravated_assault", label: "Aggravated Assault" },
              { key: "robbery", label: "Robbery" },
              { key: "rape", label: "Rape" },
              { key: "homicide", label: "Homicide" },
            ]}
            title="Violent Crime Breakdown"
            chartId="crime-comparison"
          />
        </div>

        <div className="mt-6">
          <DataTable
            data={tableData}
            columns={[
              { key: "year", label: "Year", align: "left" },
              { key: "population", label: "Population", align: "right", format: (v) => formatNumber(v as number) },
              { key: "violent_crime", label: "Violent Crime", align: "right", format: (v) => formatNumber(v as number) },
              { key: "property_crime", label: "Property Crime", align: "right", format: (v) => formatNumber(v as number) },
              { key: "homicide", label: "Homicide", align: "right", format: (v) => formatNumber(v as number) },
              { key: "violent_rate", label: "Rate/100k", align: "right", format: (v) => formatRate(v as number) },
            ]}
            title="Annual Crime Statistics"
            tableId="crime-stats-table"
          />
        </div>
      </div>
    </>
  );
}
