import { createFileRoute } from "@tanstack/react-router";
import { disconnectGoogleDrive } from "@/lib/google-drive.server";
import { authenticatedDriveUser, googleDriveErrorResponse } from "@/lib/google-drive-route.server";
import { consumeRateLimit } from "@/lib/rate-limit.server";

export const Route = createFileRoute("/api/google-drive/disconnect")({
  server: {
    handlers: {
      POST: async () => {
        try {
          const userId = await authenticatedDriveUser();
          await consumeRateLimit({
            action: "google-drive-disconnect",
            subject: userId,
            max: 5,
            windowSeconds: 600,
          });
          await disconnectGoogleDrive(userId);
          return Response.json(
            { disconnected: true },
            { headers: { "cache-control": "no-store" } },
          );
        } catch (error) {
          return googleDriveErrorResponse(error);
        }
      },
    },
  },
});
