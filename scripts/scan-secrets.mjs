#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const patterns = [
  String.raw`sk_(live|test)_[A-Za-z0-9]+`,
  String.raw`rk_(live|test)_[A-Za-z0-9]+`,
  String.raw`whsec_[A-Za-z0-9]+`,
  String.raw`AKIA[0-9A-Z]{16}`,
  String.raw`-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----`,
];

const result = spawnSync(
  "git",
  ["grep", "-n", "-I", "-E", patterns.join("|"), "HEAD", "--", ".", ":!scripts/scan-secrets.mjs"],
  { encoding: "utf8", shell: false },
);

if (result.status === 1) {
  console.log("[secrets] no high-confidence secret patterns found in tracked files");
  process.exit(0);
}
if (result.status !== 0) {
  process.stderr.write(result.stderr || "[secrets] scan failed\n");
  process.exit(result.status ?? 2);
}

process.stderr.write("[secrets] potential credentials found:\n");
process.stderr.write(result.stdout);
process.exit(1);
