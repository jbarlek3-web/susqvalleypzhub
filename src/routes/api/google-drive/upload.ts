import { createFileRoute } from "@tanstack/react-router";
import { safeDriveWebViewLink } from "@/lib/google-drive-core";
import { MAX_PROJECT_FILE_BYTES, uploadProjectFileToGoogleDrive } from "@/lib/google-drive.server";
import { authenticatedDriveUser, googleDriveErrorResponse } from "@/lib/google-drive-route.server";
import { consumeRateLimit } from "@/lib/rate-limit.server";

const MAX_MULTIPART_BYTES = MAX_PROJECT_FILE_BYTES + 256 * 1024;

export const Route = createFileRoute("/api/google-drive/upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const declared = Number(request.headers.get("content-length") || 0);
          if (!declared || declared > MAX_MULTIPART_BYTES) {
            throw new Error("Project file upload must be 5 MB or smaller");
          }
          const userId = await authenticatedDriveUser(request);
          await consumeRateLimit({
            action: "google-drive-upload",
            subject: userId,
            max: 20,
            windowSeconds: 3600,
          });
          const form = await request.formData();
          const projectId = form.get("projectId");
          const projectName = form.get("projectName");
          const file = form.get("file");
          if (
            typeof projectId !== "string" ||
            !/^[a-zA-Z0-9_-]{1,100}$/.test(projectId) ||
            typeof projectName !== "string" ||
            projectName.length > 200 ||
            !(file instanceof File)
          ) {
            throw new Error("Invalid project file upload");
          }
          const uploaded = await uploadProjectFileToGoogleDrive(
            userId,
            { id: projectId, name: projectName },
            file,
          );
          return Response.json(
            {
              id: uploaded.id,
              name: uploaded.name,
              webViewLink: safeDriveWebViewLink(uploaded.webViewLink),
            },
            { headers: { "cache-control": "no-store" } },
          );
        } catch (error) {
          return googleDriveErrorResponse(error);
        }
      },
    },
  },
});
