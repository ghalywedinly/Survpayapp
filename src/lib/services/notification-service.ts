import { db } from "@/lib/db";

export const NotificationService = {
  async notify(
    organizationId: string,
    input: { type: string; title: string; titleAr?: string; body: string; bodyAr?: string; userId?: string }
  ) {
    return db.notification.create({
      data: {
        organizationId,
        userId: input.userId,
        type: input.type,
        title: input.title,
        titleAr: input.titleAr,
        body: input.body,
        bodyAr: input.bodyAr,
      },
    });
  },

  async listForOrg(organizationId: string, limit = 20) {
    return db.notification.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  },

  async unreadCount(organizationId: string) {
    return db.notification.count({ where: { organizationId, read: false } });
  },

  async markRead(id: string) {
    return db.notification.update({ where: { id }, data: { read: true } });
  },

  async markAllRead(organizationId: string) {
    return db.notification.updateMany({ where: { organizationId, read: false }, data: { read: true } });
  },
};
