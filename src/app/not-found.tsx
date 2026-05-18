import Link from "next/link";

export default function NotFound() {
  return (
    <main className="nx-app" style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: "18px" }}>
      <section className="nx-panel" style={{ maxWidth: "560px" }}>
        <h1 className="nx-card-title" style={{ marginBottom: "10px" }}>
          Page not found
        </h1>
        <p className="nx-prose">
          The page you requested does not exist or was moved. Use the command center to continue your workflow.
        </p>
        <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
          <Link className="nx-btn primary" href="/dashboard">
            Go to dashboard
          </Link>
          <Link className="nx-btn" href="/login">
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
