"use client";

import { useEffect, useMemo, useState } from "react";
import { useToast } from "@/hooks/useToast";

export default function WebhookPageClient() {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const { pushToast } = useToast();

  const endpoint = useMemo(() => {
    const origin = typeof window === "undefined" ? "https://your-domain.com" : window.location.origin;
    return `${origin}/api/webhook/expense?token=${token || "USER_TOKEN"}`;
  }, [token]);

  useEffect(() => {
    fetch("/api/dashboard/webhook")
      .then((response) => response.json())
      .then((payload) => setToken(payload.webhook_token))
      .finally(() => setLoading(false));
  }, []);

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    pushToast(`${label} copied.`, "success");
  };

  return (
    <div className="stagger">
      <section className="nx-panel animate-fade-in-up">
        <div className="nx-between" style={{ marginBottom: "10px", gap: "10px", flexWrap: "wrap" }}>
          <div>
            <h2 className="nx-card-title">Webhook ingestion</h2>
            <p className="nx-card-sub">Send expenses from external tools directly into your finance system.</p>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button className="nx-btn" type="button" onClick={() => copy(endpoint, "Endpoint")}>
              Copy endpoint
            </button>
            <button
              className="nx-btn"
              type="button"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                try {
                  const response = await fetch("/api/dashboard/webhook/regenerate", { method: "POST" });
                  const payload = await response.json();
                  if (!response.ok) {
                    throw new Error(payload.error ?? "Unable to regenerate token.");
                  }
                  setToken(payload.webhook_token);
                  pushToast("Webhook token regenerated.", "success");
                } catch (error) {
                  pushToast(error instanceof Error ? error.message : "Unable to regenerate token.", "error");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? "Updating..." : "Regenerate token"}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="nx-form-grid">
            <div className="nx-skeleton" style={{ height: "56px" }} />
            <div className="nx-skeleton" style={{ height: "140px" }} />
          </div>
        ) : (
          <div className="nx-form-grid">
            <article className="nx-panel">
              <p className="nx-list-label">Endpoint</p>
              <pre className="nx-code">{endpoint}</pre>
            </article>
            <article className="nx-panel">
              <p className="nx-list-label">Token</p>
              <pre className="nx-code">{token || "No token available yet."}</pre>
            </article>
          </div>
        )}
      </section>

      <section className="nx-doc-grid">
        <article className="nx-panel">
          <h3 className="nx-card-title">Request format</h3>
          <p className="nx-prose">Use a POST request with JSON to capture an expense.</p>
          <pre className="nx-code">{`POST /api/webhook/expense?token=USER_TOKEN
Content-Type: application/json

{
  "amount": 2500,
  "category": "food",
  "description": "McDonalds"
}`}</pre>
        </article>

        <article className="nx-panel">
          <h3 className="nx-card-title">Field reference</h3>
          <div className="nx-form-grid">
            <div className="nx-panel">
              <strong>amount (required)</strong>
              <p className="nx-card-sub">Positive number. Example: 2500 or 42.5</p>
            </div>
            <div className="nx-panel">
              <strong>category (optional)</strong>
              <p className="nx-card-sub">Category text. If omitted or set to none, auto-rule matching runs.</p>
            </div>
            <div className="nx-panel">
              <strong>description (optional)</strong>
              <p className="nx-card-sub">Free text used for logs and rule matching context.</p>
            </div>
          </div>
        </article>
      </section>

      <section className="nx-doc-grid">
        <article className="nx-panel">
          <h3 className="nx-card-title">Apple Shortcuts</h3>
          <ol className="nx-prose" style={{ paddingLeft: "18px" }}>
            <li>Add “Get Contents of URL”.</li>
            <li>Set method to POST and URL to your endpoint with token.</li>
            <li>Set request body to JSON with amount, category, description.</li>
            <li>Run shortcut and check Finance → Recent Expenses.</li>
          </ol>
        </article>

        <article className="nx-panel">
          <h3 className="nx-card-title">Python requests example</h3>
          <pre className="nx-code">{`import requests

endpoint = "${endpoint}"
payload = {
    "amount": 2500,
    "category": "food",
    "description": "McDonalds"
}

response = requests.post(endpoint, json=payload, timeout=10)
print(response.status_code)
print(response.json())`}</pre>
        </article>
      </section>

      <section className="nx-panel">
        <h3 className="nx-card-title">Error handling</h3>
        <div className="nx-form-grid">
          <div className="nx-panel">
            <strong>400 · Missing token / invalid amount</strong>
            <p className="nx-card-sub">Verify query token and send amount greater than zero.</p>
          </div>
          <div className="nx-panel">
            <strong>401 · Unauthorized</strong>
            <p className="nx-card-sub">Token does not match your profile. Regenerate and update automation.</p>
          </div>
          <div className="nx-panel">
            <strong>500 · Database failure</strong>
            <p className="nx-card-sub">Check Supabase availability and RLS policy setup.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
