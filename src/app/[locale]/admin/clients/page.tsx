import { AdminService } from "@/lib/services/admin-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { BuildingIcon } from "@/components/icons";
import { getPlanLabel } from "@/lib/pricing";

const planTone: Record<string, "neutral" | "brand" | "success"> = {
  market_research: "neutral",
  customer_experience: "brand",
  business: "success",
};

export default async function AdminClientsPage({ params }: { params: { locale: Locale } }) {
  const dict = getDictionary(params.locale);
  const t = dict.admin;
  const orgs = await AdminService.listOrganizations();

  return (
    <div>
      <PageHeader title={t.clientsTitle} subtitle={t.clientsSubtitle} />
      <Card className="overflow-hidden">
        {orgs.length === 0 ? (
          <EmptyState icon={<BuildingIcon className="h-6 w-6" />} title={t.clientsTitle} body={t.clientsEmpty} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>{t.colOrganization}</TH>
                  <TH>{t.colPlan}</TH>
                  <TH>{t.colCountry}</TH>
                  <TH>{t.colMembers}</TH>
                  <TH>{t.colSurveys}</TH>
                  <TH>{t.colRewardSpend}</TH>
                  <TH>{t.colLastActivity}</TH>
                  <TH>{t.colRegistered}</TH>
                </TR>
              </THead>
              <TBody>
                {orgs.map((org) => (
                  <TR key={org.id}>
                    <TD>
                      <p className="font-medium text-ink-900">{org.name}</p>
                      {org.industry && <p className="text-xs text-ink-400">{org.industry}</p>}
                    </TD>
                    <TD>
                      <Badge tone={planTone[org.plan] ?? "neutral"}>{getPlanLabel(org.plan)}</Badge>
                    </TD>
                    <TD>{org.country}</TD>
                    <TD>{org.memberCount}</TD>
                    <TD>{org.surveyCount}</TD>
                    <TD>{formatCurrency(org.totalRewardSpend, params.locale)}</TD>
                    <TD>{formatDate(org.lastActivityAt, params.locale)}</TD>
                    <TD className="text-ink-500">{formatDate(org.createdAt, params.locale)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
