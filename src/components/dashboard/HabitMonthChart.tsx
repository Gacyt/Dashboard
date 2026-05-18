"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function HabitMonthChart({
  data
}: {
  data: Array<{ day: number; pct: number }>;
}) {
  return (
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid stroke="var(--grid-lines)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "var(--txt3)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={20}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: "var(--txt3)", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={35}
          />
          <Tooltip formatter={(value: number) => `${Math.round(value)}%`} />
          <Area
            type="monotone"
            dataKey="pct"
            stroke="var(--green)"
            fill="var(--green-dim)"
            strokeWidth={2}
            dot={{ r: 2, fill: "var(--green)" }}
            isAnimationActive
            animationDuration={760}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
