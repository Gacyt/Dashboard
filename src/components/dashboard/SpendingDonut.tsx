"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#2f8cdb", "#2bb78a", "#f09b3f", "#52607b"];

export default function SpendingDonut({
  data
}: {
  data: Array<{ name: string; value: number }>;
}) {
  return (
    <div style={{ width: "100%", height: 180 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="62%"
            outerRadius="80%"
            paddingAngle={2}
            isAnimationActive
            animationDuration={720}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number) => `${Math.round(value)}%`}
            contentStyle={{
              borderRadius: 10,
              border: "1px solid var(--border)",
              background: "color-mix(in oklab, var(--bg2) 88%, transparent)"
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
