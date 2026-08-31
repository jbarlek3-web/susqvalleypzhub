import { createFileRoute } from "@tanstack/react-router";
import { googleDriveStatus } from "@/lib/google-drive.server";
import { authenticatedDriveUser, googleDriveErrorResponse } from "@/lib/google-drive-route.server";

export const Route = createFileRoute("/api/google-drive/status")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const userId = await authenticatedDriveUser();
          return Response.json(await googleDriveStatus(userId), {
            headers: { "cache-control": "no-store" },
          });
        } catch (error) {
          return googleDriveErrorResponse(error);
        }
      },
    },
  },
});
