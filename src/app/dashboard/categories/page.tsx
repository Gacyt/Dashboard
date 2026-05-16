import AppShell from "@/components/layout/AppShell";
import CategoriesPageClient from "@/components/categories/CategoriesPageClient";
import { requireUser } from "@/lib/requireUser";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const user = await requireUser();

  return (
    <AppShell userId={user.id} userEmail={user.email ?? "user"} title="CATEGORIES">
      <CategoriesPageClient userId={user.id} />
    </AppShell>
  );
}
