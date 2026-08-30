import { PDFDocument, StandardFonts, rgb, degrees, type PDFImage, type PDFPage } from "pdf-lib";
import ExcelJS from "exceljs";
import { db } from "@/lib/db";
import { AnalyticsService } from "./analytics-service";
import { AIService } from "./ai-service";
import { SURVPAY_ICON_PNG_BASE64 } from "./report-assets";

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

export async function buildReportPdf(surveyId: string): Promise<Uint8Array> {
  const { survey, overview, breakdown, insights } = await loadReportData(surveyId);

  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const icon = await doc.embedPng(Buffer.from(SURVPAY_ICON_PNG_BASE64, "base64"));
  const margin = 50;
  const pageWidth = 595;
  const pageHeight = 842;

  // Faint, centered, rotated icon on every page — proves the report came
  // from SurvPay even once printed or screenshotted out of context.
  function drawWatermark(target: PDFPage, image: PDFImage) {
    const wmHeight = 340;
    const wmWidth = wmHeight * (image.width / image.height);
    target.drawImage(image, {
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
    drawWatermark(p, icon);
    return p;
  }

  let page = newPage();
  let y = pageHeight - margin;

  const ink = rgb(0.07, 0.08, 0.12);
  const brand = rgb(0.36, 0.24, 0.94);
  const gray = rgb(0.44, 0.49, 0.56);

  function ensureSpace(lines = 1, size = 12) {
    if (y - lines * (size + 6) < margin) {
      page = newPage();
      y = pageHeight - margin;
    }
  }

  function heading(text: string) {
    ensureSpace(2, 16);
    page.drawText(text, { x: margin, y, size: 16, font: bold, color: ink });
    y -= 24;
  }

  function subheading(text: string) {
    ensureSpace(1, 12);
    page.drawText(text, { x: margin, y, size: 12, font: bold, color: brand });
    y -= 18;
  }

  function paragraph(text: string, size = 10.5, color = ink) {
    const maxWidth = pageWidth - margin * 2;
    const words = text.split(" ");
    let line = "";
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxWidth) {
        ensureSpace(1, size);
        page.drawText(line, { x: margin, y, size, font, color });
        y -= size + 6;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      ensureSpace(1, size);
      page.drawText(line, { x: margin, y, size, font, color });
      y -= size + 6;
    }
  }

  const headerIconHeight = 20;
  const headerIconWidth = headerIconHeight * (icon.width / icon.height);
  page.drawImage(icon, { x: margin, y: y - 3, width: headerIconWidth, height: headerIconHeight });
  page.drawText("Survpay", { x: margin + headerIconWidth + 8, y, size: 20, font: bold, color: brand });
  y -= 32;
  page.drawText(survey.title, { x: margin, y, size: 18, font: bold, color: ink });
  y -= 22;
  paragraph(`Generated ${new Date().toLocaleDateString("en-US")} · Research report`, 10, gray);
  y -= 10;

  heading("Executive summary");
  paragraph(
    `This report summarizes ${overview.totalResponses} responses collected for "${survey.title}", with a completion rate of ${overview.completionRate.toFixed(1)}% and an average completion time of ${overview.avgCompletionSeconds}s.`
  );

  heading("Methodology");
  paragraph(
    survey.objective ??
      "Respondents were recruited by the research team and completed the survey via a shared SurvPay link. Response quality controls (duplicate prevention, attention checks, and completion-time analysis) were applied automatically."
  );

  heading("Sample overview");
  paragraph(`Total responses: ${overview.totalResponses}`);
  paragraph(`Reward spend: SAR ${overview.rewardSpend.toFixed(2)} · Cost per response: SAR ${overview.costPerResponse.toFixed(2)}`);

  heading("Key findings");
  if (insights?.hasData) {
    for (const item of insights.insights) {
      subheading(item.title);
      paragraph(item.body);
    }
  } else {
    paragraph("Not enough response data was available to generate AI-assisted findings at the time this report was created.");
  }

  heading("Question results");
  for (const q of breakdown) {
    subheading(q.question.text);
    if (q.kind === "categorical") {
      for (const d of q.distribution) {
        paragraph(`${d.label}: ${d.pct}% (${d.count})`, 10, gray);
      }
    } else if (q.kind === "numeric") {
      paragraph(`Average: ${q.average} · Responses: ${q.responseCount}`, 10, gray);
    } else {
      paragraph(`${q.responseCount} text responses collected.`, 10, gray);
    }
  }

  heading("Conclusion");
  paragraph(
    "This report was generated automatically by SurvPay from live response data. Demo/AI-assisted insights are labeled as such and should be validated by the research team before external use."
  );

  return doc.save();
}

export async function buildReportExcel(surveyId: string): Promise<Buffer> {
  const { survey, overview, breakdown } = await loadReportData(surveyId);
  const wb = new ExcelJS.Workbook();
  wb.creator = "SurvPay";
  wb.created = new Date();

  const overviewSheet = wb.addWorksheet("Overview");
  overviewSheet.columns = [
    { header: "Metric", key: "metric", width: 32 },
    { header: "Value", key: "value", width: 24 },
  ];
  overviewSheet.addRows([
    { metric: "Survey", value: survey.title },
    { metric: "Status", value: survey.status },
    { metric: "Total responses", value: overview.totalResponses },
    { metric: "Completion rate", value: `${overview.completionRate.toFixed(1)}%` },
    { metric: "Avg. completion time (s)", value: overview.avgCompletionSeconds },
    { metric: "Reward spend (SAR)", value: overview.rewardSpend },
    { metric: "Cost per response (SAR)", value: Number(overview.costPerResponse.toFixed(2)) },
  ]);
  overviewSheet.getRow(1).font = { bold: true };

  const qSheet = wb.addWorksheet("Question results");
  qSheet.columns = [
    { header: "Question", key: "question", width: 40 },
    { header: "Answer", key: "answer", width: 30 },
    { header: "Count", key: "count", width: 12 },
    { header: "Percent", key: "pct", width: 12 },
  ];
  qSheet.getRow(1).font = { bold: true };
  for (const q of breakdown) {
    if (q.kind === "categorical") {
      for (const d of q.distribution) {
        qSheet.addRow({ question: q.question.text, answer: d.label, count: d.count, pct: `${d.pct}%` });
      }
    } else if (q.kind === "numeric") {
      qSheet.addRow({ question: q.question.text, answer: `Average: ${q.average}`, count: q.responseCount, pct: "" });
    } else {
      qSheet.addRow({ question: q.question.text, answer: "Open text", count: q.responseCount, pct: "" });
    }
  }

  const buffer = await wb.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
