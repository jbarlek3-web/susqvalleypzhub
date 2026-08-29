import type { EntitlementStatus } from "./entitlement-policy.ts";

export class EntitlementTimeoutError extends Error {
  constructor() {
    super("Secure access check timed out");
    this.name = "EntitlementTimeoutError";
  }
}

export function entitlementWithTimeout(
  request: Promise<EntitlementStatus>,
  timeoutMs = 12_000,
): Promise<EntitlementStatus> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new EntitlementTimeoutError()), timeoutMs);
    void request.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}
