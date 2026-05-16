import AppShell from "@/components/layout/AppShell";
import FitnessPageClient from "@/components/pages/FitnessPageClient";
import { requireUser } from "@/lib/requireUser";

export const dynamic = "force-dynamic";

export default async function FitnessPage() {
  const user = await requireUser();

  return (
    <AppShell userId={user.id} userEmail={user.email ?? "user"} title="FITNESS">
      <FitnessPageClient userId={user.id} />
    </AppShell>
  );
}
