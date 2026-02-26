"use client";

import { useState, useMemo } from "react";
import { US_STATES } from "@/lib/us-states";
import { COLORS } from "@/lib/config";
import type { StateMapData } from "@/lib/types";

// Simplified SVG coordinates for US states (center x, center y for label placement)
// Using a grid-based cartogram approach for readability
const STATE_GRID: Record<string, [number, number]> = {
  ME: [10, 0], VT: [9, 1], NH: [10, 1], WA: [1, 1], MT: [2, 1], ND: [3, 1], MN: [4, 1], WI: [5, 1], MI: [7, 1],
  NY: [8, 2], MA: [10, 2], CT: [10, 3], RI: [11, 2],
  OR: [1, 2], ID: [2, 2], SD: [3, 2], IA: [4, 2], IL: [5, 2], IN: [6, 2], OH: [7, 2], PA: [8, 3],
  NJ: [9, 3], DE: [10, 4], MD: [9, 4], DC: [10, 5],
  NV: [1, 3], WY: [2, 3], NE: [3, 3], MO: [4, 3], KY: [6, 3], WV: [7, 3], VA: [8, 4],
  CA: [1, 4], UT: [2, 4], CO: [3, 4], KS: [4, 4], TN: [5, 4], NC: [7, 4], SC: [8, 5],
  AZ: [2, 5], NM: [3, 5], OK: [4, 5], AR: [5, 5], MS: [5, 6], AL: [6, 5], GA: [7, 5],
  TX: [3, 6], LA: [5, 7], FL: [7, 6],
  HI: [1, 7], AK: [0, 7],
};

const CELL_SIZE = 44;
const PADDING = 8;

interface USChoroplethProps {
  data: StateMapData[];
  valueField?: "value" | "rate";
  title?: string;
  onStateClick?: (stateAbbr: string) => void;
}

function getColorScale(value: number, min: number, max: number): string {
  if (max === min) return COLORS.primaryLight;
  const t = (value - min) / (max - min);
  // Navy color scale: light to dark
  const r = Math.round(220 - t * 219);
  const g = Math.round(230 - t * 173);
  const b = Math.round(240 - t * 132);
  return `rgb(${r}, ${g}, ${b})`;
}

export function USChoropleth({ data, valueField = "rate", title, onStateClick }: USChoroplethProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const { min, max, dataMap } = useMemo(() => {
    const map = new Map<string, StateMapData>();
    let min = Infinity;
    let max = -Infinity;
    for (const d of data) {
      map.set(d.state_abbr, d);
      const v = d[valueField];
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return { min, max, dataMap: map };
  }, [data, valueField]);

  const hoveredData = hoveredState ? dataMap.get(hoveredState) : null;

  const width = 12 * CELL_SIZE + PADDING * 2;
  const height = 8 * CELL_SIZE + PADDING * 2;

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      {title && <h3 className="mb-3 font-serif text-sm font-bold text-navy">{title}</h3>}

      {/* Tooltip */}
      {hoveredData && (
        <div className="mb-2 rounded-md border border-border bg-white px-3 py-2 text-xs shadow-sm">
          <span className="font-bold text-navy">{US_STATES[hoveredData.state_abbr]}</span>
          <span className="ml-2 font-mono text-muted-foreground">
            {valueField === "rate"
              ? `${hoveredData.rate.toFixed(1)} per 100k`
              : hoveredData.value.toLocaleString()}{" "}
            — Pop: {hoveredData.population.toLocaleString()}
          </span>
        </div>
      )}

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="US crime data map">
        {Object.entries(STATE_GRID).map(([abbr, [col, row]]) => {
          const stateData = dataMap.get(abbr);
          const val = stateData?.[valueField] ?? 0;
          const fill = stateData ? getColorScale(val, min, max) : "#e8e8e8";
          const x = PADDING + col * CELL_SIZE;
          const y = PADDING + row * CELL_SIZE;
          const isHovered = hoveredState === abbr;

          return (
            <g
              key={abbr}
              onMouseEnter={() => setHoveredState(abbr)}
              onMouseLeave={() => setHoveredState(null)}
              onClick={() => onStateClick?.(abbr)}
              className="cursor-pointer"
            >
              <rect
                x={x + 1}
                y={y + 1}
                width={CELL_SIZE - 2}
                height={CELL_SIZE - 2}
                rx={4}
                fill={fill}
                stroke={isHovered ? COLORS.primary : "#fff"}
                strokeWidth={isHovered ? 2 : 1}
              />
              <text
                x={x + CELL_SIZE / 2}
                y={y + CELL_SIZE / 2 - 3}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11}
                fontWeight={600}
                fill={stateData && val > (min + max) / 2 ? "#fff" : COLORS.primary}
              >
                {abbr}
              </text>
              {stateData && (
                <text
                  x={x + CELL_SIZE / 2}
                  y={y + CELL_SIZE / 2 + 10}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize={8}
                  fill={val > (min + max) / 2 ? "#fff" : "#999"}
                  fontFamily="var(--font-ibm-plex-mono)"
                >
                  {valueField === "rate" ? val.toFixed(0) : (val / 1000).toFixed(0) + "k"}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="mt-2 flex items-center justify-center gap-2">
        <span className="text-[10px] text-muted-foreground">Low</span>
        <div className="flex h-3 w-32 overflow-hidden rounded-sm">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ backgroundColor: getColorScale(min + (i / 9) * (max - min), min, max) }}
            />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">High</span>
      </div>
    </div>
  );
}
