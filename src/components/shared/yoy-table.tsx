"use client";

import type { YearlyAggregate } from "@/lib/types";
import { formatNumber } from "@/lib/measures";
import { COLORS } from "@/lib/config";

interface YoYTableProps {
  data: YearlyAggregate[];
  label: string;
  showRate?: boolean;
}

export function YoYTable({ data, label, showRate = true }: YoYTableProps) {
  if (data.length < 2) return null;

  const sorted = [...data].sort((a, b) => b.year - a.year);
  const latest = sorted[0];
  const comparisons = sorted.slice(1, 4); // Up to 3 prior years

  const pctChange = (curr: number, prev: number) =>
    prev > 0 ? ((curr - prev) / prev) * 100 : 0;

  return (
    <div className="rounded-lg border border-border bg-white">
      <div className="border-b border-border px-4 py-3">
        <h3 className="font-serif text-sm font-bold text-navy">
          Year-over-Year Comparison — {label}
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-2 text-left font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Year
              </th>
              <th className="px-4 py-2 text-right font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Count
              </th>
              {showRate && (
                <th className="px-4 py-2 text-right font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Rate/100k
                </th>
              )}
              <th className="px-4 py-2 text-right font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Change
              </th>
              <th className="px-4 py-2 text-right font-mono text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                % Change
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border bg-muted/30 font-medium">
              <td className="px-4 py-2 font-mono text-xs tabular-nums text-navy">
                {latest.year}
              </td>
              <td className="px-4 py-2 text-right font-mono text-xs tabular-nums">
                {formatNumber(latest.count)}
              </td>
              {showRate && (
                <td className="px-4 py-2 text-right font-mono text-xs tabular-nums">
                  {latest.rate.toFixed(1)}
                </td>
              )}
              <td className="px-4 py-2 text-right font-mono text-xs tabular-nums text-muted-foreground">
                —
              </td>
              <td className="px-4 py-2 text-right font-mono text-xs tabular-nums text-muted-foreground">
                —
              </td>
            </tr>
            {comparisons.map((row) => {
              const change = latest.count - row.count;
              const pct = pctChange(latest.count, row.count);
              // Red = increase in crime (bad), blue = decrease (good)
              const color = pct > 0 ? COLORS.increase : pct < 0 ? COLORS.decrease : COLORS.neutral;
              return (
                <tr key={row.year} className="border-b border-border last:border-0">
                  <td className="px-4 py-2 font-mono text-xs tabular-nums">
                    {row.year}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs tabular-nums">
                    {formatNumber(row.count)}
                  </td>
                  {showRate && (
                    <td className="px-4 py-2 text-right font-mono text-xs tabular-nums">
                      {row.rate.toFixed(1)}
                    </td>
                  )}
                  <td className="px-4 py-2 text-right font-mono text-xs tabular-nums" style={{ color }}>
                    {change > 0 ? "+" : ""}
                    {formatNumber(change)}
                  </td>
                  <td className="px-4 py-2 text-right font-mono text-xs font-medium tabular-nums" style={{ color }}>
                    {pct > 0 ? "+" : ""}
                    {pct.toFixed(1)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
