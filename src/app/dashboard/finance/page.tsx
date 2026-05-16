import AppShell from "@/components/layout/AppShell";
import FinancePageClient from "@/components/finance/FinancePageClient";
import { requireUser } from "@/lib/requireUser";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const user = await requireUser();

  return (
    <AppShell userId={user.id} userEmail={user.email ?? "user"} title="FINANCE">
      <FinancePageClient userId={user.id} />
    </AppShell>
  );
}
