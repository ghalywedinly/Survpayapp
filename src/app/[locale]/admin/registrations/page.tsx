import { AdminService } from "@/lib/services/admin-service";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatDate } from "@/lib/format";
import type { Locale } from "@/lib/i18n/config";
import { PageHeader } from "@/components/dashboard/page-header";
import { Card } from "@/components/ui/card";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { UserPlusIcon } from "@/components/icons";

export default async function AdminRegistrationsPage({ params }: { params: { locale: Locale } }) {
  const dict = getDictionary(params.locale);
  const t = dict.admin;
  const users = await AdminService.listUsers();

  return (
    <div>
      <PageHeader title={t.registrationsTitle} subtitle={t.registrationsSubtitle} />
      <Card className="overflow-hidden">
        {users.length === 0 ? (
          <EmptyState icon={<UserPlusIcon className="h-6 w-6" />} title={t.registrationsTitle} body={t.registrationsEmpty} />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <TR>
                  <TH>{t.colName}</TH>
                  <TH>{t.colEmail}</TH>
                  <TH>{t.colOrganization}</TH>
                  <TH>{t.colRole}</TH>
                  <TH>{t.colVerified}</TH>
                  <TH>{t.colRegistered}</TH>
                </TR>
              </THead>
              <TBody>
                {users.map((u) => (
                  <TR key={u.id}>
                    <TD className="font-medium text-ink-900">{u.name}</TD>
                    <TD className="text-ink-500">{u.email}</TD>
                    <TD>{u.organization?.name ?? <span className="text-ink-400">{t.noOrganization}</span>}</TD>
                    <TD className="capitalize">{u.role}</TD>
                    <TD>
                      <Badge tone={u.emailVerified ? "success" : "neutral"}>{u.emailVerified ? t.verifiedYes : t.verifiedNo}</Badge>
                    </TD>
                    <TD className="text-ink-500">{formatDate(u.createdAt, params.locale)}</TD>
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
