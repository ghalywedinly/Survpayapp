import type { Locale } from "@/lib/i18n/config";

export interface LegalSection {
  heading: string;
  body: string;
}
export interface LegalDoc {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}

const privacyEn: LegalDoc = {
  title: "Privacy Policy",
  updated: "Last updated: January 2026",
  intro:
    "This policy describes how SurvPay collects, uses and protects data for researchers who use the platform and respondents who complete surveys distributed through it. This document is a working policy for the Phase 1 product and has not yet been reviewed by qualified legal counsel; it should not be treated as a final compliance statement, including with respect to Saudi Arabia's Personal Data Protection Law (PDPL).",
  sections: [
    {
      heading: "1. What we collect",
      body: "For researchers: account details (name, email, organization), billing and incentive-funding records, and survey content you create. For respondents: survey answers, and — only where a survey requires it — an email address to deliver a reward. We also record a non-identifying device fingerprint used solely to prevent duplicate submissions.",
    },
    {
      heading: "2. Organization-level isolation",
      body: "Every survey, response, and reward record belongs to exactly one organization. Server-side authorization checks ensure a researcher can never read or modify another organization's data, regardless of client-side state.",
    },
    {
      heading: "3. Future research consent is separate",
      body: "SurvPay never assumes that completing one survey means a respondent wants to be contacted about future studies. Where a researcher enables it, respondents are asked an explicit, standalone consent question, and that answer is stored separately from their survey responses.",
    },
    {
      heading: "4. Rewards & payment data",
      body: "Reward funding and payout are handled through a provider-agnostic payment abstraction. In this environment, all charges and payouts are processed by a mock provider for demonstration purposes — no real financial transactions occur, and no card data is collected or stored by SurvPay at any point.",
    },
    {
      heading: "5. Data retention & deletion",
      body: "Organizations can request deletion of survey and response data. The schema is designed so a deletion request can cascade cleanly across responses, answers, and reward records tied to a survey.",
    },
    {
      heading: "6. Your choices",
      body: "Researchers can export their organization's data and manage team access from Settings. Respondents who provided an email address for reward delivery can request its removal by contacting the researcher who fielded the survey.",
    },
  ],
};

const termsEn: LegalDoc = {
  title: "Terms of Service",
  updated: "Last updated: January 2026",
  intro:
    "These terms govern use of SurvPay by researcher accounts and, to the extent applicable, respondents completing surveys distributed through the platform. This is a working draft for the Phase 1 product, provided for demonstration purposes, and has not been finalized by legal counsel.",
  sections: [
    {
      heading: "1. What SurvPay is (and isn't)",
      body: "SurvPay lets you build surveys, distribute a link you control, reward the respondents who complete it, and analyze results. SurvPay does not operate a participant marketplace in this phase: you are responsible for sourcing your own respondents.",
    },
    {
      heading: "2. Your responsibilities",
      body: "You are responsible for the legality and accuracy of your survey content, for obtaining any consents your research requires beyond what SurvPay collects automatically, and for how you use respondent data you export.",
    },
    {
      heading: "3. Incentive budgets",
      body: "Funds you add to a survey's incentive budget are held against that survey and released only for responses that pass your configured validation rules. Unused funds can be refunded from the survey's budget page.",
    },
    {
      heading: "4. Subscription billing",
      body: "Your platform subscription (Free, Pro, or Business) is billed separately from any incentive budget you fund. Changing or cancelling your subscription does not affect funds already committed to a survey's incentive budget.",
    },
    {
      heading: "5. Acceptable use",
      body: "You may not use SurvPay to collect sensitive personal data without appropriate safeguards, to run surveys that discriminate unlawfully, or to attempt to access another organization's data.",
    },
    {
      heading: "6. Changes to these terms",
      body: "We may update these terms as the product evolves. Material changes will be reflected here with an updated revision date.",
    },
  ],
};

