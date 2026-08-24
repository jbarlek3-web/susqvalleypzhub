import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../src/lib/error-component.tsx", import.meta.url), "utf8");

test("the global error screen does not disclose exception details", () => {
  assert.doesNotMatch(source, /error\.(message|stack|cause)/);
  assert.match(source, /An unexpected error occurred/);
});
