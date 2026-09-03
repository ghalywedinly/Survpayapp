import { db } from "@/lib/db";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { cookies, headers } from "next/headers";
import { localeCookieName, isLocale, defaultLocale, type Locale } from "@/lib/i18n/config";
import { PublicSurveyClient } from "@/components/survey-runtime/public-survey-client";
import { Logo } from "@/components/brand/logo";

async function resolveLocale(language?: string | null): Promise<Locale> {
  if (language === "ar") return "ar";
  if (language === "en") return "en";
  const cookieLocale = cookies().get(localeCookieName)?.value;
  if (isLocale(cookieLocale)) return cookieLocale;
  const acceptLanguage = headers().get("accept-language") ?? "";
  if (acceptLanguage.toLowerCase().includes("ar")) return "ar";
  return defaultLocale;
}

export default async function PublicSurveyPage({ params }: { params: { code: string } }) {
  const survey = await db.survey.findUnique({
    where: { code: params.code },
    include: {
      questions: { include: { options: { orderBy: { order: "asc" } } }, orderBy: { order: "asc" } },
      settings: true,
      rewardConfig: true,
      _count: { select: { responses: true } },
    },
  });

  const locale = await resolveLocale(survey?.settings?.language);
  const dict = getDictionary(locale);

  if (!survey) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center">
        <Logo />
        <p className="mt-4 text-lg font-semibold text-ink-900">{dict.publicSurvey.notFoundTitle}</p>
        <p className="text-sm text-ink-500">{dict.publicSurvey.notFoundBody}</p>
      </div>
    );
  }

  const isClosed =
    survey.status === "closed" ||
    survey.status === "archived" ||
    survey.status === "draft" ||
    survey.status === "scheduled" ||
    (survey.endDate ? new Date() > survey.endDate : false) ||
    (survey.settings?.responseLimit ? survey._count.responses >= survey.settings.responseLimit : false);

  return (
    <PublicSurveyClient
      code={survey.code}
      title={survey.title}
      titleAr={survey.titleAr}
      description={survey.description}
      descriptionAr={survey.descriptionAr}
      logoUrl={survey.logoUrl}
      estimatedMinutes={survey.estimatedMinutes}
      requireEmail={survey.settings?.requireEmail ?? false}
      collectFutureConsent={survey.settings?.collectFutureConsent ?? false}
      initiallyClosed={isClosed}
      reward={{
        enabled: survey.rewardConfig?.enabled ?? false,
        amount: survey.rewardConfig?.amount ?? 0,
        currency: survey.rewardConfig?.currency ?? "SAR",
        rewardType: (survey.rewardConfig?.rewardType as "cash" | "gift_card" | "coupon") ?? "cash",
      }}
      questions={survey.questions.map((q) => ({
        id: q.id,
        type: q.type,
        text: q.text,
        textAr: q.textAr,
        description: q.description,
        descriptionAr: q.descriptionAr,
        required: q.required,
        options: q.options,
        matrixRows: q.matrixRows ? JSON.parse(q.matrixRows) : [],
        conditionQuestionId: q.conditionQuestionId,
        conditionOperator: q.conditionOperator,
        conditionValue: q.conditionValue,
      }))}
    />
  );
}
