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
  WalletIcon,
  FileTextIcon,
  CreditCardIcon,
  SettingsIcon,
} from "@/components/icons";
import { Avatar } from "@/components/ui/avatar";
import { ChevronDownIcon } from "@/components/icons";

export function DashboardSidebar({
  orgName,
  plan,
  onClose,
}: {
  orgName: string;
  plan: string;
  onClose?: () => void;
}) {
  const { t, locale } = useI18n();
  const pathname = usePathname();

  const nav = [
    { href: `/${locale}/dashboard`, label: t("nav.dashboard"), icon: HomeIcon },
    { href: `/${locale}/surveys`, label: t("nav.surveys"), icon: ListIcon },
    { href: `/${locale}/responses`, label: t("nav.responses"), icon: InboxIcon },
    { href: `/${locale}/analytics`, label: t("nav.analytics"), icon: BarChartIcon },
    { href: `/${locale}/rewards`, label: t("nav.rewards"), icon: WalletIcon },
    { href: `/${locale}/reports`, label: t("nav.reports"), icon: FileTextIcon },
    { href: `/${locale}/billing`, label: t("nav.billing"), icon: CreditCardIcon },
    { href: `/${locale}/settings`, label: t("nav.settings"), icon: SettingsIcon },
  ];

  return (
    <div className="flex h-full w-64 shrink-0 flex-col border-e border-ink-100 bg-white">
      <div className="flex h-16 items-center px-5">
        <Link href={`/${locale}/dashboard`} onClick={onClose}>
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-2">
        {nav.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-brand-50 text-brand-700" : "text-ink-600 hover:bg-ink-50 hover:text-ink-900"
              )}
            >
              <item.icon className={cn("h-[18px] w-[18px]", active ? "text-brand-600" : "text-ink-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {plan === "free" && (
        <div className="mx-3 mb-3 rounded-xl border border-brand-100 bg-brand-50/60 p-4">
          <p className="text-sm font-semibold text-ink-900">{t("common.upgradeToPro")}</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-500">{t("common.upgradeDesc")}</p>
          <Link
            href={`/${locale}/pricing`}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            {t("common.upgradeNow")}
          </Link>
        </div>
      )}

      <div className="flex items-center gap-2.5 border-t border-ink-100 px-4 py-3.5">
        <Avatar name={orgName} size={30} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink-900">{orgName}</p>
          <p className="text-xs capitalize text-ink-400">{plan}</p>
        </div>
        <ChevronDownIcon className="h-4 w-4 text-ink-300" />
      </div>
    </div>
  );
}
