"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { formatDate } from "@/lib/format";
import {
  updateProfileAction,
  updateOrganizationAction,
  inviteMemberAction,
  removeMemberAction,
  updateNotificationPrefsAction,
  changePasswordAction,
  revokeSessionAction,
} from "@/lib/actions/settings";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button, buttonClasses } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { PlusIcon, TrashIcon } from "@/components/icons";
import type { Locale } from "@/lib/i18n/config";

interface Member {
  id: string;
  role: string;
  status: string;
  userName: string | null;
  invitedEmail: string | null;
}
interface Session {
  id: string;
  current: boolean;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
}

export function SettingsClient({
  profile,
  organization,
  members,
  notificationPrefs,
  sessions,
}: {
  profile: { name: string; email: string; phone: string; locale: Locale };
  organization: { name: string; industry: string; logoUrl: string | null };
  members: Member[];
  notificationPrefs: Record<string, boolean>;
  sessions: Session[];
}) {
  const { t, locale } = useI18n();

  return (
    <Tabs defaultValue="profile">
      <TabsList>
        <TabsTrigger value="profile">{t("settings.tabProfile")}</TabsTrigger>
        <TabsTrigger value="organization">{t("settings.tabOrganization")}</TabsTrigger>
        <TabsTrigger value="team">{t("settings.tabTeam")}</TabsTrigger>
        <TabsTrigger value="notifications">{t("settings.tabNotifications")}</TabsTrigger>
        <TabsTrigger value="security">{t("settings.tabSecurity")}</TabsTrigger>
        <TabsTrigger value="billing">{t("settings.tabBilling")}</TabsTrigger>
      </TabsList>

      <TabsContent value="profile" className="mt-5">
        <ProfileTab profile={profile} />
      </TabsContent>
      <TabsContent value="organization" className="mt-5">
        <OrganizationTab organization={organization} />
      </TabsContent>
      <TabsContent value="team" className="mt-5">
        <TeamTab members={members} />
      </TabsContent>
      <TabsContent value="notifications" className="mt-5">
        <NotificationsTab prefs={notificationPrefs} />
      </TabsContent>
      <TabsContent value="security" className="mt-5">
        <SecurityTab sessions={sessions} />
      </TabsContent>
      <TabsContent value="billing" className="mt-5">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-ink-500">{t("billing.subtitle")}</p>
            <Link href={`/${locale}/billing`} className={buttonClasses({ className: "mt-4" })}>
              {t("nav.billing")}
            </Link>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function ProfileTab({ profile }: { profile: { name: string; email: string; phone: string; locale: Locale } }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(profile);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.tabProfile")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>{t("settings.profileName")}</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label>{t("settings.profileEmail")}</Label>
            <Input value={form.email} disabled />
          </div>
          <div>
            <Label>{t("settings.profilePhone")}</Label>
            <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+966 5x xxx xxxx" />
          </div>
          <div>
            <Label>{t("settings.profileLanguage")}</Label>
            <Select value={form.locale} onChange={(e) => setForm((f) => ({ ...f, locale: e.target.value as Locale }))}>
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </Select>
          </div>
        </div>
        <Button
          loading={pending}
          onClick={() =>
            startTransition(async () => {
              await updateProfileAction(locale, { name: form.name, phone: form.phone, preferredLocale: form.locale });
              push({ title: t("settings.changesSaved"), tone: "success" });
              if (form.locale !== locale) {
                document.cookie = `survpay_locale=${form.locale}; path=/; max-age=31536000`;
                router.push(`/${form.locale}/settings`);
              } else {
                router.refresh();
              }
            })
          }
        >
          {t("settings.saveChanges")}
        </Button>
      </CardContent>
    </Card>
  );
}

function OrganizationTab({ organization }: { organization: { name: string; industry: string; logoUrl: string | null } }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [form, setForm] = useState(organization);
  const fileRef = useRef<HTMLInputElement>(null);

  function onLogoPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, logoUrl: String(reader.result) }));
    reader.readAsDataURL(file);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.tabOrganization")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <Avatar name={form.name} src={form.logoUrl} size={56} />
          <div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={onLogoPick} />
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              {t("settings.uploadLogo")}
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <Label>{t("settings.orgName")}</Label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <Label>{t("settings.orgIndustry")}</Label>
            <Input value={form.industry} onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))} placeholder="Market research" />
          </div>
        </div>
        <Button
          loading={pending}
          onClick={() =>
            startTransition(async () => {
              await updateOrganizationAction(locale, form);
              push({ title: t("settings.changesSaved"), tone: "success" });
              router.refresh();
            })
          }
        >
          {t("settings.saveChanges")}
        </Button>
      </CardContent>
    </Card>
  );
}