const privacyAr: LegalDoc = {
  title: "سياسة الخصوصية",
  updated: "آخر تحديث: يناير 2026",
  intro:
    "توضح هذه السياسة كيفية جمع SurvPay للبيانات واستخدامها وحمايتها للباحثين الذين يستخدمون المنصة والمشاركين الذين يكملون الاستبيانات الموزّعة عبرها. هذه الوثيقة سياسة عمل للمرحلة الأولى من المنتج ولم تتم مراجعتها بعد من قبل مستشار قانوني مختص، ولا ينبغي اعتبارها بيان امتثال نهائي، بما في ذلك فيما يتعلق بنظام حماية البيانات الشخصية السعودي (PDPL).",
  sections: [
    {
      heading: "١. ما الذي نجمعه",
      body: "للباحثين: بيانات الحساب (الاسم، البريد الإلكتروني، المؤسسة)، سجلات الفوترة وتمويل الحوافز، ومحتوى الاستبيانات التي تنشئها. للمشاركين: إجابات الاستبيان، وفقط عندما يتطلب الاستبيان ذلك، عنوان بريد إلكتروني لتسليم المكافأة. كما نسجل بصمة جهاز غير معرِّفة تُستخدم فقط لمنع الإجابات المكررة.",
    },
    {
      heading: "٢. العزل على مستوى المؤسسة",
      body: "ينتمي كل استبيان وإجابة وسجل مكافأة إلى مؤسسة واحدة فقط. تضمن ضوابط التفويض على الخادم عدم قدرة أي باحث على قراءة أو تعديل بيانات مؤسسة أخرى مطلقًا.",
    },
    {
      heading: "٣. الموافقة على الأبحاث المستقبلية منفصلة",
      body: "لا يفترض SurvPay أبدًا أن إكمال استبيان واحد يعني رغبة المشارك في التواصل معه بخصوص دراسات مستقبلية. عندما يفعّل الباحث هذا الخيار، يُطرح على المشاركين سؤال موافقة صريح ومستقل، ويُخزَّن هذا الجواب بشكل منفصل عن إجاباتهم على الاستبيان.",
    },
    {
      heading: "٤. بيانات المكافآت والدفع",
      body: "يُدار تمويل المكافآت وصرفها عبر طبقة تجريد دفع لا ترتبط بمزود معين. في هذه البيئة، تتم معالجة جميع العمليات عبر مزود تجريبي لأغراض العرض التوضيحي فقط — لا تحدث أي معاملات مالية حقيقية، ولا يجمع SurvPay أو يخزّن بيانات البطاقات في أي مرحلة.",
    },
    {
      heading: "٥. الاحتفاظ بالبيانات وحذفها",
      body: "يمكن للمؤسسات طلب حذف بيانات الاستبيانات والإجابات. صُمم المخطط بحيث يمكن أن يمتد طلب الحذف بشكل نظيف عبر الإجابات والأجوبة وسجلات المكافآت المرتبطة باستبيان معين.",
    },
    {
      heading: "٦. خياراتك",
      body: "يمكن للباحثين تصدير بيانات مؤسستهم وإدارة وصول الفريق من الإعدادات. يمكن للمشاركين الذين قدموا بريدًا إلكترونيًا لاستلام مكافأة طلب إزالته بالتواصل مع الباحث الذي أجرى الاستبيان.",
    },
  ],
};

const termsAr: LegalDoc = {
  title: "شروط الخدمة",
  updated: "آخر تحديث: يناير 2026",
  intro:
    "تحكم هذه الشروط استخدام SurvPay من قبل حسابات الباحثين، وبالقدر المطبق، المشاركين الذين يكملون الاستبيانات الموزّعة عبر المنصة. هذه مسودة عمل للمرحلة الأولى من المنتج، مقدّمة لأغراض العرض التوضيحي، ولم يتم اعتمادها نهائيًا من قبل مستشار قانوني.",
  sections: [
    {
      heading: "١. ما هو SurvPay (وما ليس عليه)",
      body: "يتيح لك SurvPay بناء الاستبيانات وتوزيع رابط تتحكم فيه ومكافأة المشاركين الذين يكملونه وتحليل النتائج. لا يشغّل SurvPay سوق مشاركين في هذه المرحلة: أنت مسؤول عن توفير المشاركين الخاصين بك.",
    },
    {
      heading: "٢. مسؤولياتك",
      body: "أنت مسؤول عن قانونية ودقة محتوى استبيانك، وعن الحصول على أي موافقات يتطلبها بحثك بخلاف ما يجمعه SurvPay تلقائيًا، وعن كيفية استخدامك لبيانات المشاركين التي تصدّرها.",
    },
    {
      heading: "٣. ميزانيات الحوافز",
      body: "تُحجز الأموال التي تضيفها لميزانية حوافز استبيان مقابل ذلك الاستبيان ولا تُصرف إلا للإجابات التي تجتاز قواعد التحقق التي حددتها. يمكن استرداد الأموال غير المستخدمة من صفحة ميزانية الاستبيان.",
    },
    {
      heading: "٤. فوترة الاشتراك",
      body: "يُفوتر اشتراكك في المنصة (مجاني أو Pro أو Business) بشكل منفصل عن أي ميزانية حوافز تموّلها. تغيير اشتراكك أو إلغاؤه لا يؤثر على الأموال الملتزم بها بالفعل لميزانية حوافز استبيان.",
    },
    {
      heading: "٥. الاستخدام المقبول",
      body: "لا يجوز استخدام SurvPay لجمع بيانات شخصية حساسة دون ضمانات مناسبة، أو لإجراء استبيانات تميّز بشكل غير قانوني، أو لمحاولة الوصول إلى بيانات مؤسسة أخرى.",
    },
    {
      heading: "٦. تغييرات على هذه الشروط",
      body: "قد نحدّث هذه الشروط مع تطور المنتج. ستنعكس التغييرات الجوهرية هنا مع تاريخ مراجعة محدّث.",
    },
  ],
};

export function getPrivacyDoc(locale: Locale) {
  return locale === "ar" ? privacyAr : privacyEn;
}
export function getTermsDoc(locale: Locale) {
  return locale === "ar" ? termsAr : termsEn;
}
