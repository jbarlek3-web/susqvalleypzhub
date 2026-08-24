import { y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as COUNTIES, r as Button, t as AppShell, w as useHub } from "./app-shell-9N-sEoVp.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-Dt3hoZGo.mjs";
import { t as Switch } from "./switch-BunC0QtO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notifications-CYr_h-on.js
var import_jsx_runtime = require_jsx_runtime();
function Notifications() {
	const alerts = useHub((s) => s.alerts);
	const mark = useHub((s) => s.markAlertsRead);
	const counties = useHub((s) => s.alertCounties);
	const setCounty = useHub((s) => s.setAlertCounty);
	const freq = useHub((s) => s.alertFreq);
	const setFreq = useHub((s) => s.setAlertFreq);
	const profile = useHub((s) => s.profile);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-wrap items-end justify-between gap-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-semibold",
			children: "Notifications Hub"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Manage regional planning alerts, zoning updates, and subscription preferences."
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
			variant: "outline",
			onClick: mark,
			children: "Mark all as read"
		})]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-6 grid gap-4 lg:grid-cols-3",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3 lg:col-span-2",
			children: alerts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: a.unread ? "border-primary-container/40" : "",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-[11px] font-bold uppercase tracking-wider text-on-surface-variant",
							children: [
								a.kind,
								" · ",
								a.at
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 font-semibold",
							children: a.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: a.body
						}),
						a.kind === "document" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/documents",
							className: "mt-2 inline-block text-sm font-medium text-primary-container",
							children: "Open Library"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/map",
							className: "mt-2 inline-block text-sm font-medium text-primary-container",
							children: "View on Map"
						})
					]
				})
			}, a.id))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Alert Settings" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "space-y-4",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-bold uppercase tracking-wider text-on-surface-variant",
					children: "Delivery frequency"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex flex-col gap-1",
					children: [
						"Immediate",
						"Daily Digest",
						"Weekly"
					].map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => setFreq(f),
						className: freq === f ? "rounded-sm bg-primary-container px-3 py-2 text-left text-sm text-on-primary" : "rounded-sm px-3 py-2 text-left text-sm hover:bg-surface-low",
						children: f
					}, f))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-bold uppercase tracking-wider text-on-surface-variant",
					children: "County filters"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-2 space-y-2",
					children: COUNTIES.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between text-sm",
						children: [
							c,
							" County",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								checked: counties[c],
								onCheckedChange: (v) => setCounty(c, v)
							})
						]
					}, c))
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-xs text-muted-foreground",
					children: [
						"Email delivery active for ",
						profile?.email ?? "planner@susquehanna.gov",
						"."
					]
				})
			]
		})] })]
	})] });
}
//#endregion
export { Notifications as component };
