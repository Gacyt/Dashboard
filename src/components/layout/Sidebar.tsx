import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";

type SidebarProps = {
  newExpenseCount: number;
  pendingTasks: number;
  userEmail: string;
};

function NavItem({
  label,
  active,
  badge
}: {
  label: string;
  active?: boolean;
  badge?: string | number;
}) {
  return (
    <a className={`nx-nav-item ${active ? "active" : ""}`} href={`#${label.toLowerCase()}`}>
      <span>{label}</span>
      {badge !== undefined ? <span className="nx-nav-badge">{badge}</span> : null}
    </a>
  );
}

export default function Sidebar({ newExpenseCount, pendingTasks, userEmail }: SidebarProps) {
  const initials = (userEmail || "NX").slice(0, 2).toUpperCase();

  return (
    <aside className="nx-sidebar">
      <div className="nx-sidebar-top">
        <div className="nx-logo">
          <div className="nx-logo-mark">NX</div>
          <div className="nx-logo-text">
            <p className="nx-logo-name">NEXUS</p>
            <p className="nx-logo-sub">LIFEOS</p>
          </div>
        </div>
      </div>

      <div className="nx-nav-section">
        <p className="nx-nav-section-label">Overview</p>
        <NavItem label="Dashboard" active />
      </div>

      <div className="nx-nav-section">
        <p className="nx-nav-section-label">Systems</p>
        <NavItem label="Finance" badge={newExpenseCount} />
        <NavItem label="Habits" />
        <NavItem label="Tasks" badge={pendingTasks} />
        <NavItem label="Journal" />
        <NavItem label="Fitness" />
      </div>

      <div className="nx-nav-section">
        <p className="nx-nav-section-label">Tools</p>
        <NavItem label="Calendar" />
        <NavItem label="Webhook" />
        <NavItem label="Analytics" />
      </div>

      <div className="nx-sidebar-footer">
        <ThemeToggle />
        <div className="nx-user-row">
          <div className="nx-avatar">{initials}</div>
          <div>
            <p className="nx-user-name">{userEmail}</p>
            <p className="nx-user-sub">Pro Plan</p>
          </div>
        </div>
        <Link href="/dashboard" className="nx-mini-link">
          COMMAND CENTER
        </Link>
      </div>
    </aside>
  );
}
