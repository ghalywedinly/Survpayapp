import { db } from "@/lib/db";
import { AnalyticsService } from "./analytics-service";

// AIService is a thin abstraction over whatever summarization backend is
// configured. The Phase 1 implementation is a template-based "mock" provider
// that reasons over real aggregated response data (never fabricated text) —
// swapping in a production LLM provider means implementing the same
// `generate` contract and changing MOCK_PROVIDER below.

export interface AIInsightItem {
  title: string;
  titleAr: string;
  body: string;
  bodyAr: string;
}

export interface AIInsightPayload {
  isDemo: boolean;
  hasData: boolean;
  insights: AIInsightItem[];
  recommendation: AIInsightItem | null;
  generatedAt: string;
}

export const AIService = {
  async generateSurveyInsights(surveyId: string): Promise<AIInsightPayload> {
    const [breakdown, overview] = await Promise.all([
      AnalyticsService.getQuestionBreakdown(surveyId),
      AnalyticsService.getSurveyOverview(surveyId),
    ]);

    if (overview.totalResponses < 5) {
      const payload: AIInsightPayload = {
        isDemo: true,
        hasData: false,
        insights: [],
        recommendation: null,
        generatedAt: new Date().toISOString(),
      };
      return payload;
    }

    const categorical = breakdown.filter(
      (b): b is Extract<(typeof breakdown)[number], { kind: "categorical" }> =>
        b.kind === "categorical" && b.responseCount > 0 && !b.question.isAttentionCheck
    );
    const insights: AIInsightItem[] = [];

    const ranked = [...categorical].sort((a, b) => {
      const topA = Math.max(...a.distribution.map((d) => d.pct), 0);
      const topB = Math.max(...b.distribution.map((d) => d.pct), 0);
      return topB - topA;
    });

    for (const q of ranked.slice(0, 3)) {
      const top = [...q.distribution].sort((a, b) => b.pct - a.pct)[0];
      if (!top || top.pct === 0) continue;
      insights.push({
        title: `"${top.label}" leads on "${q.question.text}"`,
        titleAr: `"${top.labelAr}" هي الأبرز في "${q.question.textAr ?? q.question.text}"`,
        body: `${top.pct}% of respondents selected "${top.label}" for "${q.question.text}" (${q.responseCount} responses analyzed).`,
        bodyAr: `اختار ${top.pct}% من المشاركين "${top.labelAr}" في سؤال "${q.question.textAr ?? q.question.text}" (من أصل ${q.responseCount} إجابة تم تحليلها).`,
      });
    }

    const numeric = breakdown.find((b) => b.kind === "numeric" && b.responseCount > 0);
    if (numeric && numeric.kind === "numeric") {
      insights.push({
        title: `Average score of ${numeric.average} on "${numeric.question.text}"`,
        titleAr: `متوسط تقييم ${numeric.average} في "${numeric.question.textAr ?? numeric.question.text}"`,
        body: `Respondents rated "${numeric.question.text}" at an average of ${numeric.average}, based on ${numeric.responseCount} responses.`,
        bodyAr: `قيّم المشاركون "${numeric.question.textAr ?? numeric.question.text}" بمتوسط ${numeric.average}، بناءً على ${numeric.responseCount} إجابة.`,
      });
    }

    const topInsight = ranked[0];
    const recommendation: AIInsightItem | null = topInsight
      ? {
          title: "Recommendation",
          titleAr: "التوصية",
          body: `Consider prioritizing "${[...topInsight.distribution].sort((a, b) => b.pct - a.pct)[0]?.label}" in your next decision, and monitor whether this pattern holds as more responses arrive.`,
          bodyAr: `يُنصح بإعطاء الأولوية لـ "${[...topInsight.distribution].sort((a, b) => b.pct - a.pct)[0]?.labelAr}" في قرارك القادم، ومتابعة ما إذا كان هذا النمط يستمر مع وصول المزيد من الإجابات.`,
        }
      : null;

    return {
      isDemo: true,
      hasData: true,
      insights: insights.slice(0, 3),
      recommendation,
      generatedAt: new Date().toISOString(),
    };
  },

  async persist(surveyId: string, payload: AIInsightPayload) {
    return db.aIInsight.create({
      data: {
        surveyId,
        summary: JSON.stringify(payload),
        isDemo: payload.isDemo,
        provider: "mock-template",
      },
    });
  },

  async latest(surveyId: string): Promise<AIInsightPayload | null> {
    const record = await db.aIInsight.findFirst({ where: { surveyId }, orderBy: { createdAt: "desc" } });
    if (!record) return null;
    return JSON.parse(record.summary) as AIInsightPayload;
  },
};
