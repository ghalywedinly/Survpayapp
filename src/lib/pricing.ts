// Single source of truth for plan pricing/limits. Referenced by the pricing
// page, billing page, and (in a future pass) plan-gated feature checks.

export type PlanId = "market_research" | "customer_experience" | "business";

export interface PlanDefinition {
  id: PlanId;
  nameKey: string; // resolved via translation dictionary at render time
  monthlyPrice: number | null; // SAR; null on a custom/"contact sales" plan
  yearlyPrice: number | null; // SAR, billed annually; null on a custom/"contact sales" plan
  custom?: boolean; // true → render "Contact Sales" instead of a price
  surveyLimit: number | "unlimited";
  responseLimit: number | "unlimited"; // per month
  features: string[]; // translation keys, rendered as a bullet list
  highlighted?: boolean;
}

export const platformFeePct = 0.08; // service fee applied to funded incentive budgets

const YEARLY_DISCOUNT = 0.2; // 20% off the annual total vs. paying monthly
const yearlyFrom = (monthly: number) => Math.round(monthly * 12 * (1 - YEARLY_DISCOUNT));

export const plans: PlanDefinition[] = [
  {
    id: "market_research",
    nameKey: "Market Research and Surveys",
    monthlyPrice: 99,
    yearlyPrice: yearlyFrom(99),
    surveyLimit: "unlimited",
    responseLimit: "unlimited",
    features: [
      "Unlimited surveys",
      "All 12 question types & conditional logic",
      "Cash & gift-card respondent rewards",
      "Response analytics & AI insights",
      "Research reports (PDF & Excel)",
      "Bilingual (Arabic RTL) by default",
    ],
  },
  {
    id: "customer_experience",
    nameKey: "Customer Experience",
    monthlyPrice: 169,
    yearlyPrice: yearlyFrom(169),
    surveyLimit: "unlimited",
    responseLimit: "unlimited",
    features: [
      "Everything in Market Research and Surveys",
      "Coupon & discount-code rewards + redemption tool",
      "Team collaboration & roles",
      "Custom branding",
      "Budget tracking & automatic payout",
      "Priority support",
    ],
    highlighted: true,
  },
  {
    id: "business",
    nameKey: "Business",
    monthlyPrice: null,
    yearlyPrice: null,
    custom: true,
    surveyLimit: "unlimited",
    responseLimit: "unlimited",
    features: [
      "Everything in Customer Experience",
      "Enterprise controls & audit logs",
      "Higher & custom response volumes",
      "Dedicated account manager",
      "Custom integrations & SLAs",
      "Volume-based incentive payout rates",
    ],
  },
];

// New organizations start here — the entry-level paid plan. There is no free tier.
export const entryPlanId: PlanId = "market_research";

export function getPlan(id: PlanId) {
  return plans.find((p) => p.id === id) ?? plans[0];
}

// Human-readable plan name for a raw org.plan string — used by admin/reporting
// surfaces that display every organization's plan without going through the
// bilingual dictionary (this label is deliberately English-only there).
export function getPlanLabel(id: string): string {
  return plans.find((p) => p.id === id)?.nameKey ?? id;
}
