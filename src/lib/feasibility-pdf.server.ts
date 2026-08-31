import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import {
  REPORT_SECTIONS,
  reportCoverage,
  type FeasibilityReport,
} from "./feasibility-report-core.ts";

const PAGE = { width: 612, height: 792, margin: 48 };
const COLORS = {
  navy: rgb(0.02, 0.1, 0.2),
  teal: rgb(0, 0.45, 0.5),
  green: rgb(0.35, 0.8, 0.12),
  muted: rgb(0.32, 0.38, 0.45),
  line: rgb(0.82, 0.86, 0.9),
  pale: rgb(0.96, 0.97, 0.98),
  red: rgb(0.72, 0.12, 0.12),
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function clean(value: string) {
  return Array.from(value, (character) => {
    const codePoint = character.codePointAt(0) ?? 0;
    return codePoint <= 0x1f || codePoint === 0x7f ? " " : character;
  })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function wrap(text: string, font: PDFFont, size: number, width: number) {
  const words = clean(text).split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(next, size) <= width) line = next;
    else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function renderFeasibilityPdf(report: FeasibilityReport) {
  const doc = await PDFDocument.create();
  const regular = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let page!: PDFPage;
  let y = 0;

  const newPage = () => {
    page = doc.addPage([PAGE.width, PAGE.height]);
    page.drawText("FIELD ACQ ORDINANCE AIDE", {
      x: PAGE.margin,
      y: PAGE.height - 30,
      size: 8,
      font: bold,
      color: COLORS.teal,
    });
    page.drawText(`Source-grounded feasibility report  |  ${report.reportId}`, {
      x: PAGE.margin,
      y: PAGE.height - 42,
      size: 7,
      font: regular,
      color: COLORS.muted,
    });
    page.drawLine({
      start: { x: PAGE.margin, y: PAGE.height - 49 },
      end: { x: PAGE.width - PAGE.margin, y: PAGE.height - 49 },
      thickness: 0.6,
      color: COLORS.line,
    });
    y = PAGE.height - 70;
  };

  const ensure = (height: number) => {
    if (y - height < 54) newPage();
  };

  const heading = (text: string, size = 14) => {
    ensure(size + 16);
    page.drawText(clean(text), { x: PAGE.margin, y, size, font: bold, color: COLORS.navy });
    y -= size + 8;
  };

  const paragraph = (
    text: string,
    options?: { size?: number; indent?: number; color?: ReturnType<typeof rgb> },
  ) => {
    const size = options?.size ?? 9;
    const indent = options?.indent ?? 0;
    const lines = wrap(text, regular, size, PAGE.width - PAGE.margin * 2 - indent);
    for (const line of lines) {
      ensure(size + 4);
      page.drawText(line, {
        x: PAGE.margin + indent,
        y,
        size,
        font: regular,
        color: options?.color ?? COLORS.navy,
      });
      y -= size + 3;
    }
    y -= 4;
  };

  const bullet = (text: string, color = COLORS.navy) => {
    ensure(18);
    page.drawCircle({ x: PAGE.margin + 3, y: y + 3, size: 2, color: COLORS.green });
    paragraph(text, { size: 9, indent: 12, color });
  };

  newPage();
  heading("Land Development Feasibility Report", 22);
  paragraph(`${report.parcel.address} | APN ${report.parcel.apn}`, {
    size: 11,
    color: COLORS.teal,
  });
  paragraph(
    `${report.parcel.municipality}, ${report.parcel.county} County | ${report.parcel.acres.toFixed(2)} acres | Screening zoning ${report.parcel.zoning} - ${report.parcel.zoningName}`,
  );
  paragraph(`Intended use: ${report.intendedUse}`);
  y -= 4;
  ensure(66);
  page.drawRectangle({
    x: PAGE.margin,
    y: y - 48,
    width: PAGE.width - PAGE.margin * 2,
    height: 54,
    color: COLORS.pale,
    borderColor: COLORS.green,
    borderWidth: 1,
  });
  page.drawText(report.verdict, {
    x: PAGE.margin + 14,
    y: y - 16,
    size: 15,
    font: bold,
    color: COLORS.navy,
  });
  page.drawText(`Feasibility score ${report.feasibilityScore}/100`, {
    x: PAGE.margin + 14,
    y: y - 34,
    size: 10,
    font: regular,
    color: COLORS.teal,
  });
  y -= 68;
  heading("Executive summary");
  paragraph(report.executiveSummary, { size: 10 });
  if (report.conditions.length) {
    heading("Conditions to proceed", 12);
    report.conditions.forEach((item) => bullet(item));
  }

  for (const section of REPORT_SECTIONS) {
    heading(section);
    const claims = report.claims.filter((claim) => claim.section === section);
    for (const claim of claims) {
      const sources = claim.sourceIds.length ? ` [${claim.sourceIds.join(", ")}]` : "";
      bullet(
        `${claim.status.toUpperCase()} | ${claim.statement}${sources}`,
        claim.status === "missing" ? COLORS.red : COLORS.navy,
      );
    }
  }

  ensure(240);
  heading("Financial model");
  paragraph(
    "All financial values below are calculations from user-entered assumptions, not verified market facts, forecasts, or appraisals.",
    { color: COLORS.muted },
  );
  const rows = [
    ["Asking price", money(report.financial.assumptions.askingPrice)],
    ["Target lots", String(report.financial.assumptions.targetLots)],
    ["Gross revenue", money(report.financial.grossRevenue)],
    ["Direct sitework", money(report.financial.directSitework)],
    ["Soft costs", money(report.financial.softCosts)],
    ["Carry costs", money(report.financial.carryCosts)],
    ["Selling costs", money(report.financial.sellingCosts)],
    ["Total cost", money(report.financial.totalCost)],
    ["Projected profit", money(report.financial.projectedProfit)],
    ["Projected margin", `${report.financial.marginPercent.toFixed(1)}%`],
    ["Breakeven per lot", money(report.financial.breakevenPerLot)],
  ];
  for (const [label, value] of rows) {
    ensure(18);
    page.drawText(label, { x: PAGE.margin, y, size: 9, font: regular, color: COLORS.muted });
    page.drawText(value, {
      x: PAGE.width - PAGE.margin - 150,
      y,
      size: 9,
      font: bold,
      color: COLORS.navy,
    });
    y -= 16;
  }
  y -= 8;
  heading("Scenario sensitivity", 12);
  report.financial.scenarios.forEach((scenario) =>
    bullet(
      `${scenario.name}: ${scenario.lots} lots | revenue ${money(scenario.revenue)} | total cost ${money(scenario.totalCost)} | profit ${money(scenario.profit)} | margin ${scenario.marginPercent.toFixed(1)}%`,
    ),
  );
  heading("Calculation lineage", 12);
  report.financial.lineage.forEach((line) => bullet(line));

  heading("45-day diligence plan");
  report.diligenceItems.forEach((item, index) => bullet(`${index + 1}. ${item}`));
  heading("Kill criteria");
  report.killCriteria.forEach((item) => bullet(item, COLORS.red));

  const coverage = reportCoverage(report);
  heading("Evidence register");
  paragraph(
    `Claim coverage: ${coverage.verified} verified | ${coverage.assumption} assumptions | ${coverage.missing} missing. Accessed ${new Date(report.generatedAt).toLocaleString("en-US")}.`,
  );
  for (const source of report.evidence) {
    bullet(
      `[${source.id}] ${source.sourceTitle} | ${source.locator} | ${source.sourceType} / ${source.category} | ${source.jurisdiction}`,
    );
    if (source.officialSourceUrl)
      paragraph(`Official source website: ${source.officialSourceUrl}`, {
        size: 7,
        indent: 12,
        color: COLORS.teal,
      });
  }
  heading("Limitations and reliance");
  report.limitations.forEach((item) => bullet(item));
  paragraph(
    "This report is an early-stage screening aid. It is not legal, engineering, surveying, environmental, appraisal, lending, title, tax, or investment advice. Municipal and county reference documents are not attached or delivered with this report; use the official-source links or contact the issuing agency.",
    { size: 8, color: COLORS.muted },
  );

  const totalPages = doc.getPageCount();
  doc.getPages().forEach((item, index) => {
    item.drawLine({
      start: { x: PAGE.margin, y: 38 },
      end: { x: PAGE.width - PAGE.margin, y: 38 },
      thickness: 0.5,
      color: COLORS.line,
    });
    item.drawText(
      `Field ACQ | Generated ${report.generatedAt.slice(0, 10)} | Page ${index + 1} of ${totalPages}`,
      {
        x: PAGE.margin,
        y: 24,
        size: 7,
        font: regular,
        color: COLORS.muted,
      },
    );
  });
  doc.setTitle(`Field ACQ Feasibility Report - ${clean(report.parcel.address)}`);
  doc.setSubject("Source-grounded land development feasibility screening report");
  doc.setCreator("Field ACQ Ordinance Aide");
  return Buffer.from(await doc.save());
}
