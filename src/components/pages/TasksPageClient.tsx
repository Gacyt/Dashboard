"use client";

import { useTasks } from "@/hooks/useTasks";
import TasksCard from "@/components/dashboard/TasksCard";

export default function TasksPageClient({ userId }: { userId: string }) {
  const { tasks, toggleTask } = useTasks(userId);

  return (
    <section className="nx-panel animate-fade-in-up">
      <TasksCard tasks={tasks} onToggleTask={toggleTask} />
    </section>
  );
}
