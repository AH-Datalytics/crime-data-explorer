"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { KPIBanner } from "@/components/shared/kpi-banner";
import { USChoropleth } from "@/components/shared/us-choropleth";
import { DomainCard } from "@/components/shared/domain-card";
import { TrendChart } from "@/components/shared/trend-chart";
import { Loading } from "@/components/shared/loading";
import { useSummarized } from "@/lib/hooks/use-crime-data";
import type { DomainCard as DomainCardType, KPIMetric, StateMapData } from "@/lib/types";
import { US_STATES } from "@/lib/us-states";

const DOMAIN_CARDS: DomainCardType[] = [
  {
    title: "Crime Trends",
    description:
      "Explore national and state-level violent and property crime trends with 30+ offense types.",
    href: "/crime",
    icon: "trending-up",
  },
  {
    title: "Arrests",
    description:
      "Multi-offense comparison showing crime counts across different offense categories.",
    href: "/arrests",
    icon: "handcuffs",
  },
  {
    title: "Hate Crime",
    description:
      "Hate crime incidents by bias motivation, offense type, and trend over time.",
    href: "/hate-crime",
    icon: "alert-triangle",
  },
  {
    title: "Expanded Homicide",
    description:
      "Homicide trends from the FBI's Summarized Reporting System.",
    href: "/homicide",
    icon: "crosshair",
  },
  {
    title: "Agencies",
    description:
      "Browse 19,000+ law enforcement agencies and view their crime statistics.",
    href: "/agencies",
    icon: "building",
  },
  {
    title: "About",
    description:
      "Methodology, data sources, reporting coverage, and frequently asked questions.",
    href: "/about",
    icon: "info",
  },
];

export default function OverviewPage() {
  const router = useRouter();

  const { data, isLoading } = useSummarized("national", "violent-crime", 2015, 2024);

  const latest = data[data.length - 1];
  const prev = data[data.length - 2];

  const kpis: KPIMetric[] = latest
    ? [
        { label: "Violent Crime", value: latest.count, previousValue: prev?.count, format: "number" },
        { label: "Population", value: latest.population, format: "number" },
        { label: "Rate per 100k", value: latest.rate, previousValue: prev?.rate, format: "rate" },
        { label: "Clearances", value: latest.clearances, previousValue: prev?.clearances, format: "number" },
      ]
    : [];

  const trendData = data.map((d) => ({
    year: d.year,
    violent_crime: d.count,
    rate: d.rate,
  }));

  // Build state map data from real API — fetch each state's latest data
  // For performance, we use a static placeholder since fetching 51 states on overview is heavy
  const stateMapData: StateMapData[] = Object.entries(US_STATES).map(([abbr, name]) => ({
    state_abbr: abbr,
    state_name: name,
    value: 0,
    rate: 0,
    population: 0,
  }));

  const dataThrough = latest ? `Data through ${latest.year}` : "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <PageHeader
        title="National Crime Overview"
        description="Comprehensive FBI crime statistics for the United States. Click a state to explore regional data, or select a domain below for detailed analysis."
      />

      {isLoading ? (
        <Loading />
      ) : (
        <>
          {kpis.length > 0 && <KPIBanner metrics={kpis} />}

          {dataThrough && (
            <p className="mt-2 text-right text-[10px] font-mono text-muted-foreground">
              {dataThrough}
            </p>
          )}

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <USChoropleth
              data={stateMapData}
              valueField="rate"
              title="Violent Crime Rate by State (per 100,000)"
              onStateClick={(abbr) => router.push(`/crime?state=${abbr}`)}
            />

            <TrendChart
              data={trendData}
              dataKeys={[{ key: "violent_crime", label: "Violent Crime" }]}
              rateKey="rate"
              rateLabel="Rate per 100k"
              title="National Violent Crime Trend"
              chartId="overview-violent-trend"
            />
          </div>
        </>
      )}

      <div className="mt-8">
        <h2 className="mb-4 font-serif text-base font-bold text-navy">Explore the Data</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {DOMAIN_CARDS.map((card) => (
            <DomainCard key={card.href} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
}
