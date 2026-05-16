import AppShell from "@/components/layout/AppShell";
import HabitsPageClient from "@/components/pages/HabitsPageClient";
import { requireUser } from "@/lib/requireUser";

export const dynamic = "force-dynamic";

export default async function HabitsPage() {
  const user = await requireUser();

  return (
    <AppShell userId={user.id} userEmail={user.email ?? "user"} title="HABITS">
      <HabitsPageClient userId={user.id} />
    </AppShell>
  );
}
