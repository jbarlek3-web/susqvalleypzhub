import { createFileRoute } from "@tanstack/react-router";
import {
  authenticatedFeasibilityReport,
  feasibilityReportError,
} from "@/lib/feasibility-report-route.server";
import { renderFeasibilityPdf } from "@/lib/feasibility-pdf.server";

const MAX_BODY_BYTES = 240_000;

function safeName(value: string) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 72);
  return `field-acq-feasibility-${slug || "report"}.pdf`;
}

export const Route = createFileRoute("/api/feasibility-report/pdf")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const declared = Number(request.headers.get("content-length") || 0);
          if (declared > MAX_BODY_BYTES) throw new Error("Report request is too large");
          const raw = await request.text();
          if (Buffer.byteLength(raw, "utf8") > MAX_BODY_BYTES)
            throw new Error("Report request is too large");
          const body = JSON.parse(raw) as { token?: unknown };
          if (typeof body.token !== "string") throw new Error("Invalid report request");
          const report = await authenticatedFeasibilityReport(body.token);
          const pdf = await renderFeasibilityPdf(report);
          return new Response(pdf, {
            headers: {
              "content-type": "application/pdf",
              "content-disposition": `attachment; filename="${safeName(report.parcel.address)}"`,
              "content-length": String(pdf.byteLength),
              "cache-control": "private, no-store",
              "x-content-type-options": "nosniff",
            },
          });
        } catch (error) {
          return feasibilityReportError(error);
        }
      },
    },
  },
});
