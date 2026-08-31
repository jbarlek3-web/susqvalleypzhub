import { createFileRoute } from "@tanstack/react-router";
import { createGoogleDriveAuthorization } from "@/lib/google-drive.server";
import { authenticatedDriveUser, googleDriveErrorResponse } from "@/lib/google-drive-route.server";
import { consumeRateLimit } from "@/lib/rate-limit.server";

export const Route = createFileRoute("/api/google-drive/start")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const userId = await authenticatedDriveUser();
          await consumeRateLimit({
            action: "google-drive-connect",
            subject: userId,
            max: 10,
            windowSeconds: 600,
          });
          return Response.redirect(await createGoogleDriveAuthorization(userId, request), 302);
        } catch (error) {
          return googleDriveErrorResponse(error);
        }
      },
    },
  },
});
