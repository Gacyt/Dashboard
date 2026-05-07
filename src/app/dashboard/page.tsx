import { redirect } from "next/navigation";
import DashboardView from "@/components/dashboard/DashboardView";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <DashboardView userId={user.id} userEmail={user.email ?? "user"} />;
}

