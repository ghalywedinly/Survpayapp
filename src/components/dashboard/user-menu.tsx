"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n/provider";
import { logoutAction } from "@/lib/auth/actions";
import { SettingsIcon, LogOutIcon, ChevronDownIcon } from "@/components/icons";
import { cn } from "@/lib/utils";

export function UserMenu({
  name,
  email,
  orgName,
  variant = "compact",
  collapsed = false,
}: {
  name: string;
  email: string;
  orgName?: string;
  variant?: "compact" | "sidebar";
  collapsed?: boolean;
}) {
  const { t, locale } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        {variant === "sidebar" ? (
          <button
            className={cn(
              "flex w-full items-center rounded-xl transition-colors hover:bg-ink-50",
              collapsed ? "justify-center px-2 py-2.5" : "gap-2.5 px-2.5 py-2.5"
            )}
            title={collapsed ? name : undefined}
          >
            <Avatar name={name} size={30} className="shrink-0" />
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1 text-start">
                  <p className="truncate text-sm font-medium text-ink-900">{name}</p>
                  {orgName && <p className="truncate text-xs text-ink-400">{orgName}</p>}
                </div>
                <ChevronDownIcon className="h-4 w-4 shrink-0 text-ink-300" />
              </>
            )}
          </button>
        ) : (
          <button className="flex items-center gap-2 rounded-full">
            <Avatar name={name} size={32} />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" side={variant === "sidebar" ? "top" : "bottom"} align={variant === "sidebar" ? "start" : "end"}>
        <div className="px-2.5 py-2">
          <p className="truncate text-sm font-medium text-ink-900">{name}</p>
          <p className="truncate text-xs text-ink-400">{email}</p>
        </div>
        <DropdownMenuSeparator />
        <Link
          href={`/${locale}/settings`}
          className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-ink-700 hover:bg-ink-50"
        >
          <SettingsIcon className="h-4 w-4" />
          {t("nav.settings")}
        </Link>
        <DropdownMenuSeparator />
        <form action={logoutAction}>
          <input type="hidden" name="locale" value={locale} />
          <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start text-sm text-danger-content hover:bg-danger-tint">
            <LogOutIcon className="h-4 w-4" />
            {t("common.logout")}
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
