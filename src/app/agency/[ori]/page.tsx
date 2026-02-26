"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { KPIBanner } from "@/components/shared/kpi-banner";
import { TrendChart } from "@/components/shared/trend-chart";
import { DataTable } from "@/components/shared/data-table";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useAgencyCrimeCDE,
  useCDEAgenciesByState,
  useAgencyEmployment,
} from "@/lib/hooks/use-crime-data";
import { formatNumber } from "@/lib/measures";
import type { KPIMetric, AgencyListItem } from "@/lib/types";

interface PageProps {
  params: Promise<{ ori: string }>;
}

const CRIME_TYPES = [
  { value: "violent-crime", label: "Violent Crime" },
  { value: "property-crime", label: "Property Crime" },
  { value: "homicide", label: "Homicide" },
  { value: "robbery", label: "Robbery" },
  { value: "aggravated-assault", label: "Aggravated Assault" },
  { value: "burglary", label: "Burglary" },
  { value: "larceny", label: "Larceny" },
  { value: "motor-vehicle-theft", label: "Motor Vehicle Theft" },
];

export default function AgencyDetailPage({ params }: PageProps) {
  const { ori } = use(params);

  const [startYear, setStartYear] = useState(2015);
  const [endYear, setEndYear] = useState(2023);
  const [crimeType, setCrimeType] = useState("violent-crime");

  // Fetch crime data via CDE (no auth, reliable)
  const { data: crimeRaw, isLoading: loadingCrime } = useAgencyCrimeCDE(
    ori,
    crimeType,
    startYear,
    endYear,
  );
  // Also fetch property for comparison
  const { data: propertyRaw, isLoading: loadingProperty } = useAgencyCrimeCDE(
    ori,
    crimeType === "property-crime" ? "violent-crime" : "property-crime",
    startYear,
    endYear,
  );

  // Employment data
  const { data: employmentRaw, isLoading: loadingEmployment } = useAgencyEmployment(
    ori,
    2000,
    2023,
  );

  // Lookup agency info
  const statePrefix = ori.substring(0, 2).toUpperCase();
  const { data: stateAgencies } = useCDEAgenciesByState(statePrefix);
  const agencyInfo: AgencyListItem | undefined = stateAgencies?.find(
    (a) => a.ori === ori,
  );

  const crimeTypeLabel =
    CRIME_TYPES.find((t) => t.value === crimeType)?.label || crimeType;

  // Parse the CDE summarized response — it has monthly data by year
  // Structure: { offenses: { rates: { "State Offenses": { "MM-YYYY": rate }, "Agency Offenses": {...} }, counts: {...} } }
  const parseYearlyData = useMemo(() => {
    if (!crimeRaw || typeof crimeRaw !== "object") return [];

    const offenses = crimeRaw.offenses ?? crimeRaw;
    const counts = offenses?.counts ?? {};
    const rates = offenses?.rates ?? {};

    // Find agency-level keys (contain "Offenses" but not state name)
    const findAgencyKey = (obj: Record<string, unknown>) => {
      const keys = Object.keys(obj);
      // Agency keys are typically the shorter ones, or ones ending just in "Offenses"
      return (
        keys.find((k) => k.includes("Offenses") && !k.includes("Clearances")) ||
        keys[0]
      );
    };

    const agencyCountKey = findAgencyKey(counts);
    const agencyRateKey = findAgencyKey(rates);

    const agencyCounts = agencyCountKey
      ? (counts[agencyCountKey] as Record<string, number>) ?? {}
      : {};
    const agencyRates = agencyRateKey
      ? (rates[agencyRateKey] as Record<string, number>) ?? {}
      : {};

    // Aggregate monthly data into yearly totals
    const yearlyData = new Map<number, { count: number; rateSum: number; months: number }>();

    for (const [key, val] of Object.entries(agencyCounts)) {
      const match = key.match(/(\d{2})-(\d{4})/);
      if (!match) continue;
      const year = parseInt(match[2]);
      const existing = yearlyData.get(year) || { count: 0, rateSum: 0, months: 0 };
      existing.count += Number(val) || 0;
      yearlyData.set(year, existing);
    }

    for (const [key, val] of Object.entries(agencyRates)) {
      const match = key.match(/(\d{2})-(\d{4})/);
      if (!match) continue;
      const year = parseInt(match[2]);
      const existing = yearlyData.get(year) || { count: 0, rateSum: 0, months: 0 };
      existing.rateSum += Number(val) || 0;
      existing.months += 1;
      yearlyData.set(year, existing);
    }

    return Array.from(yearlyData.entries())
      .map(([year, d]) => ({
        year,
        count: d.count,
        rate: d.months > 0 ? Math.round((d.rateSum / d.months) * 10) / 10 : 0,
      }))
      .sort((a, b) => a.year - b.year);
  }, [crimeRaw]);

  // Parse secondary crime type for comparison
  const parseSecondaryData = useMemo(() => {
    if (!propertyRaw || typeof propertyRaw !== "object") return [];

    const offenses = propertyRaw.offenses ?? propertyRaw;
    const counts = offenses?.counts ?? {};
    const findAgencyKey = (obj: Record<string, unknown>) => {
      const keys = Object.keys(obj);
      return (
        keys.find((k) => k.includes("Offenses") && !k.includes("Clearances")) ||
        keys[0]
      );
    };
    const agencyCountKey = findAgencyKey(counts);
    const agencyCounts = agencyCountKey
      ? (counts[agencyCountKey] as Record<string, number>) ?? {}
      : {};

    const yearlyData = new Map<number, number>();
    for (const [key, val] of Object.entries(agencyCounts)) {
      const match = key.match(/(\d{2})-(\d{4})/);
      if (!match) continue;
      const year = parseInt(match[2]);
      yearlyData.set(year, (yearlyData.get(year) || 0) + (Number(val) || 0));
    }

    return Array.from(yearlyData.entries())
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year - b.year);
  }, [propertyRaw]);

  // Parse employment data
  const employmentTableData = useMemo(() => {
    if (!employmentRaw) return [];
    const arr = Array.isArray(employmentRaw)
      ? employmentRaw
      : employmentRaw?.results ?? employmentRaw?.data ?? [];
    if (!Array.isArray(arr)) return [];
    return arr
      .map((row: Record<string, unknown>) => ({
        year: Number(row.data_year ?? row.year ?? 0),
        total: Number(row.total_pe_ct ?? row.total ?? 0),
        male: Number(row.male_total_ct ?? row.male ?? 0),
        female: Number(row.female_total_ct ?? row.female ?? 0),
        sworn: Number(row.total_sworn_ct ?? row.sworn ?? 0),
        civilian: Number(row.total_civilian_ct ?? row.civilian ?? 0),
      }))
      .filter((r: { year: number }) => r.year > 0)
      .sort((a: { year: number }, b: { year: number }) => a.year - b.year);
  }, [employmentRaw]);

  // KPIs from latest year
  const latestYear = parseYearlyData[parseYearlyData.length - 1];
  const prevYear = parseYearlyData[parseYearlyData.length - 2];

  const kpis: KPIMetric[] = latestYear
    ? [
        {
          label: `${crimeTypeLabel} (${latestYear.year})`,
          value: latestYear.count,
          previousValue: prevYear?.count,
          format: "number",
        },
        {
          label: "Avg Monthly Rate",
          value: latestYear.rate,
          previousValue: prevYear?.rate,
          format: "rate",
        },
      ]
    : [];

  // Combined trend chart data
  const secondaryLabel =
    crimeType === "property-crime" ? "Violent Crime" : "Property Crime";
  const trendData = parseYearlyData.map((d) => {
    const secondary = parseSecondaryData.find((s) => s.year === d.year);
    return {
      year: d.year,
      [crimeTypeLabel]: d.count,
      [secondaryLabel]: secondary?.count ?? 0,
    };
  });

  // Full crime data table
  const tableData = parseYearlyData.map((d) => {
    const secondary = parseSecondaryData.find((s) => s.year === d.year);
    return {
      year: d.year,
      count: d.count,
      rate: d.rate,
      secondary: secondary?.count ?? 0,
    };
  });

  const isLoading = loadingCrime;

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
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CRIME_TYPES.map((ct) => (
              <SelectItem key={ct.value} value={ct.value}>
                {ct.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{startYear}</span>
          <Slider
            min={2000}
            max={2023}
            step={1}
            value={[startYear, endYear]}
            onValueChange={([s, e]) => {
              setStartYear(s);
              setEndYear(e);
            }}
            className="w-[160px]"
          />
          <span className="font-mono text-xs text-muted-foreground">{endYear}</span>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Loading crime data for {agencyInfo?.agency_name || ori}...
        </div>
      )}

      {/* No data */}
      {!isLoading && parseYearlyData.length === 0 && (
        <div className="mt-8 rounded-lg border border-border bg-muted/50 p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No {crimeTypeLabel.toLowerCase()} data available for this agency ({startYear}–{endYear}).
            The agency may not report to the FBI&apos;s UCR program, or data may not be available for the
            selected crime type and year range. Try selecting a different crime type above.
          </p>
        </div>
      )}

      {/* Main content */}
      {!isLoading && parseYearlyData.length > 0 && (
        <>
          <div className="mt-4">
            <KPIBanner metrics={kpis} />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TrendChart
              data={parseYearlyData.map((d) => ({
                year: d.year,
                count: d.count,
              }))}
              dataKeys={[{ key: "count", label: `${crimeTypeLabel} Count` }]}
              title={`${crimeTypeLabel} Trend (${startYear}–${endYear})`}
              chartId={`agency-${ori}-trend`}
            />
            <TrendChart
              data={parseYearlyData.map((d) => ({
                year: d.year,
                rate: d.rate,
              }))}
              dataKeys={[{ key: "rate", label: "Avg Monthly Rate per 100k" }]}
              title={`${crimeTypeLabel} Rate (${startYear}–${endYear})`}
              chartId={`agency-${ori}-rate`}
            />
          </div>

          {/* Comparison chart */}
          {trendData.length > 0 && (
            <div className="mt-6">
              <TrendChart
                data={trendData}
                dataKeys={[
                  { key: crimeTypeLabel, label: crimeTypeLabel },
                  { key: secondaryLabel, label: secondaryLabel },
                ]}
                title={`${crimeTypeLabel} vs ${secondaryLabel}`}
                chartId={`agency-${ori}-comparison`}
              />
            </div>
          )}

          {/* Full data table */}
          <div className="mt-6">
            <DataTable
              data={tableData}
              columns={[
                { key: "year", label: "Year", align: "left" },
                {
                  key: "count",
                  label: crimeTypeLabel,
                  align: "right",
                  format: (v) => formatNumber(Number(v ?? 0)),
                },
                {
                  key: "rate",
                  label: "Avg Rate/100k",
                  align: "right",
                  format: (v) => Number(v ?? 0).toFixed(1),
                },
                {
                  key: "secondary",
                  label: secondaryLabel,
                  align: "right",
                  format: (v) => formatNumber(Number(v ?? 0)),
                },
              ]}
              title={`Annual ${crimeTypeLabel} Data`}
              tableId={`agency-${ori}-crime`}
            />
          </div>
        </>
      )}

      {/* Employment section */}
      {!loadingEmployment && employmentTableData.length > 0 && (
        <div className="mt-6">
          <DataTable
            data={employmentTableData}
            columns={[
              { key: "year", label: "Year", align: "left" },
              {
                key: "total",
                label: "Total Personnel",
                align: "right",
                format: (v) => formatNumber(Number(v ?? 0)),
              },
              {
                key: "sworn",
                label: "Sworn",
                align: "right",
                format: (v) => formatNumber(Number(v ?? 0)),
              },
              {
                key: "civilian",
                label: "Civilian",
                align: "right",
                format: (v) => formatNumber(Number(v ?? 0)),
              },
              {
                key: "male",
                label: "Male",
                align: "right",
                format: (v) => formatNumber(Number(v ?? 0)),
              },
              {
                key: "female",
                label: "Female",
                align: "right",
                format: (v) => formatNumber(Number(v ?? 0)),
              },
            ]}
            title="Police Employment"
            tableId={`agency-${ori}-employment`}
          />
        </div>
      )}
    </div>
  );
}
