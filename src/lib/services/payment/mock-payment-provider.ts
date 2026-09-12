import type { ChargeRequest, ChargeResult, PaymentProvider, RefundRequest } from "./payment-provider";

// Development/demo provider. Simulates a real gateway's shape (async, has a
// provider reference, can fail) without moving real money or touching real
// card data. No secret keys are involved because there is nothing to call.
export class MockPaymentProvider implements PaymentProvider {
  readonly name = "mock";

  async charge(req: ChargeRequest): Promise<ChargeResult> {
    await simulateLatency();
    return {
      success: true,
      status: "completed",
      providerRef: `mock_ch_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    };
  }

  async refund(req: RefundRequest): Promise<ChargeResult> {
    await simulateLatency();
    return {
      success: true,
      status: "completed",
      providerRef: `mock_rf_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`,
    };
  }
}

function simulateLatency() {
  return new Promise((resolve) => setTimeout(resolve, 120));
}

export const paymentProvider: PaymentProvider = new MockPaymentProvider();
