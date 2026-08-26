import assert from "node:assert/strict";
import test from "node:test";
import { configuredAdminEmail, isConfiguredAdminClerkUser } from "./admin-access.ts";

const verifiedOwner = {
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

test("admin access is disabled when no email is configured", () => {
  assert.equal(configuredAdminEmail(undefined), null);
  assert.equal(configuredAdminEmail("  "), null);
  assert.equal(isConfiguredAdminClerkUser(verifiedOwner, verifiedOwner.id, undefined), false);
});

test("admin access requires the authenticated Clerk user and configured primary verified email", () => {
  assert.equal(
    isConfiguredAdminClerkUser(verifiedOwner, verifiedOwner.id, " Owner@Example.com "),
    true,
  );
  assert.equal(
    isConfiguredAdminClerkUser(verifiedOwner, "user_attacker123", "owner@example.com"),
    false,
  );
  assert.equal(
    isConfiguredAdminClerkUser(verifiedOwner, verifiedOwner.id, "different@example.com"),
    false,
  );
  assert.equal(
    isConfiguredAdminClerkUser(
      {
        ...verifiedOwner,
        emailAddresses: [
          {
            ...verifiedOwner.emailAddresses[0],
            verification: { status: "unverified" },
          },
        ],
      },
      verifiedOwner.id,
      "owner@example.com",
    ),
    false,
  );
  assert.equal(
    isConfiguredAdminClerkUser(
      {
        ...verifiedOwner,
        primaryEmailAddressId: "idn_other",
        emailAddresses: [
          ...verifiedOwner.emailAddresses,
          {
            id: "idn_other",
            emailAddress: "other@example.com",
            verification: { status: "verified" },
          },
        ],
      },
      verifiedOwner.id,
      "owner@example.com",
    ),
    false,
  );
});

test("banned or locked Clerk users never receive admin access", () => {
  assert.equal(
    isConfiguredAdminClerkUser(
      { ...verifiedOwner, banned: true },
      verifiedOwner.id,
      "owner@example.com",
    ),
    false,
  );
  assert.equal(
    isConfiguredAdminClerkUser(
      { ...verifiedOwner, locked: true },
      verifiedOwner.id,
      "owner@example.com",
    ),
    false,
  );
});

test("malformed administrator settings fail closed", () => {
  for (const value of [
    "owner",
    "owner@example",
    "owner@example.com,other@example.com",
    "owner @example.com",
  ]) {
    assert.equal(configuredAdminEmail(value), null);
    assert.equal(isConfiguredAdminClerkUser(verifiedOwner, verifiedOwner.id, value), false);
  }
});
