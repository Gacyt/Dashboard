"use client";

import { useMemo, useState } from "react";
import ModuleCard from "./ModuleCard";
import styles from "./modules.module.css";

type WebhookModuleProps = {
  webhookToken: string;
  onRegenerate: () => Promise<void>;
};

export default function WebhookModule({ webhookToken, onRegenerate }: WebhookModuleProps) {
  const [isBusy, setIsBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  const webhookUrl = useMemo(() => {
    const origin =
      typeof window === "undefined" ? "https://YOUR_DOMAIN" : window.location.origin;
    return `${origin}/api/webhook/expense?token=${webhookToken}`;
  }, [webhookToken]);

  const copyUrl = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const regenerate = async () => {
    setIsBusy(true);
    try {
      await onRegenerate();
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <ModuleCard title="Webhook" subtitle="Expense ingestion URL">
      <div className={styles.codeBlock}>
        <p className={styles.muted}>Token</p>
        <p className={styles.codeLine}>{webhookToken}</p>
      </div>
      <div className={styles.codeBlock}>
        <p className={styles.muted}>POST URL</p>
        <p className={styles.codeLine}>{webhookUrl}</p>
      </div>
      <div className={styles.buttonRow}>
        <button type="button" className={styles.actionButton} onClick={copyUrl}>
          {copied ? "Copied" : "Copy URL"}
        </button>
        <button
          type="button"
          className={styles.actionButton}
          disabled={isBusy}
          onClick={regenerate}
        >
          {isBusy ? "Updating..." : "Regenerate Token"}
        </button>
      </div>
    </ModuleCard>
  );
}
