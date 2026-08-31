import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { consumeAiQuestion, getAiUsage } from "@/lib/ai-credits.server";
import { requirePro } from "@/lib/entitlement.server";
import { FeasibilityInputSchema } from "@/lib/feasibility-report-core";
import { consumeRateLimit } from "@/lib/rate-limit.server";

export const generateFeasibilityReport = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => FeasibilityInputSchema.parse(input))
  .handler(async ({ data, context }) => {
    await requirePro();
    await consumeRateLimit({
      action: "feasibility-report",
      subject: context.userId,
      max: 12,
      windowSeconds: 3_600,
    });
    const apiKey = process.env.XAI_API_KEY?.trim();
    if (!apiKey) return { ok: false as const, error: "Feasibility analysis is unavailable." };

    const { getAiReferenceEvidence } = await import("@/lib/ai-reference.server");
    const { getParcel } = await import("@/lib/data/parcels");
    const parcel = getParcel(data.parcelId);
    if (!parcel) return { ok: false as const, error: "Parcel not found." };
    const evidence = getAiReferenceEvidence({
      county: parcel.county,
      municipality: parcel.municipality,
      zoning: parcel.zoning,
      constraints: parcel.constraints,
      question: data.question || data.intendedUse,
    });
    if (!evidence.length) {
      return {
        ok: false as const,
        error: "No source-backed material was found for this parcel's jurisdiction.",
      };
    }

    const usage = await consumeAiQuestion(context.userId);
    if (!usage) {
      const currentUsage = await getAiUsage(context.userId);
      return {
        ok: false as const,
        code: "AI_ALLOWANCE_EXHAUSTED" as const,
        error: `You have used all ${currentUsage.includedLimit} included AI questions for this month.`,
        usage: currentUsage,
      };
    }

    try {
      const { createFeasibilityReport, signFeasibilityReport } =
        await import("@/lib/feasibility-report.server");
      const report = await createFeasibilityReport(data, apiKey);
      return {
        ok: true as const,
        report,
        downloadToken: signFeasibilityReport(report, context.userId),
        usage,
      };
    } catch (error) {
      const message =
        error instanceof Error && error.message === "NO_SOURCE_EVIDENCE"
          ? "No source-backed material was found for this parcel's jurisdiction."
          : "The source-grounded report could not be completed.";
      return { ok: false as const, error: message, usage };
    }
  });
