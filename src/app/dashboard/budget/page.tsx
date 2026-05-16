import AppShell from "@/components/layout/AppShell";
import BudgetPageClient from "@/components/budget/BudgetPageClient";
import { requireUser } from "@/lib/requireUser";

export const dynamic = "force-dynamic";

export default async function BudgetPage() {
  const user = await requireUser();

  return (
    <AppShell userId={user.id} userEmail={user.email ?? "user"} title="BUDGET">
      <BudgetPageClient userId={user.id} />
    </AppShell>
  );
}
