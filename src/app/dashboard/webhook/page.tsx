import AppShell from "@/components/layout/AppShell";
import WebhookPageClient from "@/components/pages/WebhookPageClient";
import { requireUser } from "@/lib/requireUser";

export const dynamic = "force-dynamic";

export default async function WebhookPage() {
  const user = await requireUser();

  return (
    <AppShell userId={user.id} userEmail={user.email ?? "user"} title="WEBHOOK">
      <WebhookPageClient />
    </AppShell>
  );
}
