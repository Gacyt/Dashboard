"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import FloatingCreateHub from "@/components/layout/FloatingCreateHub";
import ThemeToggle from "@/components/ui/ThemeToggle";
import Modal from "@/components/ui/Modal";
import { openCreateHub } from "@/lib/createHub";
import { useExpenses } from "@/hooks/useExpenses";
import { useTasks } from "@/hooks/useTasks";

export default function AppShell({
  userId,
  userEmail,
  title,
  children
}: {
  userId: string;
  userEmail: string;
  title: string;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const { newExpenseCount } = useExpenses(userId);
  const { pendingCount } = useTasks(userId);

  const mobileNav = [
    { href: "/dashboard", label: "Home" },
    { href: "/dashboard/finance", label: "Finance" },
    { href: "/dashboard/tasks", label: "Tasks" },
    { href: "/dashboard/journal", label: "Journal" },
    { href: "/dashboard/gym", label: "Gym" }
  ];

  const commandActions = useMemo(
    () =>
      [
        { label: "Open dashboard", description: "Command center overview", href: "/dashboard" },
        { label: "Open finance", description: "Spending and deposits", href: "/dashboard/finance" },
        { label: "Open habits", description: "Daily completion and streaks", href: "/dashboard/habits" },
        { label: "Open tasks", description: "Pending and due items", href: "/dashboard/tasks" },
        { label: "Open journal", description: "Timeline and quick writing", href: "/dashboard/journal" },
        { label: "Open gym routine", description: "Weekly recurring split", href: "/dashboard/gym" },
        { label: "Open analytics", description: "Trend and performance charts", href: "/dashboard/analytics" },
        { label: "Open categories", description: "Category budgets and colors", href: "/dashboard/categories" },
        { label: "Open webhook docs", description: "Expense ingestion setup", href: "/dashboard/webhook" }
      ].filter((action) => {
        const q = searchQuery.trim().toLowerCase();
        return !q
          ? true
          : `${action.label} ${action.description}`.toLowerCase().includes(q);
      }),
    [searchQuery]
  );

  return (
    <div className="nx-app">
      <Sidebar
        newExpenseCount={newExpenseCount}
        pendingTasks={pendingCount}
        userEmail={userEmail}
        isOpen={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />

      <main className="nx-main" id="nx-main-content">
        <Topbar
          title={title}
          pendingNotifications={pendingCount + Math.min(newExpenseCount, 9)}
          onMenuClick={() => setSidebarOpen((prev) => !prev)}
          onSearchClick={() => setSearchOpen(true)}
          onNotificationsClick={() => setNotificationsOpen(true)}
          onSettingsClick={() => setSettingsOpen(true)}
        />
        <div className="nx-content">
          <motion.div
            key={pathname}
            className="nx-content-page"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, ease: [0.2, 0.9, 0.2, 1] }}
          >
            {children}
          </motion.div>
        </div>
        <nav className="nx-mobile-nav" aria-label="Primary">
          {mobileNav.map((item) => {
            const active =
              item.href === "/dashboard"
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href} className={`nx-mobile-nav-item ${active ? "active" : ""}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </main>

      <FloatingCreateHub />

      <Modal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        title="Command search"
        description="Jump to any workspace or flow instantly."
        variant="dialog"
      >
        <div className="nx-form-grid">
          <input
            className="nx-input"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search pages and actions"
            aria-label="Search pages and actions"
          />
          <div className="nx-search-results">
            {commandActions.map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="nx-search-item"
                onClick={() => setSearchOpen(false)}
              >
                <strong>{action.label}</strong>
                <span>{action.description}</span>
              </Link>
            ))}
            <button
              type="button"
              className="nx-search-item"
              onClick={() => {
                setSearchOpen(false);
                openCreateHub();
              }}
            >
              <strong>Open creation hub</strong>
              <span>Capture an expense, task, habit, journal entry, or workout.</span>
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        title="Live reminders"
        description="Signals from your current LifeOS systems."
        variant="dialog"
      >
        <div className="nx-utility-list">
          <article className="nx-utility-item">
            <p className="nx-utility-label">Pending tasks</p>
            <strong className="nx-utility-value">{pendingCount}</strong>
            <p className="nx-utility-copy">
              {pendingCount > 0
                ? "Prioritize high-impact tasks to keep momentum."
                : "No pending tasks right now."}
            </p>
            <Link href="/dashboard/tasks" className="nx-btn" onClick={() => setNotificationsOpen(false)}>
              Open tasks
            </Link>
          </article>

          <article className="nx-utility-item">
            <p className="nx-utility-label">Recorded expenses</p>
            <strong className="nx-utility-value">{newExpenseCount}</strong>
            <p className="nx-utility-copy">
              Keep category assignment clean so analytics stay accurate.
            </p>
            <Link href="/dashboard/finance" className="nx-btn" onClick={() => setNotificationsOpen(false)}>
              Open finance
            </Link>
          </article>

          <article className="nx-utility-item">
            <p className="nx-utility-label">Webhook status</p>
            <strong className="nx-utility-value">Ready</strong>
            <p className="nx-utility-copy">
              Endpoint and token docs are available for automations.
            </p>
            <Link href="/dashboard/webhook" className="nx-btn" onClick={() => setNotificationsOpen(false)}>
              Open docs
            </Link>
          </article>
        </div>
      </Modal>

      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Workspace settings"
        description="Theme, system shortcuts, and primary controls."
        variant="sheet"
      >
        <div className="nx-form-grid">
          <div className="nx-panel">
            <p className="nx-list-label">Theme</p>
            <ThemeToggle />
          </div>
          <div className="nx-utility-links">
            <Link href="/dashboard/categories" className="nx-btn" onClick={() => setSettingsOpen(false)}>
              Categories
            </Link>
            <Link href="/dashboard/budget" className="nx-btn" onClick={() => setSettingsOpen(false)}>
              Budget
            </Link>
            <Link href="/dashboard/analytics" className="nx-btn" onClick={() => setSettingsOpen(false)}>
              Analytics
            </Link>
            <button
              className="nx-btn primary"
              type="button"
              onClick={() => {
                setSettingsOpen(false);
                openCreateHub();
              }}
            >
              New capture
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
