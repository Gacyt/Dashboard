"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import styles from "./auth.module.css";

type AuthMode = "login" | "register";

type AuthFormProps = {
  mode: AuthMode;
};

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === "register";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setNotice(null);

    const authResult = isRegister
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (authResult.error) {
      setError(authResult.error.message);
      setIsSubmitting(false);
      return;
    }

    if (isRegister && !authResult.data.session) {
      setNotice("Account created. Check your inbox to verify your email.");
      setIsSubmitting(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <input
        className={styles.input}
        name="email"
        type="email"
        value={email}
        placeholder="Email"
        autoComplete="email"
        onChange={(event) => setEmail(event.target.value)}
        required
      />
      <input
        className={styles.input}
        name="password"
        type="password"
        value={password}
        placeholder="Password"
        autoComplete={isRegister ? "new-password" : "current-password"}
        onChange={(event) => setPassword(event.target.value)}
        minLength={8}
        required
      />

      {error ? <p className={styles.error}>{error}</p> : null}
      {notice ? <p className={styles.notice}>{notice}</p> : null}

      <button className={styles.button} type="submit" disabled={isSubmitting}>
        {isSubmitting
          ? "Working..."
          : isRegister
            ? "Create account"
            : "Sign in"}
      </button>
    </form>
  );
}

