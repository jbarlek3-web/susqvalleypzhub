import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { safeDriveWebViewLink, sanitizeDriveName } from "./google-drive-core.ts";

const root = fileURLToPath(new URL("../..", import.meta.url));
const read = (path: string) => readFileSync(`${root}/${path}`, "utf8");

test("Drive filenames are bounded and stripped of unsafe path characters", () => {
  assert.equal(sanitizeDriveName('  A/B: C*D? "test"  ', "fallback"), "A B C D test");
  assert.equal(sanitizeDriveName("\u0000\u0001", "fallback"), "fallback");
  assert.ok(sanitizeDriveName("x".repeat(500), "fallback").length <= 120);
});

test("only canonical HTTPS Google Drive links reach the dashboard", () => {
  assert.equal(
    safeDriveWebViewLink("https://drive.google.com/file/d/example/view"),
    "https://drive.google.com/file/d/example/view",
  );
  assert.equal(safeDriveWebViewLink("javascript:alert(1)"), null);
  assert.equal(safeDriveWebViewLink("https://drive.google.com.evil.example/file"), null);
});

test("Drive uses only per-file access and encrypted per-user refresh tokens", () => {
  const server = read("src/lib/google-drive.server.ts");
  const migration = read("migrations/0007_google_drive.sql");
  assert.match(server, /googleapis\.com\/auth\/drive\.file/);
  assert.doesNotMatch(server, /googleapis\.com\/auth\/drive["']/);
  assert.match(server, /aes-256-gcm/);
  assert.match(server, /where user_id = \$\{userId\}/);
  assert.match(migration, /user_id text primary key/);
  assert.doesNotMatch(migration, /access_token/);
});

test("every Drive endpoint authenticates the solo user", () => {
  for (const name of ["start", "callback", "status", "disconnect", "export", "upload"]) {
    assert.match(read(`src/routes/api/google-drive/${name}.ts`), /authenticatedDriveUser/);
  }
  assert.match(read("src/lib/google-drive-route.server.ts"), /await requirePro\(\)/);
});

test("project export excludes municipal and county reference documents", () => {
  const server = read("src/lib/google-drive.server.ts");
  assert.match(server, /does not include or redistribute municipal or county reference documents/);
  assert.doesNotMatch(server, /reference_docs|ai-reference|document catalog/i);
});
