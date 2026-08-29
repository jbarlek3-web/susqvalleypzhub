import assert from "node:assert/strict";
import test from "node:test";
import { clerkAuthorizedParties } from "./clerk-authorized-parties.ts";

test("authorizes both Field ACQ production hostnames", () => {
  assert.deepEqual(clerkAuthorizedParties({ APP_URL: "https://fieldacq.org" }), [
    "https://fieldacq.org",
    "https://www.fieldacq.org",
  ]);
});

test("authorizes the current Vercel deployment and explicit exact origins", () => {
  assert.deepEqual(
    clerkAuthorizedParties({
      APP_URL: "https://www.fieldacq.org/path",
      VERCEL_URL: "field-acq-abc.vercel.app",
      CLERK_AUTHORIZED_PARTIES: "https://staging.fieldacq.org, invalid origin",
    }),
    [
      "https://www.fieldacq.org",
      "https://field-acq-abc.vercel.app",
      "https://staging.fieldacq.org",
      "https://fieldacq.org",
    ],
  );
});

test("omits authorized parties when no valid origin is configured", () => {
  assert.equal(clerkAuthorizedParties({ APP_URL: "not a url" }), undefined);
});
