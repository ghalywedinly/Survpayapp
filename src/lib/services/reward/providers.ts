import type { RewardIssueRequest, RewardIssueResult, RewardProvider } from "./reward-provider";

function ref(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// Demo/mock implementations. In production these call a licensed payout
// provider; today they simulate the same async, provider-ref-bearing shape
// so the rest of the app never needs to change when a real one is wired in.

export class CashProvider implements RewardProvider {
  readonly type = "cash" as const;
  async issue(req: RewardIssueRequest): Promise<RewardIssueResult> {
    await delay();
    return {
      status: "completed",
      providerRef: ref("cash"),
      redemptionNote: "demo-cash-payout",
    };
  }
}

export class GiftCardProvider implements RewardProvider {
  readonly type = "gift_card" as const;
  async issue(req: RewardIssueRequest): Promise<RewardIssueResult> {
    await delay();
    return {
      status: "completed",
      providerRef: ref("gc"),
      redemptionNote: `DEMO-GC-${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
    };
  }
}

export class CouponProvider implements RewardProvider {
  readonly type = "coupon" as const;
  async issue(req: RewardIssueRequest): Promise<RewardIssueResult> {
    await delay();
    return {
      status: "completed",
      providerRef: ref("cp"),
      redemptionNote: `DEMO-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    };
  }
}

function delay() {
  return new Promise((resolve) => setTimeout(resolve, 150));
}

export const rewardProviders: Record<string, RewardProvider> = {
  cash: new CashProvider(),
  gift_card: new GiftCardProvider(),
  coupon: new CouponProvider(),
};
