import chromium from "@sparticuz/chromium";
import puppeteer, { type Browser } from "puppeteer-core";

// Renders the Arabic PDF report from real HTML via headless Chromium, since
// pdf-lib (used for the English report) draws glyphs one at a time with no
// Arabic text shaping — letters never join and RTL order breaks. Chromium's
// own text engine handles that correctly, the same way it already renders
// Arabic on the live site. @sparticuz/chromium ships a Chromium binary sized
// for serverless functions (Vercel/Lambda) and also works for local dev.
export async function launchChromium(): Promise<Browser> {
  const executablePath = await chromium.executablePath();
  return puppeteer.launch({
    args: chromium.args,
    executablePath,
    headless: true,
  });
}
