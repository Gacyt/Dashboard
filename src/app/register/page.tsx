import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import styles from "@/components/auth/auth.module.css";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className={styles.authPage}>
      <section className={styles.authCard}>
        <p className={styles.kicker}>Nexus [LifeOS]</p>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.subtitle}>Start your personalized LifeOS dashboard.</p>
        <AuthForm mode="register" />
        <p className={styles.helper}>
          Have an account? <Link href="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

