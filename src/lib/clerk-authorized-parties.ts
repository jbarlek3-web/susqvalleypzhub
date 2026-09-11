type ClerkOriginEnvironment = Partial<
  Record<
    | "APP_URL"
    | "CLERK_AUTHORIZED_PARTIES"
    | "VERCEL_URL"
    | "VERCEL_BRANCH_URL"
    | "VERCEL_PROJECT_PRODUCTION_URL",
    string | undefined
  >
>;

function toOrigin(value: string | undefined): string | null {
  const candidate = value?.trim();
  if (!candidate) return null;

  try {
    const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Clerk validates the requesting browser's `azp` claim against this exact list.
 * Include both production hostnames and the Vercel host for the current build;
 * otherwise a www/apex redirect or preview deployment can fail as cross-origin.
 */
export function clerkAuthorizedParties(env: ClerkOriginEnvironment): string[] | undefined {
  const origins = new Set<string>();
  const add = (value: string | undefined) => {
    const origin = toOrigin(value);
    if (origin) origins.add(origin);
  };

  add(env.APP_URL);
  add(env.VERCEL_URL);
  add(env.VERCEL_BRANCH_URL);
  add(env.VERCEL_PROJECT_PRODUCTION_URL);

  for (const value of env.CLERK_AUTHORIZED_PARTIES?.split(",") ?? []) add(value);

  if (origins.has("https://fieldacq.org") || origins.has("https://www.fieldacq.org")) {
    origins.add("https://fieldacq.org");
    origins.add("https://www.fieldacq.org");
  }

  return origins.size ? [...origins] : undefined;
}
