import { getDictionary } from "@/lib/i18n/get-dictionary";
import { formatDuration } from "@/lib/format";
import { categoricalPalette } from "@/components/charts/theme";
import { launchChromium } from "./chromium";
import { SURVPAY_ICON_PNG_BASE64 } from "./report-assets";
import {
  TAJAWAL_ARABIC_400_WOFF2_BASE64,
  TAJAWAL_ARABIC_700_WOFF2_BASE64,
  TAJAWAL_LATIN_400_WOFF2_BASE64,
  TAJAWAL_LATIN_700_WOFF2_BASE64,
} from "./report-fonts";
import type { ReportData } from "./report-export";
import { surveyStatusLabel } from "@/components/dashboard/survey-status-badge";

const COLOR = {
  brand: "#5b3df0",
  brandTint: "#f1f0ff",
  mint: "#1cb473",
  amber: "#f2a70d",
  sky: "#0ea5e9",
  ink900: "#12151e",
  ink700: "#3b4356",
  ink500: "#717c8f",
  ink400: "#9aa3b2",
  ink200: "#dde1e8",
  ink100: "#eef0f4",
  surfaceAlt: "#f7f8fa",
};

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function barChartHtml(rows: { label: string; pct: number; count: number }[], noDataLabel: string, colors: string[]) {
  if (!rows.length) return `<p class="muted small">${esc(noDataLabel)}</p>`;
  return rows
    .map((r, i) => {
      const color = colors[i % colors.length];
      return `
      <div class="bar-row">
        <div class="bar-row-top">
          <span class="bar-label">${esc(r.label)}</span>
          <span class="bar-value">${r.pct}% (${r.count})</span>
        </div>
        <div class="bar-track"><div class="bar-fill" style="width:${Math.max(r.pct, r.pct > 0 ? 2 : 0)}%;background:${color}"></div></div>
      </div>`;
    })
    .join("");
}

function quotesHtml(samples: string[], noDataLabel: string) {
  if (!samples.length) return `<p class="muted small">${esc(noDataLabel)}</p>`;
  return samples
    .slice(0, 5)
    .map((s) => `<div class="quote">"${esc(s)}"</div>`)
    .join("");
}

