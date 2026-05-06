"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ModuleCard from "./ModuleCard";
import styles from "./modules.module.css";
import { BodyMetric, Workout } from "@/lib/types";

type FitnessModuleProps = {
  workouts: Workout[];
  bodyMetrics: BodyMetric[];
};

export default function FitnessModule({ workouts, bodyMetrics }: FitnessModuleProps) {
  const chartData = bodyMetrics
    .slice(0, 8)
    .reverse()
    .map((metric) => ({
      date: metric.date.slice(5),
      weight: Number(metric.weight),
      calories: metric.calories
    }));

  return (
    <ModuleCard title="Fitness" subtitle="Body metrics and workouts">
      <div className={styles.chartWrap}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <XAxis dataKey="date" tick={{ fill: "#767676", fontSize: 11 }} />
            <YAxis tick={{ fill: "#767676", fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                background: "#000",
                border: "1px solid #767676",
                color: "#dfdfdf"
              }}
            />
            <Line type="monotone" dataKey="weight" stroke="#EB0004" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {workouts.length === 0 ? (
        <p className={styles.empty}>No workouts logged.</p>
      ) : (
        <ul className={styles.list}>
          {workouts.slice(0, 3).map((workout) => (
            <li key={workout.id} className={styles.listItem}>
              <div>
                <p>{workout.name}</p>
                <p className={styles.muted}>
                  {new Date(workout.date).toLocaleDateString()} · {workout.workout_sets.length} sets
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </ModuleCard>
  );
}

