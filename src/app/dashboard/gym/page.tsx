import AppShell from "@/components/layout/AppShell";
import GymPageClient from "@/components/gym/GymPageClient";
import { requireUser } from "@/lib/requireUser";

export const dynamic = "force-dynamic";

export default async function GymPage() {
  const user = await requireUser();

  return (
    <AppShell userId={user.id} userEmail={user.email ?? "user"} title="GYM ROUTINE">
      <GymPageClient userId={user.id} />
    </AppShell>
  );
}
