"use client";

import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { getChartColors, getTooltipStyle } from "./theme";
import { useTheme } from "@/lib/theme/provider";

export function MiniAreaChart({ data, dataKey = "value", height = 220 }: { data: { label: string; value: number }[]; dataKey?: string; height?: number }) {
  const { theme } = useTheme();
  const colors = getChartColors(theme === "dark");

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={colors.brand} stopOpacity={0.35} />
            <stop offset="100%" stopColor={colors.brand} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={colors.grid} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: colors.ink }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: colors.ink }} axisLine={false} tickLine={false} width={32} />
        <Tooltip contentStyle={getTooltipStyle(theme === "dark")} labelStyle={{ fontWeight: 600 }} />
        <Area type="monotone" dataKey={dataKey} stroke={colors.brand} strokeWidth={2.5} fill="url(#heroArea)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
