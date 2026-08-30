"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n/provider";
import { logoutAction } from "@/lib/auth/actions";
import { SettingsIcon, LogOutIcon } from "@/components/icons";

export function UserMenu({ name, email }: { name: string; email: string }) {
  const { t, locale } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button className="flex items-center gap-2 rounded-full">
          <Avatar name={name} size={32} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64">
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
          <button type="submit" className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-start text-sm text-red-600 hover:bg-red-50">
            <LogOutIcon className="h-4 w-4" />
            {t("common.logout")}
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
