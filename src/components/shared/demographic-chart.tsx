"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/lib/config";
import { generateCSV, downloadCSV } from "@/lib/chart-utils";
import type { DemographicBreakdown } from "@/lib/types";

interface DemographicChartProps {
  data: DemographicBreakdown[];
  title: string;
  chartId: string;
  color?: string;
  height?: number;
  showExport?: boolean;
}

export function DemographicChart({
  data,
  title,
  chartId,
  color = COLORS.chart1,
  height = 280,
  showExport = true,
}: DemographicChartProps) {
  const handleCSV = () => {
    const headers = ["Category", "Count", "Percentage"];
    const rows = data.map((d) => [d.category, d.value, `${d.percentage.toFixed(1)}%`]);
    downloadCSV(`${chartId}.csv`, generateCSV(headers, rows));
  };

  return (
    <div className="rounded-lg border border-border bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-serif text-sm font-bold text-navy">{title}</h3>
        {showExport && (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCSV} title="Download CSV">
            <Download className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
        )}
      </div>
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data} layout="vertical" margin={{ left: 0 }}>
          <CartesianGrid strokeDasharray="none" stroke="#e8e8e8" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "#999" }}
            tickFormatter={(v) => v.toLocaleString()}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="category"
            tick={{ fontSize: 11, fill: "#666" }}
            axisLine={false}
            tickLine={false}
            width={120}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, border: "1px solid #d4d4d4", boxShadow: "none", borderRadius: 6 }}
            formatter={(value) => [Number(value).toLocaleString(), "Count"]}
          />
          <Bar dataKey="value" fill={color} radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
