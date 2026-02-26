"use client";

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
import { Download, Camera } from "lucide-react";
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
}: TrendChartProps) {
  const years = data.map((d) => d.year);
  const ticks = computeYearTicks(Math.min(...years), Math.max(...years));

  const handleCSV = () => {
    const headers = ["Year", ...dataKeys.map((k) => k.label)];
    const rows = data.map((d) => [d.year, ...dataKeys.map((k) => d[k.key] ?? 0)]);
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
        {showExport && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCSV} title="Download CSV">
              <Download className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleJPEG} title="Save as image">
              <Camera className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>
        )}
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
              tickFormatter={yAxisFormatter}
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
                Number(value).toLocaleString(),
                dataKeys.find((k) => k.key === name)?.label || String(name),
              ]}
            />
            {dataKeys.length > 1 && (
              <Legend
                wrapperStyle={{ fontSize: 11 }}
                formatter={(value) => dataKeys.find((k) => k.key === value)?.label || value}
              />
            )}
            {dataKeys.map((dk, i) =>
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
