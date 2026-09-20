"use client";

import { useEffect, useState } from "react";
import { DashboardSidebar } from "./sidebar";
import type { NotificationItem } from "./notifications-bell";
import { MenuIcon, XIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function DashboardShell({
  orgName,
  plan,
  userName,
  userEmail,
  notifications,
  unreadCount,
  children,
}: {
  orgName: string;
  plan: string;
  userName: string;
  userEmail: string;
  notifications: NotificationItem[];
  unreadCount: number;
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  // Icons-only is the default: only override it once we've checked for a
  // stored preference, so SSR and first paint stay consistent (collapsed).
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("survpay:sidebar-collapsed");
    if (stored !== null) setCollapsed(stored === "true");
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((v) => {
      const next = !v;
      localStorage.setItem("survpay:sidebar-collapsed", String(next));
      return next;
    });
  };

  const sidebarProps = { orgName, plan, userName, userEmail, notifications, unreadCount };

  return (
    <div className="min-h-screen bg-ink-50/40">
      {/* Floating, fixed sidebar — desktop only. Main content gets a
          matching inline-start offset (logical, so it flips for RTL)
          instead of a flex sibling, since the sidebar no longer
          participates in document flow. */}
      <div className="fixed inset-y-4 start-4 z-40 hidden lg:flex">
        <DashboardSidebar {...sidebarProps} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} floating />
      </div>

      {/* Mobile: no persistent sidebar, just a small floating trigger. */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed start-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-ink-100 bg-surface text-ink-600 shadow-card lg:hidden"
        aria-label="Open menu"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#12151e]/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 start-0 flex animate-slide-up">
            <DashboardSidebar {...sidebarProps} onClose={() => setMobileOpen(false)} />
            <button
              onClick={() => setMobileOpen(false)}
              className="m-3 flex h-9 w-9 shrink-0 items-center justify-center self-start rounded-lg bg-surface text-ink-600 shadow-card"
              aria-label="Close menu"
            >
              <XIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div className={cn("transition-[margin] duration-200", collapsed ? "lg:ms-[108px]" : "lg:ms-[288px]")}>
        <main className="px-4 pb-6 pt-20 sm:px-6 lg:px-8 lg:pb-8 lg:pt-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
