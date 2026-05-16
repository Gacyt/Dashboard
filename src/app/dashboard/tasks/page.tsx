import AppShell from "@/components/layout/AppShell";
import TasksPageClient from "@/components/pages/TasksPageClient";
import { requireUser } from "@/lib/requireUser";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const user = await requireUser();

  return (
    <AppShell userId={user.id} userEmail={user.email ?? "user"} title="TASKS">
      <TasksPageClient userId={user.id} />
    </AppShell>
  );
}
