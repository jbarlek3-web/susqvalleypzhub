import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const scanner = fileURLToPath(new URL("./scan-secrets.mjs", import.meta.url));

function runScanner(path) {
  return spawnSync(process.execPath, [scanner, path], {
    encoding: "utf8",
    shell: false,
  });
}

test("artifact scanning ignores binary files and accepts clean text artifacts", () => {
  const directory = mkdtempSync(join(tmpdir(), "secret-scan-clean-"));
  try {
    writeFileSync(join(directory, "client.js"), "const status = 'ready';\n");
    writeFileSync(join(directory, "database.data"), "binary-format-content-is-not-scanned");

    const result = runScanner(directory);
    assert.equal(result.status, 0, result.stderr);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("artifact scanning reports only the path and never echoes the credential", () => {
  const directory = mkdtempSync(join(tmpdir(), "secret-scan-match-"));
  const credential = `whsec_${"a".repeat(24)}`;
  try {
    const artifact = join(directory, "server.mjs");
    writeFileSync(artifact, `export const leaked = ${JSON.stringify(credential)};\n`);

    const result = runScanner(directory);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /server\.mjs/);
    assert.doesNotMatch(result.stderr, new RegExp(credential));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});

test("artifact scanning detects Google API keys without echoing them", () => {
  const directory = mkdtempSync(join(tmpdir(), "secret-scan-google-"));
  const credential = `AIza${"A".repeat(35)}`;
  try {
    const artifact = join(directory, "corpus.json");
    writeFileSync(artifact, JSON.stringify({ text: credential }));

    const result = runScanner(directory);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /corpus\.json/);
    assert.doesNotMatch(result.stderr, new RegExp(credential));
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