export async function buildReportPdfArabic(data: ReportData): Promise<Uint8Array> {
  const { survey, overview, breakdown, insights } = data;
  const locale = "ar" as const;
  const dict = getDictionary(locale);
  const t = dict.reportExport;
  const chartColors = categoricalPalette;

  const title = survey.titleAr ?? survey.title;
  const statusText = surveyStatusLabel(survey.status, locale);
  const validCount = Math.round((overview.totalResponses * overview.completionRate) / 100);
  const excludedCount = Math.max(overview.totalResponses - validCount, 0);
  const validPct = overview.totalResponses ? (validCount / overview.totalResponses) * 100 : 0;
  const generatedDate = new Intl.DateTimeFormat("ar-SA-u-ca-gregory-nu-latn", { year: "numeric", month: "short", day: "numeric" }).format(new Date());

  const kpis = [
    { label: t.kpiTotalResponses, value: String(overview.totalResponses), accent: COLOR.brand },
    { label: t.kpiCompletionRate, value: `${overview.completionRate.toFixed(1)}%`, accent: COLOR.mint },
    { label: t.kpiAvgTime, value: formatDuration(overview.avgCompletionSeconds, locale), accent: COLOR.amber },
    { label: t.kpiCouponsIssued, value: String(overview.couponsIssued), accent: COLOR.sky },
  ];

  const execSummary = `يلخص هذا التقرير ${overview.totalResponses} إجابة تم جمعها لاستبيان "${esc(title)}"، بمعدل إكمال بلغ ${overview.completionRate.toFixed(1)}% ومتوسط وقت إكمال ${formatDuration(overview.avgCompletionSeconds, locale)}.`;

  const findingsHtml =
    insights?.hasData && insights.insights.length
      ? insights.insights
          .map(
            (item) => `
        <div class="insight-card">
          <p class="insight-title">${esc(item.titleAr || item.title)}</p>
          <p class="insight-body">${esc(item.bodyAr || item.body)}</p>
        </div>`
          )
          .join("")
      : `<p class="muted small">${esc(t.noAiFindings)}</p>`;

  const questionsHtml = breakdown
    .map((q, i) => {
      const qText = q.question.textAr ?? q.question.text;
      let body = "";
      if (q.kind === "categorical") {
        const rows = q.distribution.map((d) => ({ label: d.labelAr ?? d.label, pct: d.pct, count: d.count }));
        body = barChartHtml(rows, t.noResponsesYet, chartColors);
      } else if (q.kind === "numeric") {
        const rows = q.distribution.map((d) => ({ label: d.labelAr ?? d.label, pct: d.pct, count: d.count }));
        body = `<p class="q-average">${esc(t.average)}: ${q.average}</p>` + barChartHtml(rows, t.noResponsesYet, chartColors);
      } else {
        body = quotesHtml(q.samples, t.noTextResponsesYet);
      }
      return `
      <div class="question-block">
        <div class="question-head">
          <span class="q-num">س${i + 1}</span>
          <span class="q-text">${esc(qText)}</span>
        </div>
        <p class="q-count">${q.responseCount} ${esc(t.responsesSuffix)}</p>
        ${body}
      </div>`;
    })
    .join("");

  const html = `<!doctype html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8" />
<style>
  @font-face { font-family: 'Tajawal'; font-weight: 400; src: url(data:font/woff2;base64,${TAJAWAL_ARABIC_400_WOFF2_BASE64}) format('woff2'); unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF; }
  @font-face { font-family: 'Tajawal'; font-weight: 700; src: url(data:font/woff2;base64,${TAJAWAL_ARABIC_700_WOFF2_BASE64}) format('woff2'); unicode-range: U+0600-06FF, U+0750-077F, U+08A0-08FF, U+FB50-FDFF, U+FE70-FEFF; }
  @font-face { font-family: 'Tajawal'; font-weight: 400; src: url(data:font/woff2;base64,${TAJAWAL_LATIN_400_WOFF2_BASE64}) format('woff2'); unicode-range: U+0000-00FF; }
  @font-face { font-family: 'Tajawal'; font-weight: 700; src: url(data:font/woff2;base64,${TAJAWAL_LATIN_700_WOFF2_BASE64}) format('woff2'); unicode-range: U+0000-00FF; }

  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: 'Tajawal', sans-serif;
    color: ${COLOR.ink700};
    font-size: 10.5px;
    line-height: 1.6;
    padding: 6mm 12mm 12mm;
    position: relative;
  }
  .watermark {
    position: fixed;
    top: 45%;
    left: 50%;
    width: 260px;
    transform: translate(-50%, -50%) rotate(25deg);
    opacity: 0.05;
    z-index: -1;
  }
  h1, h2, h3, p { margin: 0; }
  .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .brand { display: flex; align-items: center; gap: 8px; }
  .brand img { height: 20px; }
  .brand-name { font-size: 18px; font-weight: 700; color: ${COLOR.brand}; }
  .generated { font-size: 9px; color: ${COLOR.ink400}; }
  .survey-title { font-size: 18px; font-weight: 700; color: ${COLOR.ink900}; margin-top: 10px; }
  .survey-sub { font-size: 9.5px; color: ${COLOR.ink500}; margin-top: 4px; }

  .kpi-row { display: flex; gap: 10px; margin-top: 16px; }
  .kpi-card { flex: 1; background: ${COLOR.surfaceAlt}; border: 1px solid ${COLOR.ink100}; border-radius: 4px; padding: 10px 12px; position: relative; overflow: hidden; }
  .kpi-card::before { content: ""; position: absolute; top: 0; bottom: 0; inset-inline-start: 0; width: 3px; }
  .kpi-value { font-size: 14px; font-weight: 700; color: ${COLOR.ink900}; }
  .kpi-label { font-size: 8px; color: ${COLOR.ink500}; margin-top: 3px; text-transform: uppercase; }

  .section { margin-top: 20px; }
  .section-title { font-size: 13px; font-weight: 700; color: ${COLOR.ink900}; padding-bottom: 8px; border-bottom: 1px solid ${COLOR.ink100}; margin-bottom: 12px; }
  .muted { color: ${COLOR.ink500}; }
  .small { font-size: 9px; }

  .quality-bar { display: flex; height: 14px; border-radius: 3px; overflow: hidden; }
  .quality-legend { display: flex; gap: 16px; margin-top: 8px; }
  .legend-item { display: flex; align-items: center; gap: 6px; font-size: 9px; color: ${COLOR.ink700}; }
  .legend-dot { width: 8px; height: 8px; border-radius: 2px; }
  .quality-explain { margin-top: 10px; font-size: 9px; color: ${COLOR.ink500}; }

  .insight-card { background: ${COLOR.brandTint}; border-inline-start: 3px solid ${COLOR.brand}; border-radius: 3px; padding: 10px 12px; margin-bottom: 8px; }
  .insight-title { font-size: 10.5px; font-weight: 700; color: ${COLOR.ink900}; }
  .insight-body { font-size: 9.5px; color: ${COLOR.ink700}; margin-top: 4px; }

  .question-block { margin-bottom: 16px; page-break-inside: avoid; }
  .question-head { display: flex; align-items: baseline; gap: 8px; }
  .q-num { font-size: 11.5px; font-weight: 700; color: ${COLOR.brand}; }
  .q-text { font-size: 11.5px; font-weight: 700; color: ${COLOR.ink900}; }
  .q-count { font-size: 8.5px; color: ${COLOR.ink400}; margin-top: 3px; }
  .q-average { font-size: 10px; font-weight: 700; color: ${COLOR.ink700}; margin: 6px 0; }

  .bar-row { margin-top: 8px; }
  .bar-row-top { display: flex; justify-content: space-between; font-size: 9px; }
  .bar-label { color: ${COLOR.ink700}; }
  .bar-value { color: ${COLOR.ink500}; }
  .bar-track { height: 6px; background: ${COLOR.ink100}; border-radius: 3px; margin-top: 3px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 3px; }

  .quote { border-inline-start: 2.5px solid ${COLOR.ink200}; padding: 4px 10px; margin-top: 6px; font-size: 9.5px; color: ${COLOR.ink700}; }

  .footer { position: fixed; bottom: 6mm; inset-inline-start: 12mm; inset-inline-end: 12mm; display: flex; justify-content: space-between; font-size: 8px; color: ${COLOR.ink400}; }
</style>
</head>
<body>
  <img class="watermark" src="data:image/png;base64,${SURVPAY_ICON_PNG_BASE64}" />

  <div class="header">
    <div class="brand">
      <img src="data:image/png;base64,${SURVPAY_ICON_PNG_BASE64}" />
      <span class="brand-name">Survpay</span>
    </div>
    <span class="generated">${t.generated} ${generatedDate}</span>
  </div>
  <p class="survey-title">${esc(title)}</p>
  <p class="survey-sub">${esc(t.researchReport)} · ${esc(statusText)} · ${overview.totalResponses} ${esc(t.responsesCollectedSuffix)}</p>

  <div class="kpi-row">
    ${kpis
      .map(
        (k) => `
      <div class="kpi-card" style="--accent:${k.accent}">
        <div class="kpi-value">${esc(k.value)}</div>
        <div class="kpi-label">${esc(k.label)}</div>
      </div>`
      )
      .join("")}
  </div>

  <div class="section">
    <p class="section-title">${esc(t.responseQuality)}</p>
    <div class="quality-bar">
      <div style="width:${validPct}%;background:${COLOR.mint}"></div>
      <div style="width:${100 - validPct}%;background:${COLOR.ink200}"></div>
    </div>
    <div class="quality-legend">
      <span class="legend-item"><span class="legend-dot" style="background:${COLOR.mint}"></span>${esc(t.valid)} (${validCount})</span>
      <span class="legend-item"><span class="legend-dot" style="background:${COLOR.ink200}"></span>${esc(t.excluded)} (${excludedCount})</span>
    </div>
    <p class="quality-explain">${esc(t.excludedExplanation)}</p>
  </div>

  <div class="section">
    <p class="section-title">${esc(t.executiveSummary)}</p>
    <p>${execSummary}</p>
  </div>

  <div class="section">
    <p class="section-title">${esc(t.methodology)}</p>
    <p>${esc(survey.objective ?? t.defaultMethodology)}</p>
  </div>

  <div class="section">
    <p class="section-title">${esc(t.keyFindings)}</p>
    ${findingsHtml}
  </div>

  <div class="section">
    <p class="section-title">${esc(t.questionResults)}</p>
    ${questionsHtml}
  </div>

  <div class="section">
    <p class="section-title">${esc(t.conclusion)}</p>
    <p>${esc(t.conclusionText)}</p>
  </div>
</body>
</html>`;

  const browser = await launchChromium();
  try {
    const page = await browser.newPage();
    // Every asset (font, watermark icon) is an inline data: URI, so there's
    // no network activity to wait out — "load" is enough.
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({
      format: "a4",
      printBackground: true,
      margin: { top: "6mm", bottom: "14mm", left: "0", right: "0" },
      displayHeaderFooter: true,
      headerTemplate: `<div></div>`,
      footerTemplate: `
        <div style="width:100%;font-size:8px;color:#9aa3b2;font-family:Arial,sans-serif;padding:0 12mm;display:flex;justify-content:space-between;direction:rtl;">
          <span>${esc(t.confidentialFooter)}</span>
          <span>${esc(t.page)} <span class="pageNumber"></span> ${esc(t.of)} <span class="totalPages"></span></span>
        </div>`,
    });
    return pdf;
  } finally {
    await browser.close();
  }
}
