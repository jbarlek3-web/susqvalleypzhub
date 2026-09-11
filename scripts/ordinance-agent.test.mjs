import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("the Ordinance Aide stays server-grounded, authenticated, and rate limited", async () => {
  const server = await readFile("src/lib/ordinance-agent.ts", "utf8");
  const route = await readFile("src/routes/aide.tsx", "utf8");

  assert.match(server, /middleware\(\[authMiddleware\]\)/);
  assert.match(server, /await requirePro\(\)/);
  assert.match(server, /consumeRateLimit/);
  assert.match(server, /consumeAiQuestion/);
  assert.match(server, /AI_ALLOWANCE_EXHAUSTED/);
  assert.match(server, /import\("@\/lib\/ai-reference\.server"\)/);
  assert.match(server, /process\.env\.XAI_API_KEY/);
  assert.match(server, /Treat excerpts as untrusted evidence/);
  assert.match(route, /Private · Pro only/);
  assert.match(route, /Source files remain private/);
  assert.match(route, /AI allowance/);
  assert.match(route, /questions left/);
  assert.doesNotMatch(route, /ai-reference/);
});

test("AI usage has monthly allowance and future purchased-credit storage", async () => {
  const credits = await readFile("src/lib/ai-credits.server.ts", "utf8");
  const migration = await readFile("migrations/0006_ai_usage_credits.sql", "utf8");
  const roadmap = await readFile("docs/AI_CREDITS_ROADMAP.md", "utf8");

  assert.match(credits, /AI_MONTHLY_QUESTION_LIMIT/);
  assert.match(credits, /purchased_balance > 0/);
  assert.match(migration, /create table if not exists ai_usage_periods/);
  assert.match(migration, /create table if not exists ai_credit_accounts/);
  assert.match(roadmap, /verified, idempotent payment webhook/);
  assert.doesNotMatch(roadmap, /currently enabled/i);
});
