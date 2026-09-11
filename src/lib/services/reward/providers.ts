import type { RewardIssueRequest, RewardIssueResult, RewardProvider } from "./reward-provider";

function ref(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

// Demo implementation. In production this would call a real coupon/voucher
// issuing integration; today it generates the same shape of code so the
// rest of the app never needs to change when a real one is wired in.

// Alphabet with visually-ambiguous characters (0/O, 1/I/L) removed — these
// codes get read aloud or typed in by hand at a checkout counter.
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function generateCouponCode() {
  let s = "";
  for (let i = 0; i < 8; i++) s += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  return `SP-${s.slice(0, 4)}-${s.slice(4)}`;
}

export class CouponProvider implements RewardProvider {
  readonly type = "coupon" as const;
  async issue(req: RewardIssueRequest): Promise<RewardIssueResult> {
    await delay();
    const code = generateCouponCode();
    return {
      status: "completed",
      providerRef: ref("cp"),
      redemptionNote: code,
      redemptionCode: code,
    };
  }
}

function delay() {
  return new Promise((resolve) => setTimeout(resolve, 150));
}

export const rewardProviders: Record<string, RewardProvider> = {
  coupon: new CouponProvider(),
};
