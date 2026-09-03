import { PDFDocument, StandardFonts, rgb, degrees, type PDFFont, type PDFImage, type PDFPage } from "pdf-lib";
import ExcelJS from "exceljs";
import { db } from "@/lib/db";
import { AnalyticsService } from "./analytics-service";
import { AIService } from "./ai-service";
import { SURVPAY_ICON_PNG_BASE64 } from "./report-assets";
import { categoricalPalette } from "@/components/charts/theme";
import { formatCurrency, formatDuration } from "@/lib/format";

async function loadReportData(surveyId: string) {
  const survey = await db.survey.findUnique({ where: { id: surveyId } });
  if (!survey) throw new Error("Survey not found");
  const [overview, breakdown, insights] = await Promise.all([
    AnalyticsService.getSurveyOverview(surveyId),
    AnalyticsService.getQuestionBreakdown(surveyId),
    AIService.latest(surveyId),
  ]);
  return { survey, overview, breakdown, insights };
}

export type ReportData = Awaited<ReturnType<typeof loadReportData>>;

function hex(h: string) {
  const n = parseInt(h.replace("#", ""), 16);
  return rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
}

const palette = {
  ink900: hex("#12151e"),
  ink700: hex("#3b4356"),
  ink600: hex("#525c70"),
  ink500: hex("#717c8f"),
  ink400: hex("#9aa3b2"),
  ink200: hex("#dde1e8"),
  ink100: hex("#eef0f4"),
  surfaceAlt: hex("#f7f8fa"),
  white: rgb(1, 1, 1),
  brand: hex("#5b3df0"),
  brandTint: hex("#f1f0ff"),
  mint: hex("#1cb473"),
  amber: hex("#f2a70d"),
  sky: hex("#0ea5e9"),
};

// Same hues the live in-app charts use (src/components/charts/theme.ts), so
// a bar in this PDF and a bar on the dashboard mean the same color.
const chartPalette = categoricalPalette.map(hex);

export async function buildReportPdf(surveyId: string): Promise<Uint8Array> {
  return buildReportPdfFromData(await loadReportData(surveyId));
}

