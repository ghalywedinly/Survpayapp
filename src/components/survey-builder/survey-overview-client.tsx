"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";
import { formatCurrency } from "@/lib/format";
import { platformFeePct } from "@/lib/pricing";
import {
  updateSurveyBasicsAction,
  updateSurveyRewardAction,
  updateSurveySettingsAction,
  publishSurveyAction,
  setSurveyStatusAction,
} from "@/lib/actions/surveys";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input, Label, Textarea, Select } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface Props {
  surveyId: string;
  status: string;
  basics: { title: string; titleAr: string; description: string; descriptionAr: string; objective: string; estimatedMinutes: number };
  reward: { enabled: boolean; amount: number; currency: string; rewardType: "cash" | "gift_card" | "coupon"; maxResponses: number };
  settings: {
    responseLimit: number | null;
    startDate: string | null;
    endDate: string | null;
    anonymousResponses: boolean;
    requireEmail: boolean;
    preventDuplicates: boolean;
    captchaEnabled: boolean;
    collectFutureConsent: boolean;
  };
}

export function SurveyOverviewClient({ surveyId, status, basics: initBasics, reward: initReward, settings: initSettings }: Props) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const { push } = useToast();
  const [pending, startTransition] = useTransition();

  const [basics, setBasics] = useState(initBasics);
  const [reward, setReward] = useState(initReward);
  const [settings, setSettings] = useState(initSettings);

  const budget = reward.amount * reward.maxResponses;
  const fee = Math.round(budget * platformFeePct * 100) / 100;

  function saveBasics() {
    startTransition(async () => {
      await updateSurveyBasicsAction(locale, surveyId, basics);
      push({ title: t("settings.changesSaved"), tone: "success" });
      router.refresh();
    });
  }
  function saveReward() {
    startTransition(async () => {
      await updateSurveyRewardAction(locale, surveyId, reward);
      push({ title: t("settings.changesSaved"), tone: "success" });
      router.refresh();
    });
  }
  function saveSettings() {
    startTransition(async () => {
      await updateSurveySettingsAction(locale, surveyId, settings);
      push({ title: t("settings.changesSaved"), tone: "success" });
      router.refresh();
    });
  }
  function handlePublish() {
    startTransition(async () => {
      const result = await publishSurveyAction(locale, surveyId);
      if (result.ok) {
        push({ title: t("wizard.publishSuccess"), tone: "success" });
        router.refresh();
      } else if (result.error === "BUDGET_NOT_FUNDED") {
        push({ title: t("wizard.publishNote"), tone: "error" });
      }
    });
  }
  function handleStatus(next: "paused" | "active" | "closed" | "archived") {
    startTransition(async () => {
      await setSurveyStatusAction(locale, surveyId, next);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {status === "draft" && (
          <Button loading={pending} onClick={handlePublish}>
            {t("common.publish")}
          </Button>
        )}
        {status === "active" && (
          <Button variant="outline" loading={pending} onClick={() => handleStatus("paused")}>
            {t("surveys.actionPause")}
          </Button>
        )}
        {status === "paused" && (
          <Button variant="outline" loading={pending} onClick={() => handleStatus("active")}>
            {t("surveys.actionResume")}
          </Button>
        )}
        {(status === "active" || status === "paused") && (
          <Button variant="outline" loading={pending} onClick={() => handleStatus("closed")}>
            {t("surveys.actionClose")}
          </Button>
        )}
        {status === "closed" && (
          <Button variant="outline" loading={pending} onClick={() => handleStatus("archived")}>
            {t("surveys.statusArchived")}
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("wizard.step1Title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>{t("wizard.surveyTitle")}</Label>
              <Input value={basics.title} onChange={(e) => setBasics((b) => ({ ...b, title: e.target.value }))} />
            </div>
            <div>
              <Label>{t("wizard.surveyTitle")} (العربية)</Label>
              <Input dir="rtl" value={basics.titleAr} onChange={(e) => setBasics((b) => ({ ...b, titleAr: e.target.value }))} />
            </div>
          </div>
          <div>
            <Label>{t("wizard.surveyDescription")}</Label>
            <Textarea rows={2} value={basics.description} onChange={(e) => setBasics((b) => ({ ...b, description: e.target.value }))} />
          </div>
          <div>
            <Label>{t("wizard.objective")}</Label>
            <Textarea rows={2} value={basics.objective} onChange={(e) => setBasics((b) => ({ ...b, objective: e.target.value }))} />
          </div>
          <div className="max-w-xs">
            <Label>{t("wizard.estimatedTime")}</Label>
            <Input type="number" min={1} value={basics.estimatedMinutes} onChange={(e) => setBasics((b) => ({ ...b, estimatedMinutes: Number(e.target.value) }))} />
          </div>
          <Button size="sm" loading={pending} onClick={saveBasics}>
            {t("common.save")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("wizard.step3Title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm font-medium text-ink-700">{t("wizard.rewardToggleLabel")}</span>
            <Switch checked={reward.enabled} onCheckedChange={(v) => setReward((r) => ({ ...r, enabled: v }))} />
          </label>
          {reward.enabled && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <Label>{t("wizard.rewardAmount")}</Label>
                <Input type="number" min={1} value={reward.amount} onChange={(e) => setReward((r) => ({ ...r, amount: Number(e.target.value) }))} />
              </div>
              <div>
                <Label>{t("wizard.rewardType")}</Label>
                <Select value={reward.rewardType} onChange={(e) => setReward((r) => ({ ...r, rewardType: e.target.value as typeof r.rewardType }))}>
                  <option value="cash">{t("wizard.rewardTypeCash")}</option>
                  <option value="gift_card">{t("wizard.rewardTypeGiftCard")}</option>
                  <option value="coupon">{t("wizard.rewardTypeCoupon")}</option>
                </Select>
              </div>
              <div>
                <Label>{t("wizard.maxResponses")}</Label>
                <Input type="number" min={1} value={reward.maxResponses} onChange={(e) => setReward((r) => ({ ...r, maxResponses: Number(e.target.value) }))} />
              </div>
            </div>
          )}
          {reward.enabled && (
            <p className="text-xs text-ink-400">
              {t("wizard.maxBudget")}: <span className="font-medium text-ink-700">{formatCurrency(budget, locale)}</span> · {t("wizard.platformFee")}:{" "}
              <span className="font-medium text-ink-700">{formatCurrency(fee, locale)}</span>
            </p>
          )}
          <Button size="sm" loading={pending} onClick={saveReward}>
            {t("common.save")}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("wizard.step4Title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label>{t("wizard.responseLimit")}</Label>
              <Input
                type="number"
                min={1}
                value={settings.responseLimit ?? ""}
                onChange={(e) => setSettings((s) => ({ ...s, responseLimit: e.target.value ? Number(e.target.value) : null }))}
                placeholder={t("common.optional")}
              />
            </div>
            <div />
            <div>
              <Label>{t("wizard.startDate")}</Label>
              <Input type="date" value={settings.startDate ?? ""} onChange={(e) => setSettings((s) => ({ ...s, startDate: e.target.value || null }))} />
            </div>
            <div>
              <Label>{t("wizard.endDate")}</Label>
              <Input type="date" value={settings.endDate ?? ""} onChange={(e) => setSettings((s) => ({ ...s, endDate: e.target.value || null }))} />
            </div>
          </div>
          <div className="space-y-3 rounded-xl border border-ink-200 p-4">
            {(
              [
                ["anonymousResponses", t("wizard.anonymousResponses")],
                ["requireEmail", t("wizard.requireEmail")],
                ["preventDuplicates", t("wizard.preventDuplicates")],
                ["captchaEnabled", t("wizard.captchaEnabled")],
                ["collectFutureConsent", t("wizard.collectFutureConsent")],
              ] as const
            ).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between text-sm text-ink-700">
                {label}
                <Switch checked={settings[key]} onCheckedChange={(v) => setSettings((s) => ({ ...s, [key]: v }))} />
              </label>
            ))}
          </div>
          <Button size="sm" loading={pending} onClick={saveSettings}>
            {t("common.save")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
