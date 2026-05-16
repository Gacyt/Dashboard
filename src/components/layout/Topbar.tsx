import { openCreateHub } from "@/lib/createHub";

function TopbarIcon({ kind }: { kind: "search" | "notifications" | "settings" | "menu" | "plus" }) {
  if (kind === "menu") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "search") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "notifications") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 9a6 6 0 1 1 12 0v4.5l1.5 2H4.5l1.5-2V9Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M10 18a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  if (kind === "settings") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" stroke="currentColor" strokeWidth="1.7" />
        <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4.8a7.1 7.1 0 0 0-1.7-1l-.4-2.5H9.6L9.2 6a7.1 7.1 0 0 0-1.7 1l-2.4-.8-2 3.4L5 11a7 7 0 0 0 0 2l-1.9 1.4 2 3.4 2.4-.8a7.1 7.1 0 0 0 1.7 1l.4 2.5h4.8l.4-2.5a7.1 7.1 0 0 0 1.7-1l2.4.8 2-3.4L19 13c.1-.3.1-.7.1-1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Topbar({
  title = "COMMAND CENTER",
  onMenuClick
}: {
  title?: string;
  onMenuClick?: () => void;
}) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <header className="nx-topbar">
      <div className="nx-topbar-left">
        {onMenuClick ? (
          <button className="nx-topbar-btn nx-menu-btn" type="button" onClick={onMenuClick} aria-label="Open menu">
            <TopbarIcon kind="menu" />
          </button>
        ) : null}
        <div>
          <h1 className="nx-page-title">{title}</h1>
          <p className="nx-page-sub">{today}</p>
        </div>
      </div>
      <div className="nx-topbar-right">
        <button className="nx-topbar-btn" type="button" aria-label="Create" onClick={() => openCreateHub()}>
          <TopbarIcon kind="plus" />
        </button>
        <button className="nx-topbar-btn" type="button" aria-label="Search">
          <TopbarIcon kind="search" />
        </button>
        <button className="nx-topbar-btn" type="button" aria-label="Notifications">
          <TopbarIcon kind="notifications" />
        </button>
        <button className="nx-topbar-btn" type="button" aria-label="Settings">
          <TopbarIcon kind="settings" />
        </button>
      </div>
    </header>
  );
}
