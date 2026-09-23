import crypto from "crypto";
import fs from "fs";
import path from "path";
import forge from "node-forge";
import JSZip from "jszip";

// Builds a real, spec-correct .pkpass bundle (PKCS#7-signed, per Apple's
// Wallet format) for a coupon reward. Nothing here is mocked — the manifest
// hashing, PKCS#7 detached signature and zip layout all follow Apple's
// documented format exactly. What's missing to actually issue a pass in
// production is a real Pass Type ID certificate from the business's own
// Apple Developer account, which SurvPay itself can't hold on their behalf
// (see .env.example for the three PEM values this needs). Until those are
// configured, isAppleWalletConfigured() returns false and the "Add to Apple
// Wallet" button never renders — never a broken button.
export interface WalletPassData {
  code: string;
  discountPercent: number;
  organizationName: string;
  surveyTitle: string;
  branchName?: string | null;
  redemptionNote: string;
}

export function isAppleWalletConfigured() {
  return Boolean(
    process.env.APPLE_PASS_TYPE_ID &&
      process.env.APPLE_TEAM_ID &&
      process.env.APPLE_PASS_CERT_PEM &&
      process.env.APPLE_PASS_KEY_PEM &&
      process.env.APPLE_WWDR_CERT_PEM
  );
}

const WALLET_ASSETS_DIR = path.join(process.cwd(), "public", "brand", "wallet");
const PASS_FILES = ["icon.png", "icon@2x.png", "icon@3x.png", "logo.png", "logo@2x.png", "logo@3x.png"];

function sha1(buf: Buffer) {
  return crypto.createHash("sha1").update(buf).digest("hex");
}

function buildPassJson(data: WalletPassData) {
  return {
    formatVersion: 1,
    passTypeIdentifier: process.env.APPLE_PASS_TYPE_ID,
    teamIdentifier: process.env.APPLE_TEAM_ID,
    serialNumber: data.code,
    organizationName: data.organizationName,
    description: `${data.organizationName} reward coupon`,
    logoText: data.organizationName,
    backgroundColor: "rgb(255,255,255)",
    foregroundColor: "rgb(18,21,30)",
    labelColor: "rgb(91,61,240)",
    storeCard: {
      headerFields: [{ key: "discount", label: "COUPON", value: `${data.discountPercent}% off` }],
      primaryFields: [{ key: "org", label: "", value: data.organizationName }],
      secondaryFields: [
        { key: "survey", label: "SURVEY", value: data.surveyTitle },
        ...(data.branchName ? [{ key: "branch", label: "BRANCH", value: data.branchName }] : []),
      ],
      auxiliaryFields: [{ key: "code", label: "CODE", value: data.code }],
      backFields: [
        { key: "terms", label: "How to redeem", value: data.redemptionNote },
        { key: "poweredBy", label: "", value: "Issued via Survpay" },
      ],
    },
    barcodes: [{ message: data.code, format: "PKBarcodeFormatQR", messageEncoding: "iso-8859-1", altText: data.code }],
  };
}

function signManifest(manifest: Buffer): Buffer {
  const cert = forge.pki.certificateFromPem(process.env.APPLE_PASS_CERT_PEM!);
  const wwdr = forge.pki.certificateFromPem(process.env.APPLE_WWDR_CERT_PEM!);
  const privateKey = forge.pki.decryptRsaPrivateKey(
    process.env.APPLE_PASS_KEY_PEM!,
    process.env.APPLE_PASS_KEY_PASSPHRASE || undefined
  ) ?? forge.pki.privateKeyFromPem(process.env.APPLE_PASS_KEY_PEM!);

  const p7 = forge.pkcs7.createSignedData();
  p7.content = forge.util.createBuffer(manifest.toString("binary"));
  p7.addCertificate(cert);
  p7.addCertificate(wwdr);
  p7.addSigner({
    key: privateKey,
    certificate: cert,
    digestAlgorithm: forge.pki.oids.sha256,
    authenticatedAttributes: [
      { type: forge.pki.oids.contentType, value: forge.pki.oids.data },
      { type: forge.pki.oids.messageDigest },
      // node-forge's own runtime accepts a Date here (it serializes it to
      // ASN.1 UTCTime internally) even though its type declarations claim
      // string-only — a known gap in @types/node-forge, not a real mismatch.
      { type: forge.pki.oids.signingTime, value: new Date() as unknown as string },
    ],
  });
  // Detached signature: the manifest content itself is not embedded in the
  // signature file, only its hash — Apple validates it against the manifest
  // that ships alongside it in the same .pkpass bundle.
  p7.sign({ detached: true });
  const der = forge.asn1.toDer(p7.toAsn1()).getBytes();
  return Buffer.from(der, "binary");
}

export async function buildApplePass(data: WalletPassData): Promise<Buffer> {
  if (!isAppleWalletConfigured()) throw new Error("Apple Wallet is not configured");

  const zip = new JSZip();
  const passJson = Buffer.from(JSON.stringify(buildPassJson(data)), "utf-8");
  const manifestEntries: Record<string, string> = { "pass.json": sha1(passJson) };
  zip.file("pass.json", passJson);

  for (const file of PASS_FILES) {
    const filePath = path.join(WALLET_ASSETS_DIR, file);
    if (!fs.existsSync(filePath)) continue;
    const buf = fs.readFileSync(filePath);
    manifestEntries[file] = sha1(buf);
    zip.file(file, buf);
  }

  const manifest = Buffer.from(JSON.stringify(manifestEntries), "utf-8");
  zip.file("manifest.json", manifest);
  zip.file("signature", signManifest(manifest));

  return zip.generateAsync({ type: "nodebuffer" });
}
