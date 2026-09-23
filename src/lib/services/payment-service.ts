import { db } from "@/lib/db";

// Researcher subscription billing only. SurvPay never charges an
// organization to fund respondent rewards — rewards are always a
// percentage-discount coupon, never cash or a fixed monetary amount, so
// there is nothing to pre-fund, distribute, or refund on that side.

export const PaymentService = {
  async listInvoices(organizationId: string) {
    return db.invoice.findMany({ where: { organizationId }, orderBy: { issuedAt: "desc" } });
  },

  async listTransactions(organizationId: string, limit = 20) {
    return db.paymentTransaction.findMany({ where: { organizationId }, orderBy: { createdAt: "desc" }, take: limit });
  },
};
