"use client";

import Link from "next/link";
import { useState } from "react";
import JournalModule from "@/components/modules/JournalModule";
import styles from "@/components/dashboard/dashboard.module.css";
import moduleStyles from "@/components/modules/modules.module.css";
import { JournalEntry } from "@/lib/types";

type JournalPageClientProps = {
  initialEntries: JournalEntry[];
};

export default function JournalPageClient({ initialEntries }: JournalPageClientProps) {
  const [entries, setEntries] = useState(initialEntries);

  async function requestJson(path: string, init?: RequestInit) {
    const response = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {})
      }
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error ?? "Request failed");
    }
    return payload;
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brandWrap}>
          <span className={styles.brandDot} aria-hidden />
          <p className={styles.brand}>
            Nexus
            <br />
            [LifeOS]
          </p>
        </div>
        <div className={styles.headerActions}>
          <Link className={styles.logoutButton} href="/dashboard">
            Back
          </Link>
        </div>
      </header>
      <main className={styles.main}>
        <section className={styles.moduleGrid}>
          <div className={moduleStyles.anchor}>
            <JournalModule
              journalEntries={entries}
              onCreateEntry={async (payload) => {
                const result = await requestJson("/api/dashboard/journal", {
                  method: "POST",
                  body: JSON.stringify(payload)
                });
                setEntries((prev) => [result.entry, ...prev]);
              }}
              onUpdateEntry={async (entryId, payload) => {
                const result = await requestJson(`/api/dashboard/journal/${entryId}`, {
                  method: "PATCH",
                  body: JSON.stringify(payload)
                });
                setEntries((prev) =>
                  prev.map((entry) => (entry.id === entryId ? result.entry : entry))
                );
              }}
              onDeleteEntry={async (entryId) => {
                await requestJson(`/api/dashboard/journal/${entryId}`, { method: "DELETE" });
                setEntries((prev) => prev.filter((entry) => entry.id !== entryId));
              }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}
