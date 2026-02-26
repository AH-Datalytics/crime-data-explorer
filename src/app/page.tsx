"use client";

import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { KPIBanner } from "@/components/shared/kpi-banner";
import { USChoropleth } from "@/components/shared/us-choropleth";
import { DomainCard } from "@/components/shared/domain-card";
import { TrendChart } from "@/components/shared/trend-chart";
import {
  SAMPLE_NATIONAL_TREND,
  SAMPLE_STATE_MAP,
} from "@/lib/sample-data";
import { useNationalEstimates } from "@/lib/hooks/use-crime-data";
import { buildKPIFromSummary, buildTrendData } from "@/lib/measures";
import type { CrimeSummary, DomainCard as DomainCardType } from "@/lib/types";

const DOMAIN_CARDS: DomainCardType[] = [
  {
    title: "Crime Trends",
    description:
      "Explore national and state-level violent and property crime trends from 1985 to present.",
    href: "/crime",
    icon: "trending-up",
  },
  {
    title: "Arrests",
    description:
      "Arrest data by offense type, age, sex, and race across all reporting agencies.",
    href: "/arrests",
    icon: "handcuffs",
  },
  {
    title: "Hate Crime",
    description:
      "Hate crime incidents by bias motivation, offense type, victim type, and location.",
    href: "/hate-crime",
    icon: "alert-triangle",
  },
  {
    title: "Expanded Homicide",
    description:
      "Detailed homicide data including weapon type, victim/offender demographics, and circumstances.",
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

  // Try live API data, fall back to sample
  const { data: liveData } = useNationalEstimates("violent-crime", 1985, 2023);

  const apiResults: CrimeSummary[] | null = (() => {
    if (!liveData) return null;
    const arr = Array.isArray(liveData)
      ? liveData
      : liveData?.results ?? liveData?.data ?? null;
    if (!Array.isArray(arr) || arr.length === 0) return null;
    return arr;
  })();

  const data = apiResults || SAMPLE_NATIONAL_TREND;

  const kpis = [
    buildKPIFromSummary(data, "violent_crime", "Violent Crime"),
    buildKPIFromSummary(data, "property_crime", "Property Crime"),
    buildKPIFromSummary(data, "homicide", "Homicides"),
    buildKPIFromSummary(data, "aggravated_assault", "Aggravated Assault"),
  ];

  const trendData = buildTrendData(data, "violent_crime").map((d) => ({
    year: d.year,
    violent_crime: d.value,
    rate: d.rate ? Math.round(d.rate * 10) / 10 : 0,
  }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
      <PageHeader
        title="National Crime Overview"
        description="Comprehensive FBI crime statistics for the United States. Click a state to explore regional data, or select a domain below for detailed analysis."
      />

      <KPIBanner metrics={kpis} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <USChoropleth
          data={SAMPLE_STATE_MAP}
          valueField="rate"
          title="Violent Crime Rate by State (per 100,000)"
          onStateClick={(abbr) => router.push(`/crime?state=${abbr}`)}
        />

        <TrendChart
          data={trendData}
          dataKeys={[
            { key: "violent_crime", label: "Violent Crime" },
          ]}
          title="National Violent Crime Trend (1985–2023)"
          chartId="overview-violent-trend"
        />
      </div>

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
