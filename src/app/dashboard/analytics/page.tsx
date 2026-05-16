import AppShell from "@/components/layout/AppShell";
import AnalyticsPageClient from "@/components/pages/AnalyticsPageClient";
import { requireUser } from "@/lib/requireUser";

export const dynamic = "force-dynamic";

export default async function AnalyticsPage() {
  const user = await requireUser();

  return (
    <AppShell userId={user.id} userEmail={user.email ?? "user"} title="ANALYTICS">
      <AnalyticsPageClient userId={user.id} />
    </AppShell>
  );
}
