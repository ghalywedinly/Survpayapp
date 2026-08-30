/* eslint-disable no-console */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

export const seedDb = new PrismaClient();
const db = seedDb;

// ---------------------------------------------------------------------------
// Small deterministic-ish helpers
// ---------------------------------------------------------------------------

let seedCounter = 0;
function id(prefix: string) {
  seedCounter += 1;
  return `${prefix}_${seedCounter.toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedPick<T>(items: { value: T; weight: number }[]): T {
  const total = items.reduce((s, i) => s + i.weight, 0);
  let r = Math.random() * total;
  for (const item of items) {
    r -= item.weight;
    if (r <= 0) return item.value;
  }
  return items[items.length - 1].value;
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomSurveyCode(length = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < length; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

const gccCountries = [
  { value: "Saudi Arabia", weight: 55 },
  { value: "United Arab Emirates", weight: 18 },
  { value: "Kuwait", weight: 9 },
  { value: "Qatar", weight: 8 },
  { value: "Bahrain", weight: 6 },
  { value: "Oman", weight: 4 },
];
const devices = [
  { value: "mobile", weight: 68 },
  { value: "desktop", weight: 24 },
  { value: "tablet", weight: 8 },
];
const sources = [
  { value: "share_link", weight: 45 },
  { value: "email", weight: 25 },
  { value: "website", weight: 20 },
  { value: "social_media", weight: 10 },
];

// ---------------------------------------------------------------------------
// Question option helpers
// ---------------------------------------------------------------------------

interface OptDef {
  label: string;
  labelAr: string;
  weight: number;
}

interface QDef {
  type: string;
  text: string;
  textAr: string;
  description?: string;
  descriptionAr?: string;
  required?: boolean;
  isAttentionCheck?: boolean;
  isDemographic?: boolean;
  options?: OptDef[];
  matrixRows?: string[];
  attentionExpected?: string;
}

async function createSurveyStructure(surveyId: string, questions: QDef[]) {
  const created: { id: string; type: string; options: { id: string; value: string; weight: number }[]; matrixRows: string[] }[] = [];
  let order = 0;
  for (const q of questions) {
    const options = (q.options ?? []).map((o, i) => ({ label: o.label, labelAr: o.labelAr, value: `opt_${i + 1}`, order: i, weight: o.weight }));
    const validation = q.isAttentionCheck && q.attentionExpected ? JSON.stringify({ expected: q.attentionExpected }) : null;
    const question = await db.question.create({
      data: {
        surveyId,
        type: q.type,
        text: q.text,
        textAr: q.textAr,
        description: q.description,
        descriptionAr: q.descriptionAr,
        required: q.required ?? true,
        order: order++,
        isAttentionCheck: q.isAttentionCheck ?? false,
        isDemographic: q.isDemographic ?? false,
        validation,
        matrixRows: q.matrixRows ? JSON.stringify(q.matrixRows) : null,
        options: { create: options.map(({ weight, ...rest }) => rest) },
      },
      include: { options: { orderBy: { order: "asc" } } },
    });
    created.push({
      id: question.id,
      type: q.type,
      options: question.options.map((o, i) => ({ id: o.id, value: o.value, weight: options[i].weight })),
      matrixRows: q.matrixRows ?? [],
    });
  }
  return created;
}

function generateAnswerValue(q: { type: string; options: { value: string; weight: number }[]; matrixRows: string[] }) {
  switch (q.type) {
    case "single_choice":
    case "dropdown":
    case "yes_no":
    case "likert":
      return weightedPick(q.options.map((o) => ({ value: o.value, weight: o.weight })));
    case "multiple_choice": {
      const count = randomInt(1, Math.min(3, q.options.length));
      const shuffled = [...q.options].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count).map((o) => o.value);
    }
    case "rating":
      return weightedPick([
        { value: 5, weight: 30 },
        { value: 4, weight: 32 },
        { value: 3, weight: 20 },
        { value: 2, weight: 11 },
        { value: 1, weight: 7 },
      ]);
    case "nps":
      return weightedPick(
        Array.from({ length: 11 }, (_, n) => ({ value: n, weight: n >= 9 ? 14 : n >= 7 ? 10 : n >= 4 ? 4 : 2 }))
      );
    case "number":
      return randomInt(1, 12);
    case "date":
      return daysAgo(randomInt(1, 365)).toISOString().slice(0, 10);
    case "short_text":
      return pick(["Good overall", "Could be faster", "Great experience", "Needs improvement", "Very satisfied", "خدمة ممتازة"]);
    case "long_text":
      return pick([
        "The experience was smooth overall, though I ran into a small delay once.",
        "I appreciate the convenience, but pricing could be more transparent.",
        "Customer support was responsive and resolved my issue quickly.",
        "التطبيق سهل الاستخدام لكن أتمنى تحسين سرعة التحميل.",
        "الخدمة جيدة بشكل عام وأنصح بها للأصدقاء.",
      ]);
    case "ranking":
      return [...q.options.map((o) => o.value)].sort(() => Math.random() - 0.5);
    case "matrix": {
      const map: Record<string, string> = {};
      for (const row of q.matrixRows) {
        map[row] = weightedPick(q.options.map((o) => ({ value: o.value, weight: o.weight })));
      }
      return map;
    }
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Survey definitions
// ---------------------------------------------------------------------------

const attentionQ: QDef = {
  type: "single_choice",
  text: "To show you're reading carefully, please select 'Agree'.",
  textAr: "لإظهار أنك تقرأ بعناية، يرجى اختيار 'أوافق'.",
  isAttentionCheck: true,
  attentionExpected: "opt_2",
  options: [
    { label: "Disagree", labelAr: "لا أوافق", weight: 3 },
    { label: "Agree", labelAr: "أوافق", weight: 94 },
    { label: "Not sure", labelAr: "غير متأكد", weight: 3 },
  ],
};

const surveyDefs = [
  {
    title: "Saudi Consumer Shopping Habits",
    titleAr: "عادات التسوق لدى المستهلك السعودي",
    description: "Understanding how Saudi consumers shop online and in-store in 2026.",
    descriptionAr: "فهم كيفية تسوق المستهلكين السعوديين عبر الإنترنت وفي المتاجر خلال عام 2026.",
    objective: "Inform Q3 channel investment decisions for a national retail chain.",
    estimatedMinutes: 6,
    status: "active",
    rewardAmount: 8,
    rewardType: "cash",
    maxResponses: 760,
    validTarget: 700,
    daysActive: 34,
    questions: [
      {
        type: "single_choice",
        text: "Where do you shop most often?",
        textAr: "أين تتسوق غالبًا؟",
        options: [
          { label: "In-store", labelAr: "داخل المتجر", weight: 32 },
          { label: "Online", labelAr: "عبر الإنترنت", weight: 41 },
          { label: "Both equally", labelAr: "كلاهما بالتساوي", weight: 27 },
        ],
      },
      {
        type: "single_choice",
        text: "What is your average monthly shopping spend?",
        textAr: "ما متوسط إنفاقك الشهري على التسوق؟",
        options: [
          { label: "Under SAR 500", labelAr: "أقل من 500 ريال", weight: 22 },
          { label: "SAR 500–1,500", labelAr: "500–1500 ريال", weight: 38 },
          { label: "SAR 1,500–3,000", labelAr: "1500–3000 ريال", weight: 26 },
          { label: "Over SAR 3,000", labelAr: "أكثر من 3000 ريال", weight: 14 },
        ],
      },
      {
        type: "multiple_choice",
        text: "Which payment methods do you use online?",
        textAr: "ما وسائل الدفع التي تستخدمها عبر الإنترنت؟",
        options: [
          { label: "mada", labelAr: "مدى", weight: 30 },
          { label: "Apple Pay", labelAr: "Apple Pay", weight: 26 },
          { label: "STC Pay", labelAr: "STC Pay", weight: 22 },
          { label: "Credit card", labelAr: "بطاقة ائتمان", weight: 15 },
          { label: "Cash on delivery", labelAr: "الدفع عند الاستلام", weight: 18 },
        ],
      },
      {
        type: "rating",
        text: "How satisfied are you with online delivery times?",
        textAr: "ما مدى رضاك عن أوقات التوصيل عبر الإنترنت؟",
      },
      {
        type: "nps",
        text: "How likely are you to recommend your favorite retailer to a friend?",
        textAr: "ما مدى احتمالية أن توصي صديقًا بمتجرك المفضل؟",
      },
      {
        type: "single_choice",
        text: "Which city are you based in?",
        textAr: "في أي مدينة تقيم؟",
        isDemographic: true,
        options: [
          { label: "Riyadh", labelAr: "الرياض", weight: 38 },
          { label: "Jeddah", labelAr: "جدة", weight: 26 },
          { label: "Dammam", labelAr: "الدمام", weight: 14 },
          { label: "Makkah", labelAr: "مكة المكرمة", weight: 12 },
          { label: "Other", labelAr: "أخرى", weight: 10 },
        ],
      },
      {
        type: "single_choice",
        text: "Age group",
        textAr: "الفئة العمرية",
        isDemographic: true,
        options: [
          { label: "18–24", labelAr: "18–24", weight: 24 },
          { label: "25–34", labelAr: "25–34", weight: 36 },
          { label: "35–44", labelAr: "35–44", weight: 22 },
          { label: "45+", labelAr: "45+", weight: 18 },
        ],
      },
      attentionQ,
    ] as QDef[],
  },
  {
    title: "Digital Banking Experience",
    titleAr: "تجربة الخدمات المصرفية الرقمية",
    description: "Evaluating satisfaction with mobile banking apps across the GCC.",
    descriptionAr: "تقييم رضا المستخدمين عن تطبيقات الخدمات المصرفية عبر الجوال في دول الخليج.",
    objective: "Benchmark app satisfaction ahead of a mobile banking redesign.",
    estimatedMinutes: 5,
    status: "active",
    rewardAmount: 12,
    rewardType: "cash",
    maxResponses: 610,
    validTarget: 560,
    daysActive: 21,
    questions: [
      {
        type: "single_choice",
        text: "Which bank's app do you use most?",
        textAr: "ما التطبيق المصرفي الذي تستخدمه أكثر؟",
        options: [
          { label: "Al Rajhi Bank", labelAr: "مصرف الراجحي", weight: 30 },
          { label: "SNB", labelAr: "البنك الأهلي السعودي", weight: 22 },
          { label: "Riyad Bank", labelAr: "بنك الرياض", weight: 14 },
          { label: "SABB", labelAr: "ساب", weight: 12 },
          { label: "STC Bank", labelAr: "بنك STC", weight: 13 },
          { label: "Other", labelAr: "أخرى", weight: 9 },
        ],
      },
      {
        type: "rating",
        text: "How would you rate the app's ease of use?",
        textAr: "كيف تقيّم سهولة استخدام التطبيق؟",
      },
      {
        type: "multiple_choice",
        text: "Which features do you use regularly?",
        textAr: "ما الميزات التي تستخدمها بانتظام؟",
        options: [
          { label: "Money transfer", labelAr: "التحويل المالي", weight: 34 },
          { label: "Bill payments", labelAr: "دفع الفواتير", weight: 28 },
          { label: "Budgeting tools", labelAr: "أدوات الميزانية", weight: 12 },
          { label: "Card management", labelAr: "إدارة البطاقات", weight: 18 },
          { label: "Investments", labelAr: "الاستثمار", weight: 8 },
        ],
      },
      {
        type: "yes_no",
        text: "Have you contacted customer support in the last 3 months?",
        textAr: "هل تواصلت مع خدمة العملاء خلال آخر 3 أشهر؟",
        options: [
          { label: "Yes", labelAr: "نعم", weight: 28 },
          { label: "No", labelAr: "لا", weight: 72 },
        ],
      },
      {
        type: "nps",
        text: "How likely are you to recommend this app to a friend or colleague?",
        textAr: "ما مدى احتمالية أن توصي بهذا التطبيق لصديق أو زميل؟",
      },
      {
        type: "long_text",
        text: "What is one thing we could improve?",
        textAr: "ما الشيء الذي يمكننا تحسينه؟",
        required: false,
      },
      {
        type: "single_choice",
        text: "Age group",
        textAr: "الفئة العمرية",
        isDemographic: true,
        options: [
          { label: "18–24", labelAr: "18–24", weight: 18 },
          { label: "25–34", labelAr: "25–34", weight: 40 },
          { label: "35–44", labelAr: "35–44", weight: 26 },
          { label: "45+", labelAr: "45+", weight: 16 },
        ],
      },
      attentionQ,
    ] as QDef[],
  },
  {
    title: "Food Delivery Customer Experience",
    titleAr: "تجربة عملاء توصيل الطعام",
    description: "A closed study on food delivery satisfaction across major GCC cities.",
    descriptionAr: "دراسة مكتملة حول رضا عملاء توصيل الطعام في أبرز مدن الخليج.",
    objective: "Identify the top three drivers of delivery satisfaction.",
    estimatedMinutes: 4,
    status: "closed",
    rewardAmount: 6,
    rewardType: "coupon",
    maxResponses: 860,
    validTarget: 860,
    daysActive: 60,
    questions: [
      {
        type: "single_choice",
        text: "Which app do you use most for food delivery?",
        textAr: "أي تطبيق توصيل طعام تستخدمه أكثر؟",
        options: [
          { label: "HungerStation", labelAr: "هنقرستيشن", weight: 34 },
          { label: "Jahez", labelAr: "جاهز", weight: 26 },
          { label: "ToYou", labelAr: "توصيل", weight: 12 },
          { label: "Mrsool", labelAr: "مرسول", weight: 14 },
          { label: "Careem", labelAr: "كريم", weight: 10 },
          { label: "Other", labelAr: "أخرى", weight: 4 },
        ],
      },
      {
        type: "single_choice",
        text: "How often do you order food delivery?",
        textAr: "كم مرة تطلب توصيل الطعام؟",
        options: [
          { label: "Daily", labelAr: "يوميًا", weight: 8 },
          { label: "A few times a week", labelAr: "عدة مرات أسبوعيًا", weight: 34 },
          { label: "Weekly", labelAr: "أسبوعيًا", weight: 30 },
          { label: "A few times a month", labelAr: "عدة مرات شهريًا", weight: 28 },
        ],
      },
      {
        type: "matrix",
        text: "Rate the following aspects of your last order",
        textAr: "قيّم الجوانب التالية لطلبك الأخير",
        matrixRows: ["Delivery speed", "Order accuracy", "Packaging quality"],
        options: [
          { label: "Poor", labelAr: "ضعيف", weight: 10 },
          { label: "Average", labelAr: "متوسط", weight: 28 },
          { label: "Good", labelAr: "جيد", weight: 62 },
        ],
      },
      {
        type: "yes_no",
        text: "Have you experienced a late delivery in the last month?",
        textAr: "هل تأخر توصيل طلبك خلال الشهر الماضي؟",
        options: [
          { label: "Yes", labelAr: "نعم", weight: 37 },
          { label: "No", labelAr: "لا", weight: 63 },
        ],
      },
      {
        type: "nps",
        text: "How likely are you to recommend this app to a friend?",
        textAr: "ما مدى احتمالية أن توصي بهذا التطبيق لصديق؟",
      },
      {
        type: "single_choice",
        text: "Which city are you based in?",
        textAr: "في أي مدينة تقيم؟",
        isDemographic: true,
        options: [
          { label: "Riyadh", labelAr: "الرياض", weight: 30 },
          { label: "Jeddah", labelAr: "جدة", weight: 22 },
          { label: "Dubai", labelAr: "دبي", weight: 18 },
          { label: "Dammam", labelAr: "الدمام", weight: 12 },
          { label: "Doha", labelAr: "الدوحة", weight: 10 },
          { label: "Other", labelAr: "أخرى", weight: 8 },
        ],
      },
      attentionQ,
    ] as QDef[],
  },
  {
    title: "New Product Concept Test",
    titleAr: "اختبار مفهوم منتج جديد",
    description: "Early-stage concept testing for a new subscription box service.",
    descriptionAr: "اختبار مبكر لمفهوم خدمة صندوق اشتراك جديدة.",
    objective: "Validate demand before committing to production.",
    estimatedMinutes: 7,
    status: "draft",
    rewardAmount: 15,
    rewardType: "gift_card",
    maxResponses: 300,
    validTarget: 0,
    daysActive: 0,
    questions: [
      {
        type: "single_choice",
        text: "How interested would you be in this product?",
        textAr: "ما مدى اهتمامك بهذا المنتج؟",
        options: [
          { label: "Very interested", labelAr: "مهتم جدًا", weight: 30 },
          { label: "Somewhat interested", labelAr: "مهتم إلى حد ما", weight: 40 },
          { label: "Not interested", labelAr: "غير مهتم", weight: 30 },
        ],
      },
      {
        type: "number",
        text: "How much would you expect to pay per month (SAR)?",
        textAr: "كم تتوقع أن تدفع شهريًا (ريال)؟",
      },
      {
        type: "long_text",
        text: "What would make this product a must-have for you?",
        textAr: "ما الذي يجعل هذا المنتج ضروريًا بالنسبة لك؟",
        required: false,
      },
    ] as QDef[],
  },
  {
    title: "University Student Experience",
    titleAr: "تجربة الطلاب الجامعيين",
    description: "Understanding campus life and academic support satisfaction.",
    descriptionAr: "فهم الحياة الجامعية ورضا الطلاب عن الدعم الأكاديمي.",
    objective: "Support the student affairs office's annual satisfaction report.",
    estimatedMinutes: 5,
    status: "paused",
    rewardAmount: 5,
    rewardType: "gift_card",
    maxResponses: 460,
    validTarget: 270,
    daysActive: 15,
    questions: [
      {
        type: "dropdown",
        text: "Which university do you attend?",
        textAr: "في أي جامعة تدرس؟",
        options: [
          { label: "King Saud University", labelAr: "جامعة الملك سعود", weight: 28 },
          { label: "King Abdulaziz University", labelAr: "جامعة الملك عبدالعزيز", weight: 24 },
          { label: "KFUPM", labelAr: "جامعة الملك فهد للبترول والمعادن", weight: 18 },
          { label: "Princess Nourah University", labelAr: "جامعة الأميرة نورة", weight: 16 },
          { label: "Other", labelAr: "أخرى", weight: 14 },
        ],
      },
      {
        type: "single_choice",
        text: "What year of study are you in?",
        textAr: "ما هي سنتك الدراسية؟",
        isDemographic: true,
        options: [
          { label: "1st year", labelAr: "السنة الأولى", weight: 26 },
          { label: "2nd year", labelAr: "السنة الثانية", weight: 24 },
          { label: "3rd year", labelAr: "السنة الثالثة", weight: 26 },
          { label: "4th year+", labelAr: "السنة الرابعة فأكثر", weight: 24 },
        ],
      },
      {
        type: "rating",
        text: "How satisfied are you with campus life overall?",
        textAr: "ما مدى رضاك عن الحياة الجامعية بشكل عام؟",
      },
      {
        type: "likert",
        text: "Academic advisors are responsive to my needs.",
        textAr: "المرشدون الأكاديميون يستجيبون لاحتياجاتي.",
        options: [
          { label: "Strongly disagree", labelAr: "لا أوافق بشدة", weight: 8 },
          { label: "Disagree", labelAr: "لا أوافق", weight: 14 },
          { label: "Neutral", labelAr: "محايد", weight: 24 },
          { label: "Agree", labelAr: "أوافق", weight: 36 },
          { label: "Strongly agree", labelAr: "أوافق بشدة", weight: 18 },
        ],
      },
      {
        type: "nps",
        text: "How likely are you to recommend your university to a friend?",
        textAr: "ما مدى احتمالية أن توصي بجامعتك لصديق؟",
      },
      attentionQ,
    ] as QDef[],
  },
];

// ---------------------------------------------------------------------------
// Main seed
// ---------------------------------------------------------------------------

/**
 * Wipes and re-seeds the database with demo data. Exported so it can be
 * invoked either from the CLI (prisma/seed.ts, for local/dev use) or from
 * the one-time admin API route (src/app/api/admin/seed/route.ts) for
 * environments — like a serverless deployment — where a shell isn't
 * available to run the CLI directly against the database.
 */
export async function runSeed() {
  console.log("Seeding SurvPay demo data…");

  // Clean slate (dependency order, children first)
  await db.responseAnswer.deleteMany();
  await db.surveyResponse.deleteMany();
  await db.questionOption.deleteMany();
  await db.question.deleteMany();
  await db.surveyPage.deleteMany();
  await db.surveyEvent.deleteMany();
  await db.aIInsight.deleteMany();
  await db.report.deleteMany();
  await db.rewardTransaction.deleteMany();
  await db.rewardBudget.deleteMany();
  await db.rewardConfig.deleteMany();
  await db.surveySettings.deleteMany();
  await db.survey.deleteMany();
  await db.paymentTransaction.deleteMany();
  await db.invoice.deleteMany();
  await db.notification.deleteMany();
  await db.auditLog.deleteMany();
  await db.organizationMember.deleteMany();
  await db.session.deleteMany();
  await db.account.deleteMany();
  await db.organization.deleteMany();
  await db.user.deleteMany();

  const passwordHash = await bcrypt.hash("Demo1234!", 10);

  const owner = await db.user.create({
    data: {
      email: "demo@survpay.com",
      passwordHash,
      name: "Layla Al-Otaibi",
      phone: "+966 55 123 4567",
      locale: "en",
      role: "researcher",
      emailVerified: true,
      emailVerifiedAt: daysAgo(90),
    },
  });

  const teammateAdmin = await db.user.create({
    data: {
      email: "omar@survpay.com",
      passwordHash,
      name: "Omar Al-Harbi",
      locale: "en",
      role: "product",
      emailVerified: true,
      emailVerifiedAt: daysAgo(60),
    },
  });

  const teammateEditor = await db.user.create({
    data: {
      email: "sara@survpay.com",
      passwordHash,
      name: "Sara Al-Qahtani",
      locale: "ar",
      role: "marketing",
      emailVerified: true,
      emailVerifiedAt: daysAgo(40),
    },
  });

  const invitedUser = await db.user.create({
    data: {
      email: "faisal.pending@survpay.com",
      passwordHash,
      name: "Faisal Al-Dossari",
      locale: "en",
      role: "consultant",
      emailVerified: false,
    },
  });

  const org = await db.organization.create({
    data: {
      name: "Al Faisal Research Group",
      slug: "al-faisal-research",
      industry: "Market Research",
      country: "SA",
      plan: "pro",
      createdAt: daysAgo(120),
    },
  });

  await db.organizationMember.createMany({
    data: [
      { organizationId: org.id, userId: owner.id, role: "owner", status: "active" },
      { organizationId: org.id, userId: teammateAdmin.id, role: "admin", status: "active" },
      { organizationId: org.id, userId: teammateEditor.id, role: "editor", status: "active" },
      { organizationId: org.id, userId: invitedUser.id, role: "viewer", status: "invited", invitedEmail: invitedUser.email },
    ],
  });

  // Subscription invoices (last 4 months)
  for (let i = 4; i >= 1; i--) {
    const periodStart = daysAgo(i * 30);
    const periodEnd = daysAgo(i * 30 - 29);
    const invoice = await db.invoice.create({
      data: {
        organizationId: org.id,
        number: `INV-2026-${(1000 + i).toString()}`,
        amount: 249,
        currency: "SAR",
        status: "paid",
        periodStart,
        periodEnd,
        issuedAt: periodStart,
      },
    });
    await db.paymentTransaction.create({
      data: {
        organizationId: org.id,
        purpose: "subscription",
        amount: 249,
        currency: "SAR",
        status: "completed",
        provider: "mock",
        description: `Pro plan — invoice ${invoice.number}`,
        createdAt: periodStart,
      },
    });
  }

  let totalResponses = 0;
  let totalValid = 0;

  for (const def of surveyDefs) {
    const code = randomSurveyCode();
    const survey = await db.survey.create({
      data: {
        organizationId: org.id,
        code,
        title: def.title,
        titleAr: def.titleAr,
        description: def.description,
        descriptionAr: def.descriptionAr,
        objective: def.objective,
        estimatedMinutes: def.estimatedMinutes,
        status: def.status,
        publishedAt: def.status === "draft" ? null : daysAgo(def.daysActive + 5),
        createdAt: daysAgo(def.daysActive + 10),
        settings: {
          create: {
            responseLimit: null,
            anonymousResponses: true,
            requireEmail: def.rewardType !== "cash" ? true : false,
            preventDuplicates: true,
            captchaEnabled: true,
            collectFutureConsent: Math.random() > 0.5,
            language: "both",
          },
        },
        rewardConfig: {
          create: {
            enabled: true,
            amount: def.rewardAmount,
            currency: "SAR",
            rewardType: def.rewardType,
            maxResponses: def.maxResponses,
            platformFeePct: 0.08,
          },
        },
      },
    });

    const questions = await createSurveyStructure(survey.id, def.questions);

    // Fund the incentive budget generously enough to cover the valid target.
    const funded = def.status === "draft" ? 0 : Math.round(def.rewardAmount * def.maxResponses * 1.08 * 100) / 100;
    let budget: { id: string } | null = null;
    if (funded > 0) {
      budget = await db.rewardBudget.create({
        data: { surveyId: survey.id, organizationId: org.id, fundedAmount: funded, distributedAmount: 0, currency: "SAR" },
      });
      await db.paymentTransaction.create({
        data: {
          organizationId: org.id,
          purpose: "incentive_funding",
          amount: funded,
          currency: "SAR",
          status: "completed",
          provider: "mock",
          relatedSurveyId: survey.id,
          description: `Incentive budget funding for ${def.title}`,
          createdAt: daysAgo(def.daysActive + 8),
        },
      });
      await db.rewardTransaction.create({
        data: { budgetId: budget.id, type: "funding", amount: funded, status: "completed", provider: "mock", note: "Initial funding" },
      });
    }

    if (def.status !== "draft") {
      await db.surveyEvent.create({ data: { surveyId: survey.id, type: "published", message: "Survey published", createdAt: daysAgo(def.daysActive + 5) } });
    }

    // Generate responses
    const rejectedCount = def.validTarget > 0 ? Math.round(def.validTarget * 0.05) : 0;
    const flaggedCount = def.validTarget > 0 ? Math.round(def.validTarget * 0.06) : 0;
    const total = def.validTarget + rejectedCount + flaggedCount;

    let distributed = 0;
    let rewardedCount = 0;
    const rewardTxBatch: { budgetId: string; responseId: string; type: string; amount: number; status: string; provider: string; note: string | null; createdAt: Date }[] = [];
    const responseRows: {
      id: string;
      surveyId: string;
      status: string;
      rewardStatus: string;
      respondentEmail: string | null;
      respondentHash: string;
      country: string;
      device: string;
      source: string;
      completionSeconds: number;
      failedAttentionCheck: boolean;
      submittedAt: Date;
      createdAt: Date;
    }[] = [];
    const answerRows: { id: string; responseId: string; questionId: string; value: string }[] = [];

    for (let i = 0; i < total; i++) {
      const respId = id("resp");
      const isRejected = i < rejectedCount;
      const isFlagged = !isRejected && i < rejectedCount + flaggedCount;
      const status = isRejected ? "rejected" : isFlagged ? "flagged" : "valid";
      const submittedAt = daysAgo(randomInt(0, Math.max(1, def.daysActive)));
      const completionSeconds = isFlagged ? randomInt(3, 8) : randomInt(def.estimatedMinutes * 30, def.estimatedMinutes * 90);

      let rewardStatus = "not_applicable";
      if (status === "valid" && budget && distributed + def.rewardAmount <= funded) {
        distributed += def.rewardAmount;
        rewardedCount += 1;
        rewardStatus = "completed";
        rewardTxBatch.push({
          budgetId: budget.id,
          responseId: respId,
          type: "reward",
          amount: def.rewardAmount,
          status: "completed",
          provider: def.rewardType,
          note: def.rewardType === "cash" ? "demo-cash-payout" : `DEMO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
          createdAt: submittedAt,
        });
      } else if (status === "valid") {
        rewardStatus = "pending";
      }

      responseRows.push({
        id: respId,
        surveyId: survey.id,
        status,
        rewardStatus,
        respondentEmail: Math.random() > 0.4 ? `respondent${totalResponses + i}@example.com` : null,
        respondentHash: id("hash"),
        country: weightedPick(gccCountries),
        device: weightedPick(devices),
        source: weightedPick(sources),
        completionSeconds,
        failedAttentionCheck: isFlagged,
        submittedAt,
        createdAt: submittedAt,
      });

      for (const q of questions) {
        // Attention-check questions should mostly reflect the flagged outcome.
        const value = generateAnswerValue(q);
        answerRows.push({ id: id("ans"), responseId: respId, questionId: q.id, value: JSON.stringify(value) });
      }
    }

    // Batch insert (SQLite is fine with a few thousand rows per createMany)
    const chunk = <T,>(arr: T[], size: number) => {
      const out: T[][] = [];
      for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
      return out;
    };
    for (const batch of chunk(responseRows, 500)) await db.surveyResponse.createMany({ data: batch });
    for (const batch of chunk(answerRows, 1000)) await db.responseAnswer.createMany({ data: batch });
    for (const batch of chunk(rewardTxBatch, 500)) await db.rewardTransaction.createMany({ data: batch });

    if (budget) {
      await db.rewardBudget.update({ where: { id: budget.id }, data: { distributedAmount: distributed } });
    }

    if (total >= 100) {
      await db.surveyEvent.create({ data: { surveyId: survey.id, type: "milestone_100", message: "Reached 100 responses", createdAt: daysAgo(Math.max(0, def.daysActive - 3)) } });
      await db.notification.create({
        data: {
          organizationId: org.id,
          type: "survey_milestone",
          title: `${def.title} reached ${total} responses`,
          titleAr: `وصل استبيان ${def.titleAr} إلى ${total} إجابة`,
          body: `Your survey "${def.title}" has reached ${total} responses.`,
          bodyAr: `وصل استبيانك "${def.titleAr}" إلى ${total} إجابة.`,
          read: Math.random() > 0.5,
          createdAt: daysAgo(Math.max(0, def.daysActive - 3)),
        },
      });
    }

    if (def.status === "closed") {
      await db.surveyEvent.create({ data: { surveyId: survey.id, type: "closed", message: "Survey closed", createdAt: daysAgo(1) } });
      await db.notification.create({
        data: {
          organizationId: org.id,
          type: "survey_completed",
          title: `${def.title} is complete`,
          titleAr: `اكتمل استبيان ${def.titleAr}`,
          body: `Your survey "${def.title}" has reached its response target.`,
          bodyAr: `وصل استبيانك "${def.titleAr}" إلى هدف الإجابات.`,
          createdAt: daysAgo(1),
        },
      });
      await db.report.create({
        data: {
          surveyId: survey.id,
          title: `${def.title} — Research Report`,
          sections: JSON.stringify([
            "sectionExecSummary",
            "sectionMethodology",
            "sectionSample",
            "sectionFindings",
            "sectionQuestions",
            "sectionCharts",
            "sectionAiInsights",
            "sectionConclusion",
          ]),
          status: "ready",
          createdAt: daysAgo(1),
        },
      });
    }

    if (budget && distributed / funded > 0.85) {
      await db.notification.create({
        data: {
          organizationId: org.id,
          type: "budget_low",
          title: `Incentive budget running low for ${def.title}`,
          titleAr: `ميزانية الحوافز منخفضة لاستبيان ${def.titleAr}`,
          body: `Less than 15% of the incentive budget remains for "${def.title}".`,
          bodyAr: `تبقّى أقل من 15% من ميزانية الحوافز لاستبيان "${def.titleAr}".`,
          createdAt: daysAgo(2),
        },
      });
    }

    await db.auditLog.create({
      data: {
        organizationId: org.id,
        userId: owner.id,
        action: def.status === "draft" ? "survey.created" : "survey.published",
        targetType: "survey",
        targetId: survey.id,
        metadata: JSON.stringify({ title: def.title }),
        createdAt: daysAgo(def.daysActive + 5),
      },
    });

    totalResponses += total;
    totalValid += def.validTarget;
    console.log(`  • ${def.title}: ${total} responses (${rewardedCount} rewarded)`);
  }

  console.log(`\nSeed complete: ${totalResponses} responses across ${surveyDefs.length} surveys (${totalValid} valid).`);
  console.log("Demo login → email: demo@survpay.com · password: Demo1234!");

  return { surveys: surveyDefs.length, totalResponses, totalValid };
}
