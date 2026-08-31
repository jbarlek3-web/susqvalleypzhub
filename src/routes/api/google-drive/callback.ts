import { createFileRoute } from "@tanstack/react-router";
import { completeGoogleDriveAuthorization } from "@/lib/google-drive.server";
import { authenticatedDriveUser, redirectToDashboard } from "@/lib/google-drive-route.server";

export const Route = createFileRoute("/api/google-drive/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        if (params.get("error")) return redirectToDashboard(request, "denied");
        const code = params.get("code");
        const state = params.get("state");
        if (!code || !state) return redirectToDashboard(request, "error");
        try {
          const userId = await authenticatedDriveUser();
          await completeGoogleDriveAuthorization(userId, request, code, state);
          return redirectToDashboard(request, "connected");
        } catch {
          return redirectToDashboard(request, "error");
        }
      },
    },
  },
});
