import { requireOrgContext } from "@/lib/auth/guards";
import { CouponService } from "@/lib/services/coupon-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { CouponCheckerClient } from "@/components/dashboard/coupon-checker-client";

export default async function CouponsPage({ params }: { params: { locale: Locale } }) {
  const ctx = await requireOrgContext(params.locale);
  const dict = getDictionary(params.locale);
  const recent = await CouponService.listRecent(ctx.organization.id);

  return (
    <div>
      <PageHeader title={dict.coupons.title} subtitle={dict.coupons.subtitle} />
      <CouponCheckerClient
        initialRecent={recent.map((r) => ({
          code: r.code,
          amount: r.amount,
          issuedAt: r.issuedAt.toISOString(),
          redeemedAt: r.redeemedAt ? r.redeemedAt.toISOString() : null,
          survey: r.survey,
        }))}
      />
    </div>
  );
}
