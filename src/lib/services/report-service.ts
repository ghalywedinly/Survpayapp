import { db } from "@/lib/db";

export const REPORT_SECTIONS = [
  "sectionExecSummary",
  "sectionMethodology",
  "sectionSample",
  "sectionFindings",
  "sectionQuestions",
  "sectionCharts",
  "sectionAiInsights",
  "sectionConclusion",
] as const;

export const ReportService = {
  async generate(surveyId: string, title: string) {
    return db.report.create({
      data: {
        surveyId,
        title,
        sections: JSON.stringify(REPORT_SECTIONS),
        status: "ready",
      },
    });
  },

  async listForOrg(organizationId: string) {
    return db.report.findMany({
      where: { survey: { organizationId } },
      include: { survey: { select: { id: true, title: true, titleAr: true, code: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async listForSurvey(surveyId: string) {
    return db.report.findMany({ where: { surveyId }, orderBy: { createdAt: "desc" } });
  },

  async get(reportId: string) {
    return db.report.findUnique({ where: { id: reportId } });
  },
};
