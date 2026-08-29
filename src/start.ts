import { createStart } from "@tanstack/react-start";
import { clerkMiddleware } from "@clerk/tanstack-react-start/server";
import { clerkAuthorizedParties } from "@/lib/clerk-authorized-parties";

export const startInstance = createStart(() => ({
  requestMiddleware: [
    clerkMiddleware({
      authorizedParties: clerkAuthorizedParties(process.env),
    }),
  ],
}));
