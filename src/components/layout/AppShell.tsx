"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import FloatingCreateHub from "@/components/layout/FloatingCreateHub";
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

  return (
    <div className="nx-app">
      <Sidebar
        newExpenseCount={newExpenseCount}
        pendingTasks={pendingCount}
        userEmail={userEmail}
        isOpen={sidebarOpen}
        onNavigate={() => setSidebarOpen(false)}
      />

      <main className="nx-main">
        <Topbar title={title} onMenuClick={() => setSidebarOpen((prev) => !prev)} />
        <div className="nx-content">
          <div className="nx-content-page animate-fade-in-up">{children}</div>
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
    </div>
  );
}
