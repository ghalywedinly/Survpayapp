"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/auth/actions";
import { LogoMark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Badge } from "@/components/ui/badge";
import { HomeIcon, BuildingIcon, UsersIcon, UserPlusIcon, LogOutIcon } from "@/components/icons";

export function AdminShell({ adminName, children }: { adminName: string; children: React.ReactNode }) {
  const { t, locale } = useI18n();
  const pathname = usePathname();

  const nav = [
    { href: `/${locale}/admin`, label: t("admin.navOverview"), icon: HomeIcon, exact: true },
    { href: `/${locale}/admin/clients`, label: t("admin.navClients"), icon: BuildingIcon },
    { href: `/${locale}/admin/participants`, label: t("admin.navParticipants"), icon: UsersIcon },
    { href: `/${locale}/admin/registrations`, label: t("admin.navRegistrations"), icon: UserPlusIcon },
  ];

  return (
    <div className="flex min-h-screen bg-ink-50/40">
      <div className="hidden w-64 shrink-0 flex-col border-e border-ink-100 bg-surface lg:flex">
        <div className="flex h-16 items-center gap-2 px-5">
          <LogoMark size={22} />
          <span className="text-[1.05rem] font-semibold tracking-tight text-ink-900">Survpay</span>
          <Badge tone="brand" className="ms-1">
            {t("admin.badge")}
          </Badge>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-2">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.href : pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-brand-50 text-brand-content" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
                )}
              >
                <item.icon className={cn("h-[18px] w-[18px]", active ? "text-brand-content" : "text-ink-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-ink-100 px-4 py-3.5">
          <p className="truncate text-sm font-medium text-ink-900">{adminName}</p>
          <p className="text-xs text-ink-400">{t("admin.badge")}</p>
          <form action={logoutAction} className="mt-2">
            <input type="hidden" name="locale" value={locale} />
            <button type="submit" className="flex items-center gap-1.5 text-xs font-medium text-danger-content hover:opacity-80">
              <LogOutIcon className="h-3.5 w-3.5" />
              {t("common.logout")}
            </button>
          </form>
        </div>
      </div>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-100 bg-surface/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2 lg:hidden">
            <LogoMark size={20} />
            <Badge tone="brand">{t("admin.badge")}</Badge>
          </div>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
