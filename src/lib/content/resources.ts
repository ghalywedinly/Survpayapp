import type { Locale } from "@/lib/i18n/config";

export interface ResourceGuide {
  title: string;
  body: string;
  href: string;
  linkLabel: string;
  tag: string;
}

const en: { heading: string; subheading: string; guides: ResourceGuide[] } = {
  heading: "Resources",
  subheading: "Guides for running incentivized research well — from writing your first questionnaire to reading your results.",
  guides: [
    {
      tag: "Getting started",
      title: "Writing your first incentivized survey",
      body: "How to scope a research objective, choose the right question types, and estimate a realistic completion time before you publish.",
      href: "/how-it-works",
      linkLabel: "Read the workflow",
    },
    {
      tag: "Rewards",
      title: "Setting a reward that gets honest responses",
      body: "A guide to picking a per-response reward and response cap that fits your budget — and keeps attention-check failure rates low.",
      href: "/features",
      linkLabel: "See reward configuration",
    },
    {
      tag: "Data quality",
      title: "Duplicate prevention & attention checks, explained",
      body: "What SurvPay checks automatically, what you should add yourself, and how flagged responses affect your reward budget.",
      href: "/features",
      linkLabel: "Explore quality controls",
    },
    {
      tag: "Reporting",
      title: "From raw responses to a report your stakeholders read",
      body: "How the analytics dashboard, AI-assisted summaries, and the report builder fit together for a study readout.",
      href: "/how-it-works",
      linkLabel: "See the reporting flow",
    },
    {
      tag: "Compliance",
      title: "Respondent privacy and future-research consent",
      body: "Why SurvPay keeps future-invitation consent separate from your survey answers, and what that means for your data handling.",
      href: "/privacy",
      linkLabel: "Read the privacy policy",
    },
    {
      tag: "Pricing",
      title: "Choosing between Free, Pro and Business",
      body: "A short comparison of survey limits, analytics depth, and team features across SurvPay's plans.",
      href: "/pricing",
      linkLabel: "Compare plans",
    },
  ],
};

const ar: { heading: string; subheading: string; guides: ResourceGuide[] } = {
  heading: "الموارد",
  subheading: "أدلة لإجراء أبحاث محفزة بشكل صحيح — من كتابة استبيانك الأول إلى قراءة نتائجك.",
  guides: [
    {
      tag: "البدء",
      title: "كتابة استبيانك المحفّز الأول",
      body: "كيف تحدد هدف البحث، وتختار أنواع الأسئلة المناسبة، وتقدّر وقتًا واقعيًا للإكمال قبل النشر.",
      href: "/how-it-works",
      linkLabel: "اقرأ سير العمل",
    },
    {
      tag: "المكافآت",
      title: "ضبط مكافأة تحصل على إجابات صادقة",
      body: "دليل لاختيار مكافأة لكل إجابة وسقف إجابات يناسب ميزانيتك — مع تقليل معدل فشل أسئلة تحقق الانتباه.",
      href: "/features",
      linkLabel: "شاهد إعدادات المكافأة",
    },
    {
      tag: "جودة البيانات",
      title: "منع التكرار وأسئلة تحقق الانتباه، بالتفصيل",
      body: "ما الذي يتحقق منه SurvPay تلقائيًا، وما يجب عليك إضافته بنفسك، وكيف تؤثر الإجابات المُعلَّمة على ميزانية مكافآتك.",
      href: "/features",
      linkLabel: "استكشف ضوابط الجودة",
    },
    {
      tag: "التقارير",
      title: "من الإجابات الخام إلى تقرير يقرأه أصحاب المصلحة",
      body: "كيف تتكامل لوحة التحليلات وملخصات الذكاء الاصطناعي ومنشئ التقارير لعرض نتائج الدراسة.",
      href: "/how-it-works",
      linkLabel: "شاهد سير عمل التقارير",
    },
    {
      tag: "الامتثال",
      title: "خصوصية المشاركين وموافقة الأبحاث المستقبلية",
      body: "لماذا يفصل SurvPay موافقة الدعوات المستقبلية عن إجابات استبيانك، وماذا يعني ذلك لطريقة تعاملك مع البيانات.",
      href: "/privacy",
      linkLabel: "اقرأ سياسة الخصوصية",
    },
    {
      tag: "الأسعار",
      title: "الاختيار بين المجانية و Pro و Business",
      body: "مقارنة سريعة بين حدود الاستبيانات وعمق التحليلات ومزايا الفريق عبر خطط SurvPay.",
      href: "/pricing",
      linkLabel: "قارن الخطط",
    },
  ],
};

export function getResourcesContent(locale: Locale) {
  return locale === "ar" ? ar : en;
}
