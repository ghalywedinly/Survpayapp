"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { createBranchAction, updateBranchAction, setBranchActiveAction } from "@/lib/actions/branches";
import { scoreTone, scoreToneClasses, scoreToneLabelKey } from "@/lib/satisfaction-display";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Dialog, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { BuildingIcon, PlusIcon, EditIcon } from "@/components/icons";

export interface BranchRow {
  id: string;
  name: string;
  nameAr: string | null;
  code: string;
  city: string | null;
  address: string | null;
  active: boolean;
  score: number | null;
  totalResponses: number;
}

type FormState = { id?: string; name: string; nameAr: string; city: string; address: string };

const emptyForm: FormState = { name: "", nameAr: "", city: "", address: "" };

export function BranchesClient({ branches }: { branches: BranchRow[] }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [showArchived, setShowArchived] = useState(false);

  const visible = showArchived ? branches : branches.filter((b) => b.active);
  const scored = branches.filter((b) => b.active && b.score !== null);
  const best = scored.length ? scored.reduce((a, b) => ((b.score ?? 0) > (a.score ?? 0) ? b : a)) : null;
  const worst = scored.length ? scored.reduce((a, b) => ((b.score ?? 0) < (a.score ?? 0) ? b : a)) : null;

  function openCreate() {
    setForm(emptyForm);
    setOpen(true);
  }

  function openEdit(branch: BranchRow) {
    setForm({
      id: branch.id,
      name: branch.name,
      nameAr: branch.nameAr ?? "",
      city: branch.city ?? "",
      address: branch.address ?? "",
    });
    setOpen(true);
  }

  function save() {
    if (!form.name.trim()) return;
    startTransition(async () => {
      if (form.id) {
        await updateBranchAction(locale, form.id, {
          name: form.name,
          nameAr: form.nameAr,
          city: form.city,
          address: form.address,
        });
      } else {
        await createBranchAction(locale, {
          name: form.name,
          nameAr: form.nameAr,
          city: form.city,
          address: form.address,
        });
      }
      setOpen(false);
      router.refresh();
    });
  }

  function toggleActive(branch: BranchRow) {
    startTransition(async () => {
      await setBranchActiveAction(locale, branch.id, !branch.active);
      router.refresh();
    });
  }

  const displayName = (b: BranchRow) => (locale === "ar" && b.nameAr ? b.nameAr : b.name);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryTile label={t("branches.totalBranches")} value={String(branches.filter((b) => b.active).length)} />
          <SummaryTile
            label={t("branches.bestBranch")}
            value={best ? displayName(best) : "—"}
            hint={best?.score !== null && best ? `${best.score}` : undefined}
            tone="mint"
          />
          <SummaryTile
            label={t("branches.needsAttention")}
            value={worst && worst.id !== best?.id ? displayName(worst) : "—"}
            hint={worst && worst.id !== best?.id && worst.score !== null ? `${worst.score}` : undefined}
            tone="amber"
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={() => setShowArchived((v) => !v)}>
          {showArchived ? t("branches.hideArchived") : t("branches.showArchived")}
        </Button>
        <Button onClick={openCreate} className="gap-1.5">
          <PlusIcon className="h-4 w-4" />
          {t("branches.addBranch")}
        </Button>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          icon={<BuildingIcon className="h-6 w-6" />}
          title={t("branches.emptyTitle")}
          body={t("branches.emptyBody")}
          action={<Button onClick={openCreate}>{t("branches.addBranch")}</Button>}
        />
      ) : (
        <div className="space-y-3">
          {visible.map((b) => {
            const tone = b.score !== null ? scoreTone(b.score) : null;
            const toneClass = tone ? scoreToneClasses[tone] : null;
            return (
              <Card key={b.id} className={cn(!b.active && "opacity-60")}>
                <CardContent className="flex flex-wrap items-center gap-4 p-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-ink-900">{displayName(b)}</p>
                      <Badge tone="neutral">{b.code}</Badge>
                      {!b.active && <Badge tone="warning">{t("branches.archived")}</Badge>}
                    </div>
                    <p className="mt-1 text-xs text-ink-400">
                      {[b.city, b.address].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>

                  <div className="w-full sm:w-48">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs text-ink-400">{t("branches.satisfaction")}</span>
                      {b.score !== null && toneClass ? (
                        <span className={cn("text-lg font-semibold", toneClass.text)}>{b.score}</span>
                      ) : (
                        <span className="text-xs text-ink-400">{t("branches.noScoreYet")}</span>
                      )}
                    </div>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
                      {b.score !== null && toneClass && (
                        <div className={cn("h-full rounded-full", toneClass.bar)} style={{ width: `${b.score}%` }} />
                      )}
                    </div>
                  </div>

                  <div className="text-end">
                    <p className="text-xs text-ink-400">{t("branches.responses")}</p>
                    <p className="text-sm font-semibold text-ink-900">{formatNumber(b.totalResponses, locale)}</p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEdit(b)}>
                      <EditIcon className="h-3.5 w-3.5" />
                      {t("branches.editBranch")}
                    </Button>
                    <Button variant="ghost" size="sm" loading={pending} onClick={() => toggleActive(b)}>
                      {b.active ? t("branches.archive") : t("branches.restore")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTitle>{form.id ? t("branches.editBranch") : t("branches.addBranch")}</DialogTitle>
        <DialogDescription>{t("branches.codeHelp")}</DialogDescription>
        <div className="mt-5 space-y-3">
          <Field label={t("branches.name")}>
            <Input
              value={form.name}
              placeholder={t("branches.namePlaceholder")}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label={t("branches.nameAr")}>
            <Input value={form.nameAr} dir="rtl" onChange={(e) => setForm({ ...form, nameAr: e.target.value })} />
          </Field>
          <Field label={t("branches.city")}>
            <Input
              value={form.city}
              placeholder={t("branches.cityPlaceholder")}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          </Field>
          <Field label={t("branches.address")}>
            <Input
              value={form.address}
              placeholder={t("branches.addressPlaceholder")}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Field>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            {t("branches.cancel")}
          </Button>
          <Button loading={pending} disabled={!form.name.trim()} onClick={save}>
            {t("branches.save")}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-ink-600">{label}</span>
      {children}
    </label>
  );
}

function SummaryTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "mint" | "amber";
}) {
  return (
    <div className="rounded-2xl border border-ink-200/70 bg-surface p-4 shadow-soft">
      <p className="text-xs text-ink-400">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="truncate text-lg font-semibold text-ink-900">{value}</p>
        {hint && (
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-semibold",
              tone === "mint" ? "bg-mint-50 text-mint-content" : "bg-amber-50 text-amber-content"
            )}
          >
            {hint}
          </span>
        )}
      </div>
    </div>
  );
}
