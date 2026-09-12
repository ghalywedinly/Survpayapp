// RewardProvider abstraction — fulfills the incentive owed to a respondent
// once their response is validated. SurvPay only ever rewards respondents
// with a discount coupon code (never cash or a gift card) — kept as a
// provider interface rather than inlined logic so a real coupon/voucher
// aggregator integration can be dropped in without touching RewardService
// or the survey completion flow.
//
//   RewardProvider
//   └── CouponProvider

export type RewardType = "coupon";

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
  /**
   * The machine-checkable coupon code. Persisted to RewardTransaction.code,
   * which the coupon-check tool looks up and marks redeemed exactly once.
   */
  redemptionCode?: string;
}

export interface RewardProvider {
  readonly type: RewardType;
  issue(req: RewardIssueRequest): Promise<RewardIssueResult>;
}
