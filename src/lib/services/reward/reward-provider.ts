// RewardProvider abstraction — fulfills the incentive owed to a respondent
// once their response is validated. Each reward type (cash, gift card,
// coupon) is a separate provider implementation so a real regional payout
// integration (e.g. mada, STC Pay, a gift-card aggregator) can be dropped in
// per type without touching RewardService or the survey completion flow.
//
//   RewardProvider
//   ├── CashProvider
//   ├── GiftCardProvider
//   └── CouponProvider

export type RewardType = "cash" | "gift_card" | "coupon";

export interface RewardIssueRequest {
  amount: number;
  currency: string;
  respondentEmail?: string | null;
}

export interface RewardIssueResult {
  status: "completed" | "processing" | "failed";
  providerRef: string;
  /** Respondent-facing redemption instructions, safe to render in the UI. */
  redemptionNote: string;
}

export interface RewardProvider {
  readonly type: RewardType;
  issue(req: RewardIssueRequest): Promise<RewardIssueResult>;
}
