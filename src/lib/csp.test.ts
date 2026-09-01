import assert from "node:assert/strict";
import test from "node:test";
import {
  assertNonce,
  buildContentSecurityPolicy,
  cspOmitsUnsafeInlineScripts,
  generateNonce,
  injectHtmlNonce,
} from "./csp.ts";

test("generateNonce returns a url-safe token of sufficient length", () => {
  const nonce = generateNonce();
  assert.equal(assertNonce(nonce), nonce);
  assert.notEqual(generateNonce(), nonce);
});

test("assertNonce rejects empty, short, and unsafe values", () => {
  assert.throws(() => assertNonce(""));
  assert.throws(() => assertNonce("short"));
  assert.throws(() => assertNonce("aaaaaaaaaaaaaaaa; script-src"));
});

test("buildContentSecurityPolicy uses nonce and forbids unsafe-inline on scripts", () => {
  const nonce = "A".repeat(16);
  const policy = buildContentSecurityPolicy(nonce, "https://clerk.fieldacq.org");
  assert.equal(cspOmitsUnsafeInlineScripts(policy), true);
  assert.match(policy, /script-src-elem /);
  assert.match(policy, new RegExp(`'nonce-${nonce}'`));
  assert.doesNotMatch(policy.split("style-src-attr")[0] ?? policy, /script-src[^;]*'unsafe-inline'/);
  assert.match(policy, /https:\/\/js\.stripe\.com/);
});

test("injectHtmlNonce stamps script and style tags without a nonce", () => {
  const nonce = "B".repeat(16);
  const html = `<html><script src="/app.js"></script><script nonce="keep">ok</script><style>body{}</style></html>`;
  const out = injectHtmlNonce(html, nonce);
  assert.match(out, new RegExp(`<script nonce="${nonce}" src="/app.js">`));
  assert.match(out, /<script nonce="keep">/);
  assert.match(out, new RegExp(`<style nonce="${nonce}">`));
});
