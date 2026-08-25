import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const example = readFileSync(new URL("../.env.example", import.meta.url), "utf8");
const gitignore = readFileSync(new URL("../.gitignore", import.meta.url), "utf8");
const productionConfig = readFileSync(new URL("../src/lib/env.server.ts", import.meta.url), "utf8");

const entries = new Map(
  example
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator), line.slice(separator + 1)];
    }),
);

test("the committed environment template contains names only", () => {
  for (const [name, value] of entries) {
    assert.match(name, /^[A-Z][A-Z0-9_]*$/);
    assert.equal(value, "", `${name} must not contain an example credential`);
  }
});

test("every required production variable is documented", () => {
  const requiredBlock = productionConfig.match(/REQUIRED_PRODUCTION_ENV = \[([\s\S]*?)\] as const/)?.[1];
  assert.ok(requiredBlock, "required production environment list was not found");
  const requiredNames = [...requiredBlock.matchAll(/"([A-Z][A-Z0-9_]*)"/g)].map((match) => match[1]);
  assert.ok(requiredNames.length > 0);
  for (const name of requiredNames) assert.ok(entries.has(name), `${name} is missing from .env.example`);
});

test("the safe environment template is explicitly tracked", () => {
  assert.match(gitignore, /^!\.env\.example$/m);
});