function TeamTab({ members }: { members: Member[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("editor");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.teamMembers")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-xl border border-ink-100 px-4 py-3">
              <div className="flex items-center gap-3">
                <Avatar name={m.userName ?? m.invitedEmail ?? "?"} size={32} />
                <div>
                  <p className="text-sm font-medium text-ink-900">{m.userName ?? m.invitedEmail}</p>
                  <p className="text-xs text-ink-400">{m.status === "invited" ? "Invited" : t(`settings.role${cap(m.role)}`)}</p>
                </div>
              </div>
              {m.status === "invited" && (
                <button
                  onClick={() =>
                    startTransition(async () => {
                      await removeMemberAction(locale, m.id);
                      router.refresh();
                    })
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-400 hover:bg-danger-tint hover:text-red-500"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-end gap-2 border-t border-ink-100 pt-5">
          <div className="flex-1">
            <Label>{t("settings.inviteEmail")}</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="colleague@company.com" />
          </div>
          <div>
            <Label>{t("nav.settings")}</Label>
            <Select value={role} onChange={(e) => setRole(e.target.value)} className="w-40">
              <option value="admin">{t("settings.roleAdmin")}</option>
              <option value="editor">{t("settings.roleEditor")}</option>
              <option value="viewer">{t("settings.roleViewer")}</option>
            </Select>
          </div>
          <Button
            loading={pending}
            disabled={!email}
            className="gap-1.5"
            onClick={() =>
              startTransition(async () => {
                await inviteMemberAction(locale, email, role);
                setEmail("");
                push({ title: t("settings.inviteMember"), description: "Demo mode — no real invite email is sent." });
                router.refresh();
              })
            }
          >
            <PlusIcon className="h-4 w-4" />
            {t("settings.inviteMember")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

const notifKeys = ["notifSurveyMilestones", "notifBudgetLow", "notifSurveyCompleted", "notifRewardIssue", "notifWeeklyReports"] as const;

function NotificationsTab({ prefs }: { prefs: Record<string, boolean> }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [state, setState] = useState<Record<string, boolean>>(prefs);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("settings.tabNotifications")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {notifKeys.map((key) => (
            <label key={key} className="flex items-center justify-between border-b border-ink-50 py-3 text-sm text-ink-700 last:border-0">
              {t(`settings.${key}`)}
              <Switch checked={state[key] ?? true} onCheckedChange={(v) => setState((s) => ({ ...s, [key]: v }))} />
            </label>
          ))}
        </div>
        <Button
          className="mt-5"
          loading={pending}
          onClick={() =>
            startTransition(async () => {
              await updateNotificationPrefsAction(locale, state);
              push({ title: t("settings.changesSaved"), tone: "success" });
              router.refresh();
            })
          }
        >
          {t("settings.saveChanges")}
        </Button>
      </CardContent>
    </Card>
  );
}

function SecurityTab({ sessions }: { sessions: Session[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.changePassword")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && <p className="rounded-lg bg-danger-tint px-3 py-2 text-sm text-danger-content">{t(`auth.${error}`)}</p>}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label>{t("settings.currentPassword")}</Label>
              <Input type="password" value={current} onChange={(e) => setCurrent(e.target.value)} />
            </div>
            <div>
              <Label>{t("settings.newPassword")}</Label>
              <Input type="password" value={next} onChange={(e) => setNext(e.target.value)} />
            </div>
            <div>
              <Label>{t("auth.confirmPassword")}</Label>
              <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
          </div>
          <Button
            loading={pending}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                if (next !== confirm) {
                  setError("errorPasswordMismatch");
                  return;
                }
                const result = await changePasswordAction(locale, current, next);
                if (result?.error) setError(result.error);
                else {
                  push({ title: t("settings.changesSaved"), tone: "success" });
                  setCurrent("");
                  setNext("");
                  setConfirm("");
                }
              })
            }
          >
            {t("settings.changePassword")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.activeSessions")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl border border-ink-100 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-ink-800">{s.userAgent ?? "Unknown device"}</p>
                <p className="text-xs text-ink-400">
                  {formatDate(s.createdAt, locale)} {s.current && <Badge tone="success" className="ms-2">{t("common.today")}</Badge>}
                </p>
              </div>
              {!s.current && (
                <button
                  onClick={() =>
                    startTransition(async () => {
                      await revokeSessionAction(locale, s.id);
                      router.refresh();
                    })
                  }
                  className="text-xs font-medium text-red-500 hover:text-danger-content"
                >
                  {t("common.remove")}
                </button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("settings.twoFactor")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <p className="max-w-md text-sm text-ink-500">{t("settings.twoFactorDesc")}</p>
            <div className="flex items-center gap-2">
              <Badge tone="neutral">{t("common.comingSoon")}</Badge>
              <Switch checked={false} onCheckedChange={() => {}} disabled />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
