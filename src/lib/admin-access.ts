const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ClerkEmailAddress = {
  id: string;
  emailAddress: string;
  verification: { status: string } | null;
};

export type ClerkAdminCandidate = {
  id: string;
  banned: boolean;
  locked: boolean;
  primaryEmailAddressId: string | null;
  emailAddresses: readonly ClerkEmailAddress[];
};

/**
 * Return one normalized administrator email, or null when the setting is
 * absent or malformed. Lists are deliberately rejected so this remains a
 * narrow owner-only exception.
 */
export function configuredAdminEmail(rawValue: string | undefined): string | null {
  const value = rawValue?.trim();
  if (!value || value.length > 254 || !EMAIL_PATTERN.test(value)) return null;
  return value.toLowerCase();
}

/**
 * Match only an email that Clerk's backend says is verified. Browser state and
 * client-provided claims are never used for this authorization decision.
 */
export function isConfiguredAdminClerkUser(
  user: ClerkAdminCandidate,
  authenticatedUserId: string,
  rawConfiguredEmail: string | undefined,
) {
  const adminEmail = configuredAdminEmail(rawConfiguredEmail);
  if (
    !adminEmail ||
    user.id !== authenticatedUserId ||
    user.banned ||
    user.locked ||
    !user.primaryEmailAddressId
  ) {
    return false;
  }

  return user.emailAddresses.some(
    ({ id, emailAddress, verification }) =>
      id === user.primaryEmailAddressId &&
      verification?.status === "verified" &&
      emailAddress.trim().toLowerCase() === adminEmail,
  );
}
