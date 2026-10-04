import { requireOrgContext } from "@/lib/auth/guards";
import { BranchService } from "@/lib/services/branch-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { BranchesClient } from "@/components/dashboard/branches-client";

export default async function BranchesPage({ params }: { params: { locale: Locale } }) {
  const ctx = await requireOrgContext(params.locale);
  const dict = getDictionary(params.locale);
  const branches = await BranchService.listWithStats(ctx.organization.id, { includeInactive: true });

  return (
    <div>
      <PageHeader title={dict.branches.title} subtitle={dict.branches.subtitle} />
      <BranchesClient
        branches={branches.map((b) => ({
          id: b.id,
          name: b.name,
          nameAr: b.nameAr,
          code: b.code,
          city: b.city,
          address: b.address,
          active: b.active,
          score: b.score,
          totalResponses: b.totalResponses,
        }))}
      />
    </div>
  );
}
