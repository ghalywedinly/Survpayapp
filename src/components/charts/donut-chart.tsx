"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getCategoricalPalette, getTooltipStyle } from "./theme";
import { useTheme } from "@/lib/theme/provider";

export function DonutChart({
  data,
  size = 200,
}: {
  data: { label: string; value: number }[];
  size?: number;
}) {
  const { theme } = useTheme();
  const palette = getCategoricalPalette(theme === "dark");
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="label" innerRadius="68%" outerRadius="100%" paddingAngle={2} stroke="none">
            {data.map((_, i) => (
              <Cell key={i} fill={palette[i % palette.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={getTooltipStyle(theme === "dark")} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-semibold text-ink-900">{total.toLocaleString()}</span>
      </div>
    </div>
  );
}