export async function buildReportPdfFromData(data: ReportData): Promise<Uint8Array> {
  const { survey, overview, breakdown, insights } = data;

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const icon = await doc.embedPng(Buffer.from(SURVPAY_ICON_PNG_BASE64, "base64"));
  const margin = 50;
  const pageWidth = 595;
  const pageHeight = 842;
  const contentWidth = pageWidth - margin * 2;

  // Faint, centered, rotated icon on every page — proves the report came
  // from SurvPay even once printed or screenshotted out of context.
  function drawWatermark(target: PDFPage) {
    const wmHeight = 340;
    const wmWidth = wmHeight * (icon.width / icon.height);
    target.drawImage(icon, {
      x: pageWidth / 2 - wmWidth / 2,
      y: pageHeight / 2 - wmHeight / 2,
      width: wmWidth,
      height: wmHeight,
      opacity: 0.06,
      rotate: degrees(-25),
    });
  }

  function newPage() {
    const p = doc.addPage([pageWidth, pageHeight]);
    drawWatermark(p);
    return p;
  }

  let page = newPage();
  let y = pageHeight - margin;

  function ensureSpace(neededHeight: number) {
    if (y - neededHeight < margin + 16) {
      page = newPage();
      y = pageHeight - margin;
    }
  }

  function wrapText(text: string, size: number, fontRef: PDFFont, maxWidth: number): string[] {
    const lines: string[] = [];
    let line = "";
    for (const word of text.split(" ")) {
      const test = line ? `${line} ${word}` : word;
      if (fontRef.widthOfTextAtSize(test, size) > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function truncate(text: string, size: number, fontRef: PDFFont, maxWidth: number) {
    if (fontRef.widthOfTextAtSize(text, size) <= maxWidth) return text;
    let t = text;
    while (t.length > 1 && fontRef.widthOfTextAtSize(`${t}…`, size) > maxWidth) t = t.slice(0, -1);
    return `${t}…`;
  }

  function paragraph(text: string, opts: { size?: number; color?: ReturnType<typeof rgb>; fontRef?: PDFFont; gap?: number } = {}) {
    const { size = 10.5, color = palette.ink700, fontRef = font, gap = 6 } = opts;
    const lines = wrapText(text, size, fontRef, contentWidth);
    for (const line of lines) {
      ensureSpace(size + gap);
      page.drawText(line, { x: margin, y, size, font: fontRef, color });
      y -= size + gap;
    }
  }

  function sectionHeading(text: string) {
    ensureSpace(34);
    y -= 10;
    page.drawText(text, { x: margin, y, size: 14.5, font: bold, color: palette.ink900 });
    y -= 9;
    page.drawLine({ start: { x: margin, y }, end: { x: margin + contentWidth, y }, thickness: 1, color: palette.ink100 });
    y -= 16;
  }

  // ---------- KPI stat cards ----------
  function drawKpiRow(items: { label: string; value: string; accent: ReturnType<typeof rgb> }[]) {
    const gap = 12;
    const cardH = 58;
    const cardW = (contentWidth - gap * (items.length - 1)) / items.length;
    ensureSpace(cardH + 16);
    const top = y;
    items.forEach((item, i) => {
      const x = margin + i * (cardW + gap);
      page.drawRectangle({ x, y: top - cardH, width: cardW, height: cardH, color: palette.surfaceAlt, borderColor: palette.ink100, borderWidth: 1 });
      page.drawRectangle({ x, y: top - cardH, width: 3.5, height: cardH, color: item.accent });
      page.drawText(truncate(item.value, 16, bold, cardW - 20), { x: x + 14, y: top - 24, size: 16, font: bold, color: palette.ink900 });
      page.drawText(item.label.toUpperCase(), { x: x + 14, y: top - 41, size: 7.5, font, color: palette.ink500 });
    });
    y = top - cardH - 20;
  }

  // ---------- stacked proportion bar (response quality) ----------
  function drawStackedBar(segments: { label: string; value: number; color: ReturnType<typeof rgb> }[]) {
    const barH = 16;
    ensureSpace(barH + 26);
    const total = segments.reduce((s, x) => s + x.value, 0) || 1;
    let x = margin;
    for (const seg of segments) {
      const w = (contentWidth * seg.value) / total;
      if (w > 0) page.drawRectangle({ x, y: y - barH, width: w, height: barH, color: seg.color });
      x += w;
    }
    y -= barH + 10;
    let lx = margin;
    for (const seg of segments) {
      page.drawRectangle({ x: lx, y: y - 8, width: 8, height: 8, color: seg.color });
      const label = `${seg.label} (${seg.value})`;
      page.drawText(label, { x: lx + 12, y: y - 7, size: 9, font, color: palette.ink600 });
      lx += font.widthOfTextAtSize(label, 9) + 28;
    }
    y -= 22;
  }

  // ---------- horizontal bar chart (question distributions) ----------
  function drawBarChart(rows: { label: string; count: number; pct: number }[]) {
    if (!rows.length) {
      paragraph("No responses yet.", { size: 9.5, color: palette.ink400 });
      return;
    }
    const rowGap = 15;
    ensureSpace(rows.length * rowGap + 6);
    const labelMaxWidth = contentWidth * 0.55;
    rows.forEach((r, i) => {
      const color = chartPalette[i % chartPalette.length];
      const valText = `${r.pct}% (${r.count})`;
      page.drawText(truncate(r.label, 9, font, labelMaxWidth), { x: margin, y, size: 9, font, color: palette.ink700 });
      page.drawText(valText, { x: margin + contentWidth - font.widthOfTextAtSize(valText, 9), y, size: 9, font, color: palette.ink500 });
      y -= 11;
      const trackH = 6;
      page.drawRectangle({ x: margin, y: y - trackH, width: contentWidth, height: trackH, color: palette.ink100 });
      const fillW = Math.max((contentWidth * r.pct) / 100, r.pct > 0 ? 3 : 0);
      page.drawRectangle({ x: margin, y: y - trackH, width: fillW, height: trackH, color });
      y -= trackH + 8;
    });
  }

  function drawQuotes(samples: string[]) {
    if (!samples.length) {
      paragraph("No text responses yet.", { size: 9.5, color: palette.ink400 });
      return;
    }
    for (const s of samples.slice(0, 5)) {
      const lines = wrapText(`"${s}"`, 9.5, font, contentWidth - 16);
      const h = lines.length * 13;
      ensureSpace(h + 8);
      page.drawRectangle({ x: margin, y: y - h + 3, width: 2.5, height: h, color: palette.ink200 });
      let qy = y - 9;
      for (const line of lines) {
        page.drawText(line, { x: margin + 12, y: qy, size: 9.5, font, color: palette.ink600 });
        qy -= 13;
      }
      y -= h + 8;
    }
  }

  function drawInsightCard(title: string, body: string) {
    const pad = 12;
    const bodyLines = wrapText(body, 9.5, font, contentWidth - pad * 2 - 4);
    const h = 20 + bodyLines.length * 13 + pad;
    ensureSpace(h + 10);
    page.drawRectangle({ x: margin, y: y - h, width: contentWidth, height: h, color: palette.brandTint });
    page.drawRectangle({ x: margin, y: y - h, width: 3, height: h, color: palette.brand });
    page.drawText(title, { x: margin + pad + 3, y: y - pad - 8, size: 10.5, font: bold, color: palette.ink900 });
    let ly = y - pad - 8 - 15;
    for (const line of bodyLines) {
      page.drawText(line, { x: margin + pad + 3, y: ly, size: 9.5, font, color: palette.ink700 });
      ly -= 13;
    }
    y -= h + 10;
  }

  // ================= Header =================
  const headerIconHeight = 20;
  const headerIconWidth = headerIconHeight * (icon.width / icon.height);
  page.drawImage(icon, { x: margin, y: y - 3, width: headerIconWidth, height: headerIconHeight });
  page.drawText("Survpay", { x: margin + headerIconWidth + 8, y, size: 20, font: bold, color: palette.brand });
  const genLabel = `Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}`;
  page.drawText(genLabel, { x: margin + contentWidth - font.widthOfTextAtSize(genLabel, 9.5), y: y + 2, size: 9.5, font, color: palette.ink400 });
  y -= 34;
  page.drawText(survey.title, { x: margin, y, size: 20, font: bold, color: palette.ink900 });
  y -= 18;
  paragraph(`Research report · ${survey.status} · ${overview.totalResponses} responses collected`, { size: 10, color: palette.ink500 });
  y -= 6;

  // ================= KPI row =================
  drawKpiRow([
    { label: "Total responses", value: String(overview.totalResponses), accent: palette.brand },
    { label: "Completion rate", value: `${overview.completionRate.toFixed(1)}%`, accent: palette.mint },
    { label: "Avg. time to complete", value: formatDuration(overview.avgCompletionSeconds, "en"), accent: palette.amber },
    { label: "Reward spend", value: formatCurrency(overview.rewardSpend, "en"), accent: palette.sky },
  ]);

  // ================= Response quality =================
  sectionHeading("Response quality");
  const validCount = Math.round((overview.totalResponses * overview.completionRate) / 100);
  drawStackedBar([
    { label: "Valid", value: validCount, color: palette.mint },
    { label: "Excluded", value: Math.max(overview.totalResponses - validCount, 0), color: palette.ink200 },
  ]);
  paragraph(
    "Excluded responses failed an attention check, were flagged as duplicates, or were submitted faster than the completion-time threshold — they were never eligible for a reward and are excluded from question-level analysis below.",
    { size: 9, color: palette.ink500 }
  );

  // ================= Summary =================
  sectionHeading("Executive summary");
  paragraph(
    `This report summarizes ${overview.totalResponses} responses collected for "${survey.title}", with a completion rate of ${overview.completionRate.toFixed(1)}% and an average completion time of ${formatDuration(overview.avgCompletionSeconds, "en")}.`
  );

  sectionHeading("Methodology");
  paragraph(
    survey.objective ??
      "Respondents were recruited by the research team and completed the survey via a shared Survpay link. Response quality controls (duplicate prevention, attention checks, and completion-time analysis) were applied automatically."
  );

  // ================= Key findings =================
  sectionHeading("Key findings");
  if (insights?.hasData) {
    for (const item of insights.insights) drawInsightCard(item.title, item.body);
  } else {
    paragraph("Not enough response data was available to generate AI-assisted findings at the time this report was created.", {
      size: 9.5,
      color: palette.ink400,
    });
  }

  // ================= Question results =================
  sectionHeading("Question results");
  breakdown.forEach((q, i) => {
    ensureSpace(46);
    const qLabel = `Q${i + 1}`;
    const qLabelWidth = bold.widthOfTextAtSize(`${qLabel}  `, 11.5);
    page.drawText(qLabel, { x: margin, y, size: 11.5, font: bold, color: palette.brand });
    const titleLines = wrapText(q.question.text, 11.5, bold, contentWidth - qLabelWidth);
    page.drawText(titleLines[0] ?? "", { x: margin + qLabelWidth, y, size: 11.5, font: bold, color: palette.ink900 });
    y -= 15;
    for (const extra of titleLines.slice(1)) {
      ensureSpace(15);
      page.drawText(extra, { x: margin, y, size: 11.5, font: bold, color: palette.ink900 });
      y -= 15;
    }
    paragraph(`${q.responseCount} responses`, { size: 8.5, color: palette.ink400, gap: 4 });
    y -= 4;

    if (q.kind === "categorical") {
      drawBarChart(q.distribution);
    } else if (q.kind === "numeric") {
      paragraph(`Average: ${q.average}`, { size: 10, color: palette.ink700, fontRef: bold, gap: 8 });
      drawBarChart(q.distribution);
    } else {
      drawQuotes(q.samples);
    }
    y -= 14;
  });

  // ================= Conclusion =================
  sectionHeading("Conclusion");
  paragraph(
    "This report was generated automatically by Survpay from live response data. Demo/AI-assisted insights are labeled as such and should be validated by the research team before external use."
  );

  // ================= Footer on every page =================
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    const tag = "Survpay · Confidential";
    p.drawText(tag, { x: margin, y: 24, size: 8, font, color: palette.ink400 });
    const pn = `Page ${i + 1} of ${pages.length}`;
    p.drawText(pn, { x: pageWidth - margin - font.widthOfTextAtSize(pn, 8), y: 24, size: 8, font, color: palette.ink400 });
  });

  return doc.save();
}

export async function buildReportExcel(surveyId: string): Promise<Buffer> {
  return buildReportExcelFromData(await loadReportData(surveyId));
}

export async function buildReportExcelFromData(data: ReportData): Promise<Buffer> {
  const { survey, overview, breakdown, insights } = data;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Survpay";
  wb.created = new Date();

  const BRAND = "FF5B3DF0";
  const BRAND_TINT = "FFF1F0FF";
  const INK900 = "FF12151E";
  const INK500 = "FF717C8F";
  const SURFACE_ALT = "FFF7F8FA";
  const BORDER = "FFDDE1E8";
  const thinBorder = { style: "thin" as const, color: { argb: BORDER } };

  // ---------------- Summary sheet ----------------
  const summary = wb.addWorksheet("Summary", { views: [{ showGridLines: false }] });
  summary.columns = [{ width: 30 }, { width: 26 }];

  summary.mergeCells("A1:B1");
  const titleCell = summary.getCell("A1");
  titleCell.value = `Survpay Report — ${survey.title}`;
  titleCell.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };
  titleCell.alignment = { vertical: "middle", indent: 1 };
  summary.getRow(1).height = 30;

  summary.mergeCells("A2:B2");
  const subCell = summary.getCell("A2");
  subCell.value = `Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })} · Status: ${survey.status}`;
  subCell.font = { italic: true, size: 9.5, color: { argb: INK500 } };
  subCell.alignment = { indent: 1 };

  const validCount = Math.round((overview.totalResponses * overview.completionRate) / 100);
  const statRows: { label: string; value: number | string; numFmt?: string }[] = [
    { label: "Total responses", value: overview.totalResponses },
    { label: "Valid responses", value: validCount },
    { label: "Excluded responses", value: Math.max(overview.totalResponses - validCount, 0) },
    { label: "Completion rate", value: overview.completionRate / 100, numFmt: "0.0%" },
    { label: "Avg. completion time", value: formatDuration(overview.avgCompletionSeconds, "en") },
    { label: "Reward spend (SAR)", value: overview.rewardSpend, numFmt: '"SAR" #,##0.00' },
    { label: "Cost per response (SAR)", value: Number(overview.costPerResponse.toFixed(2)), numFmt: '"SAR" #,##0.00' },
  ];

  let r = 4;
  statRows.forEach((row, idx) => {
    const labelCell = summary.getCell(`A${r}`);
    const valueCell = summary.getCell(`B${r}`);
    labelCell.value = row.label;
    valueCell.value = row.value;
    if (row.numFmt) valueCell.numFmt = row.numFmt;
    const fill = idx % 2 === 0 ? SURFACE_ALT : "FFFFFFFF";
    for (const cell of [labelCell, valueCell]) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
      cell.border = { top: thinBorder, bottom: thinBorder, left: thinBorder, right: thinBorder };
      cell.alignment = { vertical: "middle", indent: 1 };
    }
    labelCell.font = { color: { argb: INK500 }, size: 10 };
    valueCell.font = { bold: true, color: { argb: INK900 }, size: 11 };
    summary.getRow(r).height = 20;
    r += 1;
  });

  // ---------------- Question results sheet ----------------
  const qSheet = wb.addWorksheet("Question results", { views: [{ state: "frozen", ySplit: 1 }] });
  qSheet.columns = [
    { header: "Question", key: "question", width: 42 },
    { header: "Answer", key: "answer", width: 30 },
    { header: "Count", key: "count", width: 12 },
    { header: "Percent", key: "pct", width: 14 },
  ];
  const headerRow = qSheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND } };
    cell.alignment = { vertical: "middle" };
  });
  headerRow.height = 20;

  for (const q of breakdown) {
    if (q.kind === "categorical" || q.kind === "numeric") {
      const rows = q.kind === "categorical" ? q.distribution : q.distribution;
      if (!rows.length) {
        qSheet.addRow({ question: q.question.text, answer: "No responses yet", count: 0, pct: 0 });
        continue;
      }
      for (const d of rows) {
        qSheet.addRow({ question: q.question.text, answer: d.label, count: d.count, pct: d.pct / 100 });
      }
    } else {
      if (!q.samples.length) {
        qSheet.addRow({ question: q.question.text, answer: "No text responses yet", count: 0, pct: "" });
        continue;
      }
      for (const s of q.samples) {
        qSheet.addRow({ question: q.question.text, answer: s, count: "", pct: "" });
      }
    }
  }

  qSheet.getColumn("pct").numFmt = "0.0%";
  for (let i = 2; i <= qSheet.rowCount; i++) {
    const row = qSheet.getRow(i);
    const fill = i % 2 === 0 ? SURFACE_ALT : "FFFFFFFF";
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: fill } };
      cell.border = { bottom: thinBorder };
    });
  }
  if (qSheet.rowCount > 1) {
    qSheet.autoFilter = { from: "A1", to: `D${qSheet.rowCount}` };
    // Data-bar conditional formatting turns the Percent column into a
    // mini bar chart directly inside the spreadsheet.
    qSheet.addConditionalFormatting({
      ref: `D2:D${qSheet.rowCount}`,
      rules: [
        {
          type: "dataBar",
          priority: 1,
          cfvo: [{ type: "min" }, { type: "max" }],
          // `color` isn't in exceljs's DataBarRuleType typings but is
          // read at runtime (it's what actually colors the bar) — see
          // exceljs's own README examples for this exact shape.
          color: { argb: BRAND },
        } as unknown as ExcelJS.DataBarRuleType,
      ],
    });
  }

  // ---------------- Key findings sheet ----------------
  const findings = wb.addWorksheet("Key findings", { views: [{ showGridLines: false }] });
  findings.columns = [{ width: 42 }];
  if (insights?.hasData && insights.insights.length) {
    let fr = 1;
    for (const item of insights.insights) {
      const titleCell2 = findings.getCell(`A${fr}`);
      titleCell2.value = item.title;
      titleCell2.font = { bold: true, size: 11, color: { argb: INK900 } };
      titleCell2.fill = { type: "pattern", pattern: "solid", fgColor: { argb: BRAND_TINT } };
      titleCell2.alignment = { indent: 1, vertical: "middle" };
      findings.getRow(fr).height = 20;
      fr += 1;
      const bodyCell = findings.getCell(`A${fr}`);
      bodyCell.value = item.body;
      bodyCell.font = { size: 10, color: { argb: "FF3B4356" } };
      bodyCell.alignment = { wrapText: true, vertical: "top", indent: 1 };
      findings.getRow(fr).height = 34;
      fr += 2;
    }
  } else {
    findings.getCell("A1").value = "Not enough response data was available to generate AI-assisted findings at the time this report was created.";
    findings.getCell("A1").font = { italic: true, color: { argb: INK500 } };
    findings.getCell("A1").alignment = { wrapText: true };
  }

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
