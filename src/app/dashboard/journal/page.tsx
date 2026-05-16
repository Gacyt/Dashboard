import AppShell from "@/components/layout/AppShell";
import JournalDashboardPageClient from "@/components/pages/JournalDashboardPageClient";
import { requireUser } from "@/lib/requireUser";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const user = await requireUser();

  return (
    <AppShell userId={user.id} userEmail={user.email ?? "user"} title="JOURNAL">
      <JournalDashboardPageClient userId={user.id} />
    </AppShell>
  );
}
