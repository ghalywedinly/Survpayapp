"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { BellIcon } from "@/components/icons";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n/provider";
import { formatDate } from "@/lib/format";
import { markAllNotificationsReadAction } from "@/lib/actions/notifications";
import { cn } from "@/lib/utils";

export interface NotificationItem {
  id: string;
  title: string;
  titleAr: string | null;
  body: string;
  bodyAr: string | null;
  read: boolean;
  createdAt: string | Date;
}

export function NotificationsBell({ notifications, unreadCount }: { notifications: NotificationItem[]; unreadCount: number }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink-500 hover:bg-ink-100 hover:text-ink-900">
          <BellIcon className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute end-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0">
        <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3">
          <p className="text-sm font-semibold text-ink-900">{t("notifications.title")}</p>
          {unreadCount > 0 && (
            <button
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await markAllNotificationsReadAction();
                  router.refresh();
                })
              }
              className="text-xs font-medium text-brand-600 hover:text-brand-700"
            >
              {t("notifications.markAllRead")}
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 && <p className="px-4 py-8 text-center text-sm text-ink-400">{t("notifications.empty")}</p>}
          {notifications.map((n) => (
            <div key={n.id} className={cn("border-b border-ink-50 px-4 py-3", !n.read && "bg-brand-50/30")}>
              <div className="flex items-start gap-2">
                {!n.read && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-600" />}
                <div className={cn(!n.read ? "" : "ps-3.5")}>
                  <p className="text-sm font-medium text-ink-900">{locale === "ar" ? n.titleAr ?? n.title : n.title}</p>
                  <p className="mt-0.5 text-xs text-ink-500">{locale === "ar" ? n.bodyAr ?? n.body : n.body}</p>
                  <p className="mt-1 text-[11px] text-ink-300">{formatDate(n.createdAt, locale, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
