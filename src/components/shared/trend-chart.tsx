"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { Download, Camera, BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORS, CHART_COLORS } from "@/lib/config";
import { computeYearTicks, generateCSV, downloadCSV, downloadChartAsJPEG } from "@/lib/chart-utils";

interface TrendChartProps {
  data: { year: number; [key: string]: number }[];
  dataKeys: { key: string; label: string; color?: string }[];
  title: string;
  chartId: string;
  chartType?: "line" | "bar";
  height?: number;
  yAxisFormatter?: (v: number) => string;
  showExport?: boolean;
  /** If provided alongside dataKeys, enables a toggle between counts and rates */
  rateKey?: string;
  rateLabel?: string;
}

export function TrendChart({
  data,
  dataKeys,
  title,
  chartId,
  chartType = "line",
  height = 320,
  yAxisFormatter = (v) => v.toLocaleString(),
  showExport = true,
  rateKey,
  rateLabel = "Rate per 100k",
}: TrendChartProps) {
  const [showRate, setShowRate] = useState(false);

  const years = data.map((d) => d.year);
  const ticks = years.length > 0
    ? computeYearTicks(Math.min(...years), Math.max(...years))
    : [];

  const activeKeys = showRate && rateKey
    ? [{ key: rateKey, label: rateLabel, color: COLORS.chart3 }]
    : dataKeys;

  const handleCSV = () => {
    const headers = ["Year", ...activeKeys.map((k) => k.label)];
    const rows = data.map((d) => [d.year, ...activeKeys.map((k) => d[k.key] ?? 0)]);
    downloadCSV(`${chartId}.csv`, generateCSV(headers, rows));
  };

  const handleJPEG = () => {
    downloadChartAsJPEG(chartId, chartId);
  };

  const Chart = chartType === "bar" ? BarChart : LineChart;

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-serif text-sm font-bold text-navy">{title}</h3>
        <div className="flex items-center gap-1">
          {rateKey && (
            <Button
              variant={showRate ? "default" : "ghost"}
              size="sm"
              className="h-7 gap-1 text-[10px]"
              onClick={() => setShowRate(!showRate)}
              title={showRate ? "Show counts" : "Show rates"}
            >
              {showRate ? (
                <><BarChart3 className="h-3 w-3" /> Counts</>
              ) : (
                <><TrendingUp className="h-3 w-3" /> Rates</>
              )}
            </Button>
          )}
          {showExport && (
            <>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCSV} title="Download CSV">
                <Download className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleJPEG} title="Save as image">
                <Camera className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </>
          )}
        </div>
      </div>
      <div id={chartId}>
        <ResponsiveContainer width="100%" height={height}>
          <Chart data={data}>
            <CartesianGrid strokeDasharray="none" stroke="#e8e8e8" vertical={false} />
            <XAxis
              dataKey="year"
              ticks={ticks}
              tick={{ fontSize: 11, fill: "#999" }}
              axisLine={{ stroke: "#d4d4d4" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#999" }}
              tickFormatter={showRate && rateKey ? (v) => v.toFixed(1) : yAxisFormatter}
              axisLine={false}
              tickLine={false}
              width={65}
            />
            <Tooltip
              contentStyle={{
                fontSize: 12,
                border: "1px solid #d4d4d4",
                boxShadow: "none",
                borderRadius: 6,
              }}
              formatter={(value, name) => [
                showRate && rateKey
                  ? Number(value).toFixed(1)
                  : Number(value).toLocaleString(),
                activeKeys.find((k) => k.key === name)?.label || String(name),
              ]}
            />
            {activeKeys.length > 1 && (
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value) => activeKeys.find((k) => k.key === value)?.label || value}
              />
            )}
            {activeKeys.map((dk, i) =>
              chartType === "bar" ? (
                <Bar
                  key={dk.key}
                  dataKey={dk.key}
                  fill={dk.color || CHART_COLORS[i % CHART_COLORS.length]}
                  radius={[2, 2, 0, 0]}
                />
              ) : (
                <Line
                  key={dk.key}
                  type="monotone"
                  dataKey={dk.key}
                  stroke={dk.color || CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={1.5}
                  dot={data.length < 30}
                  animationDuration={500}
                />
              ),
            )}
          </Chart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
