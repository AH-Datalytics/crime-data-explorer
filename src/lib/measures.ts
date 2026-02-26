import type { CrimeSummary, KPIMetric, ChartDataPoint, DemographicBreakdown } from "./types";

export function computeYTDComparison(
  data: CrimeSummary[],
  field: keyof CrimeSummary,
): { current: number; previous: number; pctChange: number } {
  const sorted = [...data].sort((a, b) => b.year - a.year);
  const current = (sorted[0]?.[field] as number) ?? 0;
  const previous = (sorted[1]?.[field] as number) ?? 0;
  const pctChange = previous > 0 ? ((current - previous) / previous) * 100 : 0;
  return { current, previous, pctChange };
}

export function buildTrendData(
  data: CrimeSummary[],
  field: keyof CrimeSummary,
): ChartDataPoint[] {
  return data
    .filter((d) => d[field] != null)
    .sort((a, b) => a.year - b.year)
    .map((d) => ({
      year: d.year,
      value: d[field] as number,
      rate: d.population > 0 ? ((d[field] as number) / d.population) * 100000 : undefined,
    }));
}

export function computeRate(count: number, population: number): number {
  return population > 0 ? (count / population) * 100000 : 0;
}

export function buildKPIFromSummary(
  data: CrimeSummary[],
  field: keyof CrimeSummary,
  label: string,
  format: "number" | "rate" | "percent" = "number",
): KPIMetric {
  const { current, previous } = computeYTDComparison(data, field);
  return { label, value: current, previousValue: previous, format };
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function formatRate(n: number): string {
  return n.toFixed(1);
}

export function formatPercent(n: number): string {
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

export function formatKPIValue(value: number, format: "number" | "rate" | "percent" = "number"): string {
  switch (format) {
    case "rate":
      return formatRate(value);
    case "percent":
      return formatPercent(value);
    default:
      return formatNumber(value);
  }
}

export function buildDemographicBreakdown(
  data: Record<string, number>,
): DemographicBreakdown[] {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  return Object.entries(data)
    .map(([category, value]) => ({
      category,
      value,
      percentage: total > 0 ? (value / total) * 100 : 0,
    }))
    .sort((a, b) => b.value - a.value);
}
