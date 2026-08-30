"use server";

import { revalidatePath } from "next/cache";
import { NotificationService } from "@/lib/services/notification-service";
import { getCurrentUserAndOrg } from "@/lib/auth/session";

export async function markAllNotificationsReadAction() {
  const ctx = await getCurrentUserAndOrg();
  if (!ctx?.organization) return;
  await NotificationService.markAllRead(ctx.organization.id);
  revalidatePath("/", "layout");
}

export async function markNotificationReadAction(id: string) {
  await NotificationService.markRead(id);
  revalidatePath("/", "layout");
}
