import AppShell from "@/components/layout/AppShell";
import CategoryRulesPageClient from "@/components/categories/CategoryRulesPageClient";
import { requireUser } from "@/lib/requireUser";

export const dynamic = "force-dynamic";

export default async function CategoryRulesPage() {
  const user = await requireUser();

  return (
    <AppShell userId={user.id} userEmail={user.email ?? "user"} title="CATEGORY RULES">
      <CategoryRulesPageClient userId={user.id} />
    </AppShell>
  );
}
