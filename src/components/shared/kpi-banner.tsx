"use client";

import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import type { KPIMetric } from "@/lib/types";
import { formatKPIValue, formatPercent } from "@/lib/measures";

interface KPIBannerProps {
  metrics: KPIMetric[];
}

function KPICard({ metric }: { metric: KPIMetric }) {
  const { label, value, previousValue, format = "number", invertColor } = metric;
  const pctChange =
    previousValue && previousValue > 0
      ? ((value - previousValue) / previousValue) * 100
      : 0;

  // For crime data: increase = bad (red), decrease = good (blue)
  // invertColor flips this for metrics where up is good
  const isUp = pctChange > 2;
  const isDown = pctChange < -2;
  const color = isUp
    ? invertColor ? "text-blue-300" : "text-red-300"
    : isDown
      ? invertColor ? "text-red-300" : "text-blue-300"
      : "text-white/60";

  const Icon = isUp ? ArrowUp : isDown ? ArrowDown : Minus;

  return (
    <div className="px-4 py-3 text-center md:px-6">
      <p className="text-xs font-medium uppercase tracking-wider text-white/60">
        {label}
      </p>
      <p className="mt-1 font-serif text-2xl font-bold tabular-nums text-white">
        {formatKPIValue(value, format)}
      </p>
      {previousValue != null && (
        <div className={`mt-1 flex items-center justify-center gap-1 text-xs ${color}`}>
          <Icon className="h-3 w-3" />
          <span>{formatPercent(pctChange)}</span>
          <span className="text-white/40">vs {formatKPIValue(previousValue, format)}</span>
        </div>
      )}
    </div>
  );
}

export function KPIBanner({ metrics }: KPIBannerProps) {
  return (
    <div className="rounded-lg bg-navy">
      <div
        className={`grid divide-y divide-white/10 md:divide-x md:divide-y-0 ${
          metrics.length <= 2
            ? "grid-cols-1 md:grid-cols-2"
            : metrics.length === 3
              ? "grid-cols-1 md:grid-cols-3"
              : "grid-cols-2 md:grid-cols-4"
        }`}
      >
        {metrics.map((m) => (
          <KPICard key={m.label} metric={m} />
        ))}
      </div>
    </div>
  );
}
