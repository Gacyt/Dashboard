"use client";

import { useEffect, useState } from "react";
import WebhookModule from "@/components/modules/WebhookModule";

export default function WebhookPageClient() {
  const [token, setToken] = useState("");

  useEffect(() => {
    fetch("/api/dashboard/webhook")
      .then((response) => response.json())
      .then((payload) => setToken(payload.webhook_token));
  }, []);

  return (
    <section className="nx-panel animate-fade-in-up">
      {token ? (
        <WebhookModule
          webhookToken={token}
          onRegenerate={async () => {
            const response = await fetch("/api/dashboard/webhook/regenerate", { method: "POST" });
            const payload = await response.json();
            setToken(payload.webhook_token);
          }}
        />
      ) : (
        <p>Loading webhook token...</p>
      )}
    </section>
  );
}
