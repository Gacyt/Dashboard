import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth/AuthForm";
import styles from "@/components/auth/auth.module.css";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
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
        <h1 className={styles.title}>Sign in</h1>
        <p className={styles.subtitle}>Continue to your modular workspace.</p>
        <AuthForm mode="login" />
        <p className={styles.helper}>
          New here? <Link href="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}

