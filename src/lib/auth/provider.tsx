import type { ReactNode } from "react";
import { ClerkProvider } from "@clerk/tanstack-react-start";

/**
 * App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
 *
 *   <AuthProvider><Outlet /></AuthProvider>
 *
 * Clerk owns the browser session context here. Server-side verification remains
 * independent and always derives the user id from Clerk's signed session.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/login"
      signUpUrl="/sign-up"
      afterSignOutUrl="/"
    >
      {children}
    </ClerkProvider>
  );
}
