"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function HabitLineChart({
  data,
  height = 90
}: {
  data: Array<{ day: string; pct: number }>;
  height?: number;
}) {
  return (
    <div style={{ width: "100%", height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid stroke="var(--grid-lines)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "var(--txt3)", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 50, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: "var(--txt3)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={30}
          />
          <Tooltip formatter={(value: number) => `${Math.round(value)}%`} />
          <Area
            type="monotone"
            dataKey="pct"
            stroke="var(--accent)"
            fill="var(--accent-dim)"
            strokeWidth={2}
            dot={{ r: 2, fill: "var(--accent)" }}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
