import assert from "node:assert/strict";
import test from "node:test";
import {
  AdminIdentityUnavailableError,
  assertProEntitlement,
  resolveEntitlement,
} from "./entitlement-policy.ts";

const owner = {
  id: "user_owner123",
  banned: false,
  locked: false,
  primaryEmailAddressId: "idn_owner",
  emailAddresses: [
    {
      id: "idn_owner",
      emailAddress: "owner@example.com",
      verification: { status: "verified" },
    },
  ],
};

test("signed-out and unconfigured users remain locked without a Clerk lookup", async () => {
  let calls = 0;
  const getUser = async () => {
    calls += 1;
    return owner;
  };

  assert.equal(
    (await resolveEntitlement({ userId: null, has: () => false }, "pro", undefined, getUser))
      .status,
    "locked",
  );
  assert.equal(
    (
      await resolveEntitlement(
        { userId: "user_other", has: () => false },
        "pro",
        undefined,
        getUser,
      )
    ).status,
    "locked",
  );
  assert.equal(calls, 0);
});

test("a Pro subscriber short-circuits administrator verification", async () => {
  let calls = 0;
  const result = await resolveEntitlement(
    { userId: "user_subscriber", has: ({ plan }) => plan === "pro" },
    "pro",
    "owner@example.com",
    async () => {
      calls += 1;
      return owner;
    },
  );

  assert.deepEqual(result, { isPro: true, status: "active", currentPeriodEnd: null });
  assert.equal(calls, 0);
});

test("only the exact server-verified owner receives administrator entitlement", async () => {
  const admin = await resolveEntitlement(
    { userId: owner.id, has: () => false },
    "pro",
    "owner@example.com",
    async () => owner,
  );
  const other = await resolveEntitlement(
    { userId: "user_other", has: () => false },
    "pro",
    "owner@example.com",
    async () => ({ ...owner, id: "user_other", emailAddresses: [] }),
  );

  assert.deepEqual(admin, { isPro: true, status: "admin", currentPeriodEnd: null });
  assert.equal(other.status, "locked");
});

test("Clerk lookup failures deny access with a sanitized 503", async () => {
  await assert.rejects(
    resolveEntitlement(
      { userId: owner.id, has: () => false },
      "pro",
      "owner@example.com",
      async () => {
        throw new Error("upstream response with sensitive details");
      },
    ),
    (error: unknown) => {
      assert.ok(error instanceof AdminIdentityUnavailableError);
      assert.equal(error.status, 503);
      assert.doesNotMatch(error.message, /sensitive details/);
      return true;
    },
  );
});

test("Pro enforcement allows admin access and rejects locked access", () => {
  assert.equal(
    assertProEntitlement({ isPro: true, status: "admin", currentPeriodEnd: null }).status,
    "admin",
  );
  assert.throws(
    () => assertProEntitlement({ isPro: false, status: "locked", currentPeriodEnd: null }),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.equal(error.name, "PaymentRequiredError");
      assert.equal((error as Error & { status?: number }).status, 402);
      return true;
    },
  );
});
