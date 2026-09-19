// Payment abstraction. A production integration (e.g. a licensed Saudi
// payment provider — Moyasar, HyperPay, PayTabs, etc.) implements this same
// interface and is swapped in via PaymentService without touching callers.
//
//   PaymentProvider -> PaymentService -> RewardService -> SurveyCompletion
//
// Never expose secret payment keys to the client; a real provider's server
// credentials would live only behind this interface.

export interface ChargeRequest {
  organizationId: string;
  amount: number;
  currency: string;
  description: string;
}

export interface ChargeResult {
  success: boolean;
  providerRef: string;
  status: "completed" | "processing" | "failed";
  failureReason?: string;
}

export interface RefundRequest {
  providerRef: string;
  amount: number;
  currency: string;
}

export interface PaymentProvider {
  readonly name: string;
  charge(req: ChargeRequest): Promise<ChargeResult>;
  refund(req: RefundRequest): Promise<ChargeResult>;
}
