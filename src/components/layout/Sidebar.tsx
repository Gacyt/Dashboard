import Link from "next/link";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { usePathname } from "next/navigation";

type SidebarProps = {
  newExpenseCount: number;
  pendingTasks: number;
  userEmail: string;
  isOpen?: boolean;
  onNavigate?: () => void;
};

function NavItem({
  href,
  label,
  currentPath,
  badge
}: {
  href: string;
  label: string;
  currentPath: string;
  badge?: string | number;
}) {
  const active =
    href === "/dashboard"
      ? currentPath === href
      : currentPath === href || currentPath.startsWith(`${href}/`);
  return (
    <Link className={`nx-nav-item ${active ? "active" : ""}`} href={href}>
      <span>{label}</span>
      {badge !== undefined ? <span className="nx-nav-badge">{badge}</span> : null}
    </Link>
  );
}

export default function Sidebar({
  newExpenseCount,
  pendingTasks,
  userEmail,
  isOpen,
  onNavigate
}: SidebarProps) {
  const pathname = usePathname();
  const initials = (userEmail || "NX").slice(0, 2).toUpperCase();

  return (
    <aside className={`nx-sidebar ${isOpen ? "is-open" : ""}`} onClick={onNavigate}>
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
        <NavItem href="/dashboard" label="Dashboard" currentPath={pathname} />
      </div>

      <div className="nx-nav-section">
        <p className="nx-nav-section-label">Systems</p>
        <NavItem href="/dashboard/finance" label="Finance" currentPath={pathname} badge={newExpenseCount} />
        <NavItem href="/dashboard/habits" label="Habits" currentPath={pathname} />
        <NavItem href="/dashboard/tasks" label="Tasks" currentPath={pathname} badge={pendingTasks} />
        <NavItem href="/dashboard/journal" label="Journal" currentPath={pathname} />
        <NavItem href="/dashboard/fitness" label="Fitness" currentPath={pathname} />
        <NavItem href="/dashboard/gym" label="Gym" currentPath={pathname} />
        <NavItem href="/dashboard/categories" label="Categories" currentPath={pathname} />
        <NavItem href="/dashboard/budget" label="Budget" currentPath={pathname} />
      </div>

      <div className="nx-nav-section">
        <p className="nx-nav-section-label">Tools</p>
        <NavItem href="/dashboard/analytics" label="Analytics" currentPath={pathname} />
        <NavItem href="/dashboard/webhook" label="Webhook" currentPath={pathname} />
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
