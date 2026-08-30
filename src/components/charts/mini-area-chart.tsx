"use client";

import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { chartColors } from "./theme";

export function MiniAreaChart({ data, dataKey = "value", height = 220 }: { data: { label: string; value: number }[]; dataKey?: string; height?: number }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id="heroArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.brand} stopOpacity={0.35} />
            <stop offset="100%" stopColor={chartColors.brand} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={chartColors.grid} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: chartColors.ink }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: chartColors.ink }} axisLine={false} tickLine={false} width={32} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "1px solid #e4e6ec", fontSize: 12 }}
          labelStyle={{ fontWeight: 600 }}
        />
        <Area type="monotone" dataKey={dataKey} stroke={chartColors.brand} strokeWidth={2.5} fill="url(#heroArea)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
