import { createFileRoute } from "@tanstack/react-router";
import { safeDriveWebViewLink } from "@/lib/google-drive-core";
import { exportProjectToGoogleDrive } from "@/lib/google-drive.server";
import { authenticatedDriveUser, googleDriveErrorResponse } from "@/lib/google-drive-route.server";
import { consumeRateLimit } from "@/lib/rate-limit.server";

const MAX_SNAPSHOT_BYTES = 64 * 1024;

function projectFrom(value: unknown) {
  if (!value || typeof value !== "object") throw new Error("Invalid project");
  const row = value as Record<string, unknown>;
  if (
    typeof row.id !== "string" ||
    !/^[a-zA-Z0-9_-]{1,100}$/.test(row.id) ||
    typeof row.name !== "string" ||
    typeof row.county !== "string" ||
    typeof row.municipality !== "string" ||
    typeof row.status !== "string" ||
    typeof row.acres !== "number" ||
    !Number.isFinite(row.acres) ||
    !Array.isArray(row.parcelIds) ||
    !row.parcelIds.every((id) => typeof id === "string" && id.length <= 120) ||
    !Array.isArray(row.constraints) ||
    !row.constraints.every((item) => typeof item === "string" && item.length <= 200)
  ) {
    throw new Error("Invalid project");
  }
  return {
    id: row.id,
    name: row.name.slice(0, 200),
    county: row.county.slice(0, 100),
    municipality: row.municipality.slice(0, 150),
    status: row.status.slice(0, 80),
    parcelIds: row.parcelIds.slice(0, 500),
    acres: row.acres,
    constraints: row.constraints.slice(0, 100),
  };
}

export const Route = createFileRoute("/api/google-drive/export")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const declared = Number(request.headers.get("content-length") || 0);
          if (declared > MAX_SNAPSHOT_BYTES) throw new Error("Project export is too large");
          const text = await request.text();
          if (Buffer.byteLength(text, "utf8") > MAX_SNAPSHOT_BYTES) {
            throw new Error("Project export is too large");
          }
          const userId = await authenticatedDriveUser(request);
          await consumeRateLimit({
            action: "google-drive-export",
            subject: userId,
            max: 30,
            windowSeconds: 3600,
          });
          const file = await exportProjectToGoogleDrive(userId, projectFrom(JSON.parse(text)));
          return Response.json(
            { id: file.id, name: file.name, webViewLink: safeDriveWebViewLink(file.webViewLink) },
            { headers: { "cache-control": "no-store" } },
          );
        } catch (error) {
          return googleDriveErrorResponse(error);
        }
      },
    },
  },
});
