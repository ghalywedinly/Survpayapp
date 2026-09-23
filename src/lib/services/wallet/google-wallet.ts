import crypto from "crypto";
import type { WalletPassData } from "./apple-pass";

// Builds a real "Save to Google Wallet" link: a Google-format JWT (RS256,
// signed with the business's own Wallet API service account key) that
// inline-defines the pass class and object, per Google's documented Generic
// Pass JWT flow — https://developers.google.com/wallet/generic/web.
// Like the Apple side, what's missing to actually issue a pass in
// production is the business's own Google Wallet API issuer account and
// service account credentials (see .env.example). Until configured,
// isGoogleWalletConfigured() returns false and the button never renders.
export function isGoogleWalletConfigured() {
  return Boolean(
    process.env.GOOGLE_WALLET_ISSUER_ID &&
      process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY
  );
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function signJwtRS256(payload: object) {
  const header = { alg: "RS256", typ: "JWT" };
  const signingInput = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(payload))}`;
  const signature = crypto
    .createSign("RSA-SHA256")
    .update(signingInput)
    .sign(process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_PRIVATE_KEY!.replace(/\\n/g, "\n"));
  return `${signingInput}.${base64url(signature)}`;
}

export function buildGoogleWalletSaveUrl(data: WalletPassData): string {
  if (!isGoogleWalletConfigured()) throw new Error("Google Wallet is not configured");

  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID!;
  const classSuffix = process.env.GOOGLE_WALLET_CLASS_SUFFIX || "survpay_coupon";
  const classId = `${issuerId}.${classSuffix}`;
  const objectId = `${issuerId}.${data.code}`;

  const genericClass = { id: classId };
  const genericObject = {
    id: objectId,
    classId,
    genericType: "GENERIC_TYPE_UNSPECIFIED",
    cardTitle: { defaultValue: { language: "en", value: data.organizationName } },
    header: { defaultValue: { language: "en", value: `${data.discountPercent}% discount coupon` } },
    subheader: { defaultValue: { language: "en", value: data.surveyTitle } },
    textModulesData: [
      ...(data.branchName ? [{ header: "BRANCH", body: data.branchName, id: "branch" }] : []),
      { header: "HOW TO REDEEM", body: data.redemptionNote, id: "redeem" },
    ],
    barcode: { type: "QR_CODE", value: data.code, alternateText: data.code },
    hexBackgroundColor: "#ffffff",
  };

  const jwt = signJwtRS256({
    iss: process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL,
    aud: "google",
    typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000),
    payload: { genericClasses: [genericClass], genericObjects: [genericObject] },
  });

  return `https://pay.google.com/gp/v/save/${jwt}`;
}
