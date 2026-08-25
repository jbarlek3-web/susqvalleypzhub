import { createStart } from "@tanstack/react-start";
import { clerkMiddleware } from "@clerk/tanstack-react-start/server";

export const startInstance = createStart(() => ({
  requestMiddleware: [
    clerkMiddleware({
      authorizedParties: process.env.APP_URL ? [new URL(process.env.APP_URL).origin] : undefined,
    }),
  ],
}));
