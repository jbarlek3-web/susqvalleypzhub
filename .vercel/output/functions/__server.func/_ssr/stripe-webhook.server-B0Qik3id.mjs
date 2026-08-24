import { createHmac, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/stripe-webhook.server-B0Qik3id.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var _0002_stripe_default = "-- Stripe webhook receipts and Pro entitlements (unowned; Stripe ids only, no emails)\ncreate table if not exists stripe_events (\n  id text primary key,\n  type text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate table if not exists stripe_entitlements (\n  id serial primary key,\n  checkout_session_id text,\n  subscription_id text,\n  customer_id text,\n  product_id text,\n  status text not null default 'active',\n  current_period_end timestamptz,\n  updated_at timestamptz not null default now(),\n  created_at timestamptz not null default now()\n);\n\ncreate unique index if not exists stripe_entitlements_session_uidx\n  on stripe_entitlements (checkout_session_id)\n  where checkout_session_id is not null;\n\ncreate unique index if not exists stripe_entitlements_sub_uidx\n  on stripe_entitlements (subscription_id)\n  where subscription_id is not null;\n\ncreate index if not exists stripe_entitlements_customer_idx\n  on stripe_entitlements (customer_id);\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({ "/migrations/0002_stripe.sql": _0002_stripe_default });
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
var STRIPE = {
	productId: "prod_V7yyCZVipuW3um",
	paymentLink: "https://buy.stripe.com/bJefZj3EH2zt9Kx2Bq8k80e",
	buyButtonId: "buy_btn_1U7j2TQ4V3kLu8HPC40RIzcr",
	publishableKey: "pk_live_51THbEKQ4V3kLu8HPv58FqkR8XIh8X93zFTG8R2zTgSgKHixSKgWgc8K5Yj4SkKLKeyYeZBbyYvnTvGW2kzUlZ3Ja00AT7MvGSK",
	scriptSrc: "https://js.stripe.com/v3/buy-button.js",
	webhookPath: "/api/stripe/webhook",
	webhookEvents: [
		"checkout.session.completed",
		"checkout.session.async_payment_succeeded",
		"customer.subscription.updated",
		"customer.subscription.deleted",
		"invoice.paid",
		"invoice.payment_failed"
	]
};
function stripePaymentHref(email) {
	if (!email) return STRIPE.paymentLink;
	const url = new URL(STRIPE.paymentLink);
	url.searchParams.set("prefilled_email", email);
	return url.toString();
}
function stripeSessionIdFromSearch(search) {
	const session = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search).get("session_id")?.trim() ?? "";
	return /^cs_[a-zA-Z0-9_]+$/.test(session) ? session : null;
}
var stripe_webhook_server_exports = /* @__PURE__ */ __exportAll({
	handleStripeWebhook: () => handleStripeWebhook,
	isStripeWebhookConfigured: () => isStripeWebhookConfigured,
	lookupPaidSession: () => lookupPaidSession,
	verifyStripeSignature: () => verifyStripeSignature
});
var SIGN_TOLERANCE_SEC = 300;
function asString(value) {
	if (typeof value === "string" && value.length > 0) return value;
	if (value && typeof value === "object" && "id" in value && typeof value.id === "string") return value.id;
	return null;
}
function asUnixIso(value) {
	if (typeof value !== "number" || !Number.isFinite(value)) return null;
	return (/* @__PURE__ */ new Date(value * 1e3)).toISOString();
}
function webhookSecret() {
	return process.env.STRIPE_WEBHOOK_SECRET?.trim() || "whsec_ztXDedEXH0ZLYXlI7ymsddNkWRqvKNeU";
}
function isStripeWebhookConfigured() {
	return webhookSecret().length > 0;
}
function parseSignatureHeader(header) {
	return {
		timestamp: header.split(",").map((part) => part.trim()).find((part) => part.startsWith("t="))?.slice(2),
		signatures: header.split(",").map((part) => part.trim()).filter((part) => part.startsWith("v1=")).map((part) => part.slice(3))
	};
}
function verifyStripeSignature(payload, header, secret) {
	const { timestamp, signatures } = parseSignatureHeader(header);
	if (!timestamp || signatures.length === 0) throw new Error("Missing Stripe signature");
	const age = Math.abs(Date.now() / 1e3 - Number(timestamp));
	if (!Number.isFinite(age) || age > SIGN_TOLERANCE_SEC) throw new Error("Stripe timestamp expired");
	const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
	const expectedBuf = Buffer.from(expected, "utf8");
	if (!signatures.some((sig) => {
		const got = Buffer.from(sig, "utf8");
		return got.length === expectedBuf.length && timingSafeEqual(got, expectedBuf);
	})) throw new Error("Stripe signature mismatch");
}
function subscriptionStatus(raw) {
	if (raw === "active" || raw === "trialing") return "active";
	if (raw === "past_due") return "past_due";
	if (raw === "canceled" || raw === "unpaid" || raw === "incomplete_expired") return "canceled";
	return raw || "active";
}
async function recordEvent(id, type) {
	return (await (await getSql())`
    insert into stripe_events (id, type) values (${id}, ${type})
    on conflict (id) do nothing
    returning id
  `).length > 0;
}
async function upsertEntitlement(row) {
	const sql = await getSql();
	if (row.checkoutSessionId) {
		if ((await sql`
      update stripe_entitlements
      set
        subscription_id = coalesce(${row.subscriptionId}, subscription_id),
        customer_id = coalesce(${row.customerId}, customer_id),
        product_id = coalesce(${row.productId}, product_id),
        status = ${row.status},
        current_period_end = coalesce(${row.currentPeriodEnd}, current_period_end),
        updated_at = now()
      where checkout_session_id = ${row.checkoutSessionId}
      returning id
    `).length) return;
	}
	if (row.subscriptionId) {
		if ((await sql`
      update stripe_entitlements
      set
        checkout_session_id = coalesce(checkout_session_id, ${row.checkoutSessionId}),
        customer_id = coalesce(${row.customerId}, customer_id),
        product_id = coalesce(${row.productId}, product_id),
        status = ${row.status},
        current_period_end = coalesce(${row.currentPeriodEnd}, current_period_end),
        updated_at = now()
      where subscription_id = ${row.subscriptionId}
      returning id
    `).length) return;
	}
	await sql`
    insert into stripe_entitlements (
      checkout_session_id, subscription_id, customer_id, product_id, status, current_period_end
    ) values (
      ${row.checkoutSessionId}, ${row.subscriptionId}, ${row.customerId}, ${row.productId},
      ${row.status}, ${row.currentPeriodEnd}
    )
  `;
}
async function applyEvent(event) {
	const obj = event.data.object;
	switch (event.type) {
		case "checkout.session.completed":
		case "checkout.session.async_payment_succeeded":
			if (!(obj.payment_status === "paid" || obj.status === "complete" || obj.mode === "subscription")) return;
			await upsertEntitlement({
				checkoutSessionId: asString(obj.id),
				subscriptionId: asString(obj.subscription),
				customerId: asString(obj.customer),
				productId: STRIPE.productId,
				status: "active",
				currentPeriodEnd: null
			});
			return;
		case "customer.subscription.updated":
		case "customer.subscription.deleted":
			await upsertEntitlement({
				checkoutSessionId: null,
				subscriptionId: asString(obj.id),
				customerId: asString(obj.customer),
				productId: STRIPE.productId,
				status: subscriptionStatus(asString(obj.status)),
				currentPeriodEnd: asUnixIso(obj.current_period_end)
			});
			return;
		case "invoice.paid":
			await upsertEntitlement({
				checkoutSessionId: asString(obj.checkout_session),
				subscriptionId: asString(obj.subscription),
				customerId: asString(obj.customer),
				productId: STRIPE.productId,
				status: "active",
				currentPeriodEnd: asUnixIso(obj.period_end)
			});
			return;
		case "invoice.payment_failed":
			await upsertEntitlement({
				checkoutSessionId: asString(obj.checkout_session),
				subscriptionId: asString(obj.subscription),
				customerId: asString(obj.customer),
				productId: STRIPE.productId,
				status: "past_due",
				currentPeriodEnd: asUnixIso(obj.period_end)
			});
			return;
		default: return;
	}
}
async function handleStripeWebhook(request) {
	const secret = webhookSecret();
	if (!secret) return Response.json({ error: "Webhook secret is not configured" }, { status: 503 });
	const payload = await request.text();
	const header = request.headers.get("stripe-signature") ?? "";
	try {
		verifyStripeSignature(payload, header, secret);
	} catch {
		return Response.json({ error: "Invalid signature" }, { status: 400 });
	}
	let event;
	try {
		event = JSON.parse(payload);
	} catch {
		return Response.json({ error: "Invalid payload" }, { status: 400 });
	}
	if (!event?.id || !event.type) return Response.json({ error: "Invalid event" }, { status: 400 });
	if (await recordEvent(event.id, event.type)) await applyEvent(event);
	return Response.json({ received: true });
}
async function lookupPaidSession(sessionId) {
	return (await (await getSql())`
    select status from stripe_entitlements
    where checkout_session_id = ${sessionId}
    limit 1
  `)[0]?.status === "active";
}
//#endregion
export { stripePaymentHref as a, STRIPE as i, isStripeWebhookConfigured as n, stripeSessionIdFromSearch as o, stripe_webhook_server_exports as r, __exportAll as s, handleStripeWebhook as t };
