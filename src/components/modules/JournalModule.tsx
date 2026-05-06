"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import ModuleCard from "./ModuleCard";
import styles from "./modules.module.css";
import { JournalEntry } from "@/lib/types";

type JournalModuleProps = {
  journalEntries: JournalEntry[];
};

const chartPalette = ["#EB0004", "#DFDFDF", "#767676", "#5135CD"];

export default function JournalModule({ journalEntries }: JournalModuleProps) {
  const moodMap = new Map<string, number>();

  for (const entry of journalEntries) {
    moodMap.set(entry.mood, (moodMap.get(entry.mood) ?? 0) + 1);
  }

  const moodData = Array.from(moodMap.entries()).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <ModuleCard title="Journal" subtitle="Mood and reflection">
      {moodData.length > 0 ? (
        <div className={styles.chartWrap}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={moodData} dataKey="value" nameKey="name" innerRadius={34} outerRadius={60}>
                {moodData.map((entry, index) => (
                  <Cell key={`${entry.name}-${index}`} fill={chartPalette[index % chartPalette.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#000",
                  border: "1px solid #767676",
                  color: "#dfdfdf"
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className={styles.empty}>No entries yet.</p>
      )}

      <ul className={styles.list}>
        {journalEntries.slice(0, 3).map((entry) => (
          <li className={styles.listItem} key={entry.id}>
            <div>
              <p>{entry.content.slice(0, 60)}{entry.content.length > 60 ? "..." : ""}</p>
              <p className={styles.muted}>
                {entry.mood} · {new Date(entry.created_at).toLocaleDateString()}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </ModuleCard>
  );
}

