#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { extname, resolve } from "node:path";

const patterns = [
  String.raw`sk_(live|test)_[A-Za-z0-9]+`,
  String.raw`rk_(live|test)_[A-Za-z0-9]+`,
  String.raw`whsec_[A-Za-z0-9]+`,
  String.raw`AKIA[0-9A-Z]{16}`,
  String.raw`-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----`,
];

const compiledPattern = new RegExp(patterns.join("|"), "g");
const textExtensions = new Set([
  ".css",
  ".env",
  ".html",
  ".js",
  ".json",
  ".map",
  ".mjs",
  ".txt",
  ".xml",
  ".yaml",
  ".yml",
]);

function collectTextFiles(path) {
  const absolutePath = resolve(path);
  const metadata = statSync(absolutePath);
  if (metadata.isFile()) {
    return textExtensions.has(extname(absolutePath).toLowerCase()) ? [absolutePath] : [];
  }

  return readdirSync(absolutePath, { withFileTypes: true }).flatMap((entry) => {
    const childPath = resolve(absolutePath, entry.name);
    if (entry.isDirectory()) return collectTextFiles(childPath);
    return textExtensions.has(extname(entry.name).toLowerCase()) ? [childPath] : [];
  });
}

const artifactPaths = process.argv.slice(2);
if (artifactPaths.length > 0) {
  const findings = [];
  for (const path of artifactPaths) {
    for (const file of collectTextFiles(path)) {
      const contents = readFileSync(file, "utf8");
      compiledPattern.lastIndex = 0;
      if (compiledPattern.test(contents)) findings.push(file);
    }
  }

  if (findings.length === 0) {
    console.log("[secrets] no high-confidence secret patterns found in deployable text artifacts");
    process.exit(0);
  }

  process.stderr.write("[secrets] potential credentials found in deployable artifacts (values redacted):\n");
  for (const file of [...new Set(findings)].sort()) process.stderr.write(`${file}\n`);
  process.exit(1);
}

const result = spawnSync(
  "git",
  ["grep", "-l", "-I", "-E", patterns.join("|"), "HEAD", "--", ".", ":!scripts/scan-secrets.mjs"],
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

process.stderr.write("[secrets] potential credentials found in tracked files (values redacted):\n");
process.stderr.write(result.stdout);
process.exit(1);
