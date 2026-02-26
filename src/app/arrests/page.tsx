"use client";

import { PageHeader } from "@/components/shared/page-header";
import { KPIBanner } from "@/components/shared/kpi-banner";
import { FilterBar } from "@/components/shared/filter-bar";
import { TrendChart } from "@/components/shared/trend-chart";
import { DataTable } from "@/components/shared/data-table";
import { Loading } from "@/components/shared/loading";
import { useFilterStore } from "@/lib/stores/filter-store";
import { useSummarized } from "@/lib/hooks/use-crime-data";
import { formatNumber } from "@/lib/measures";
import type { KPIMetric } from "@/lib/types";

// Since the /arrest/ endpoint requires auth, we show a multi-offense comparison
// using the /summarized/ endpoint which works for all crime types.
const OFFENSE_TYPES = [
  { value: "violent-crime", label: "Violent Crime", shortLabel: "Violent" },
  { value: "property-crime", label: "Property Crime", shortLabel: "Property" },
  { value: "robbery", label: "Robbery", shortLabel: "Robbery" },
  { value: "burglary", label: "Burglary", shortLabel: "Burglary" },
  { value: "motor-vehicle-theft", label: "Motor Vehicle Theft", shortLabel: "MVT" },
  { value: "arson", label: "Arson", shortLabel: "Arson" },
];

export default function ArrestsPage() {
  const { stateAbbr, startYear, endYear, agencyOri } = useFilterStore();

  const scope = agencyOri
    ? `agency/${agencyOri}`
    : stateAbbr
      ? `state/${stateAbbr}`
      : "national";

  // Fetch multiple offense types for comparison
  const violent = useSummarized(scope, "violent-crime", startYear, endYear);
  const property = useSummarized(scope, "property-crime", startYear, endYear);
  const robbery = useSummarized(scope, "robbery", startYear, endYear);
  const burglary = useSummarized(scope, "burglary", startYear, endYear);
  const mvt = useSummarized(scope, "motor-vehicle-theft", startYear, endYear);
  const arson = useSummarized(scope, "arson", startYear, endYear);

  const allData = [violent, property, robbery, burglary, mvt, arson];
  const isLoading = allData.some((d) => d.isLoading);

  const scopeLabel = agencyOri || (stateAbbr ? `State: ${stateAbbr}` : "National");

  // Get latest values for KPIs
  const latestViolent = violent.data[violent.data.length - 1];
  const prevViolent = violent.data[violent.data.length - 2];
  const latestProperty = property.data[property.data.length - 1];
  const prevProperty = property.data[property.data.length - 2];
  const latestRobbery = robbery.data[robbery.data.length - 1];
  const latestBurglary = burglary.data[burglary.data.length - 1];

  const kpis: KPIMetric[] = [
    ...(latestViolent ? [{ label: "Violent Crime", value: latestViolent.count, previousValue: prevViolent?.count, format: "number" as const }] : []),
    ...(latestProperty ? [{ label: "Property Crime", value: latestProperty.count, previousValue: prevProperty?.count, format: "number" as const }] : []),
    ...(latestRobbery ? [{ label: "Robbery", value: latestRobbery.count, format: "number" as const }] : []),
    ...(latestBurglary ? [{ label: "Burglary", value: latestBurglary.count, format: "number" as const }] : []),
  ];

  // Build combined year data for charts
  const years = new Set<number>();
  allData.forEach((d) => d.data.forEach((row) => years.add(row.year)));
  const sortedYears = Array.from(years).sort();

  const comparisonData = sortedYears.map((year) => {
    const row: { year: number; [key: string]: number } = { year };
    allData.forEach((d, i) => {
      const found = d.data.find((r) => r.year === year);
      row[OFFENSE_TYPES[i].shortLabel] = found?.count ?? 0;
    });
    return row;
  });

  // Table data
  const tableData = sortedYears.map((year) => {
    const row: { year: number; [key: string]: number } = { year };
    allData.forEach((d, i) => {
      const found = d.data.find((r) => r.year === year);
      row[OFFENSE_TYPES[i].value] = found?.count ?? 0;
    });
    return row;
  });

  return (
    <>
      <FilterBar showCrimeType={false} showState showYearRange showAgency />
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <PageHeader
          title="Multi-Offense Comparison"
          description={`${scopeLabel} offense counts across multiple crime categories. The FBI's arrest-specific endpoint requires authentication; this page shows offense counts from the Summarized Reporting System.`}
        />

        {isLoading ? (
          <Loading />
        ) : comparisonData.length === 0 ? (
          <div className="mt-8 rounded-lg border border-border bg-muted/50 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              No data available for {scopeLabel} ({startYear}–{endYear}).
            </p>
          </div>
        ) : (
          <>
            {kpis.length > 0 && <KPIBanner metrics={kpis} />}

            <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <TrendChart
                data={comparisonData}
                dataKeys={[
                  { key: "Violent", label: "Violent Crime" },
                  { key: "Property", label: "Property Crime" },
                ]}
                title="Violent vs Property Crime"
                chartId="arrest-violent-property"
              />
              <TrendChart
                data={comparisonData}
                dataKeys={[
                  { key: "Robbery", label: "Robbery" },
                  { key: "Burglary", label: "Burglary" },
                  { key: "MVT", label: "Motor Vehicle Theft" },
                  { key: "Arson", label: "Arson" },
                ]}
                title="Individual Offenses"
                chartId="arrest-individual"
              />
            </div>

            <div className="mt-6">
              <DataTable
                data={tableData}
                columns={[
                  { key: "year", label: "Year", align: "left" },
                  ...OFFENSE_TYPES.map((ot) => ({
                    key: ot.value,
                    label: ot.label,
                    align: "right" as const,
                    format: (v: unknown) => formatNumber(v as number),
                  })),
                ]}
                title="Annual Offense Counts by Type"
                tableId="arrest-data-table"
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}
