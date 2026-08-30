// Single source of truth for plan pricing/limits. Referenced by the pricing
// page, billing page, and (in a future pass) plan-gated feature checks.

export type PlanId = "free" | "pro" | "business";

export interface PlanDefinition {
  id: PlanId;
  nameKey: string; // resolved via translation dictionary at render time
  monthlyPrice: number; // SAR
  yearlyPrice: number; // SAR, billed annually
  surveyLimit: number | "unlimited";
  responseLimit: number | "unlimited"; // per month
  features: string[]; // translation keys, rendered as a bullet list
  highlighted?: boolean;
}

export const platformFeePct = 0.08; // service fee applied to funded incentive budgets

export const plans: PlanDefinition[] = [
  {
    id: "free",
    nameKey: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    surveyLimit: 3,
    responseLimit: 100,
    features: ["3 surveys", "100 responses / month", "Basic analytics", "Community support"],
  },
  {
    id: "pro",
    nameKey: "Pro",
    monthlyPrice: 249,
    yearlyPrice: 2390,
    surveyLimit: "unlimited",
    responseLimit: "unlimited",
    features: [
      "Unlimited surveys",
      "Advanced analytics & AI insights",
      "Respondent rewards",
      "Research reports (PDF & Excel)",
      "Custom branding",
    ],
    highlighted: true,
  },
  {
    id: "business",
    nameKey: "Business",
    monthlyPrice: 799,
    yearlyPrice: 7670,
    surveyLimit: "unlimited",
    responseLimit: "unlimited",
    features: [
      "Everything in Pro",
      "Team collaboration & roles",
      "Advanced reporting & exports",
      "Higher response limits",
      "Priority support",
      "Enterprise controls & audit logs",
    ],
  },
];

export function getPlan(id: PlanId) {
  return plans.find((p) => p.id === id) ?? plans[0];
}
