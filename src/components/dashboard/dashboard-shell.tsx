"use client";

import { useState } from "react";
import { DashboardSidebar } from "./sidebar";
import { NotificationsBell, type NotificationItem } from "./notifications-bell";
import { UserMenu } from "./user-menu";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { MenuIcon, XIcon } from "@/components/icons";

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

  return (
    <div className="flex min-h-screen bg-ink-50/40">
      <div className="hidden lg:block">
        <DashboardSidebar orgName={orgName} plan={plan} />
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#12151e]/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 start-0 animate-slide-up">
            <DashboardSidebar orgName={orgName} plan={plan} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-100 bg-surface/90 px-4 backdrop-blur sm:px-6">
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-ink-600 lg:hidden"
          >
            {mobileOpen ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
            <NotificationsBell notifications={notifications} unreadCount={unreadCount} />
            <UserMenu name={userName} email={userEmail} />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
