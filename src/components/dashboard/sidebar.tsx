"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  ListIcon,
  InboxIcon,
  BarChartIcon,
  BuildingIcon,
  TicketIcon,
  FileTextIcon,
  CreditCardIcon,
  SettingsIcon,
  PanelLeftIcon,
} from "@/components/icons";
import { LogoMark } from "@/components/brand/logo";
import { NotificationsBell, type NotificationItem } from "@/components/dashboard/notifications-bell";
import { UserMenu } from "@/components/dashboard/user-menu";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { entryPlanId } from "@/lib/pricing";

export function DashboardSidebar({
  orgName,
  plan,
  userName,
  userEmail,
  notifications,
  unreadCount,
  onClose,
  collapsed = false,
  onToggleCollapsed,
  floating = false,
}: {
  orgName: string;
  plan: string;
  userName: string;
  userEmail: string;
  notifications: NotificationItem[];
  unreadCount: number;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  floating?: boolean;
}) {
  const { t, locale } = useI18n();
  const pathname = usePathname();

  // Most-used first: daily monitoring items at the top, account-admin
  // pages (rarely touched day-to-day) at the bottom of the nav list.
  const primaryNav = [
    { href: `/${locale}/dashboard`, label: t("nav.dashboard"), icon: HomeIcon },
    { href: `/${locale}/surveys`, label: t("nav.surveys"), icon: ListIcon },
    { href: `/${locale}/responses`, label: t("nav.responses"), icon: InboxIcon },
    { href: `/${locale}/analytics`, label: t("nav.analytics"), icon: BarChartIcon },
    { href: `/${locale}/branches`, label: t("nav.branches"), icon: BuildingIcon },
    { href: `/${locale}/coupons`, label: t("nav.coupons"), icon: TicketIcon },
    { href: `/${locale}/reports`, label: t("nav.reports"), icon: FileTextIcon },
  ];
  const secondaryNav = [
    { href: `/${locale}/billing`, label: t("nav.billing"), icon: CreditCardIcon },
    { href: `/${locale}/settings`, label: t("nav.settings"), icon: SettingsIcon },
  ];

  function NavLink(item: (typeof primaryNav)[number]) {
    const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClose}
        title={collapsed ? item.label : undefined}
        className={cn(
          "flex items-center gap-3 rounded-lg py-2 text-sm font-medium transition-colors",
          collapsed ? "justify-center px-0" : "px-3",
          active ? "bg-brand-50 text-brand-content" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
        )}
      >
        <item.icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-brand-content" : "text-ink-400")} />
        {!collapsed && item.label}
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "flex h-full shrink-0 flex-col bg-surface transition-[width] duration-200",
        floating ? "rounded-2xl border border-ink-100 shadow-card" : "border-e border-ink-100",
        collapsed ? "w-[76px]" : "w-64"
      )}
    >
      <div className={cn("flex items-center pb-3 pt-6", collapsed ? "flex-col justify-center gap-3 px-2" : "justify-between px-5")}>
        <Link href={`/${locale}/dashboard`} onClick={onClose}>
          {collapsed ? <LogoMark size={22} /> : <Logo />}
        </Link>
        <div className={cn("flex items-center gap-1", collapsed && "flex-col")}>
          <NotificationsBell notifications={notifications} unreadCount={unreadCount} />
          {onToggleCollapsed && (
            <button
              onClick={onToggleCollapsed}
              title={collapsed ? t("common.expandSidebar") : t("common.collapseSidebar")}
              aria-label={collapsed ? t("common.expandSidebar") : t("common.collapseSidebar")}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-400 hover:bg-ink-50 hover:text-ink-700"
            >
              <PanelLeftIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <nav className={cn("flex-1 space-y-0.5 overflow-y-auto py-2", collapsed ? "px-2.5" : "px-3")}>
        {primaryNav.map(NavLink)}
        <div className={cn("my-2 border-t border-ink-100", collapsed ? "mx-1.5" : "mx-1")} />
        {secondaryNav.map(NavLink)}
      </nav>

      {!collapsed && plan === entryPlanId && (
        <div className="mx-3 mb-3 rounded-xl border border-brand-100 bg-brand-50/60 p-4">
          <p className="text-sm font-semibold text-ink-900">{t("common.upgradeToPro")}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-ink-500">{t("common.upgradeDesc")}</p>
          <Link
            href={`/${locale}/pricing`}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-content hover:text-brand-content"
          >
            {t("common.upgradeNow")}
          </Link>
        </div>
      )}

      <div
        className={cn(
          "flex items-center justify-center border-t border-ink-100 py-2.5",
          collapsed ? "flex-col gap-1 px-2" : "gap-1 px-2"
        )}
      >
        <LanguageSwitcher compact />
        <ThemeToggle className="rounded-lg border-0 bg-transparent hover:bg-ink-100" />
      </div>

      <div className={cn("border-t border-ink-100 p-2", collapsed && "px-2")}>
        <UserMenu name={userName} email={userEmail} orgName={orgName} variant="sidebar" collapsed={collapsed} />
      </div>
    </div>
  );
}
