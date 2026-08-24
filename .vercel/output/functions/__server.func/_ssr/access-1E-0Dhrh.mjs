import { o as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as Button, t as AppShell, w as useHub, y as cn } from "./app-shell-9N-sEoVp.mjs";
import { n as CardContent, t as Card } from "./card-Dt3hoZGo.mjs";
import { t as Input } from "./input-Dmy1aY5S.mjs";
import { t as Label } from "./label-8kOYyLtf.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "../_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/access-1E-0Dhrh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Tabs = Root2;
function TabsList({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
		className: cn("inline-flex h-10 items-center gap-1 rounded-md bg-surface-container p-1 text-on-surface-variant", className),
		...props
	});
}
function TabsTrigger({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
		className: cn("inline-flex h-8 items-center justify-center rounded-sm px-3 text-sm font-medium transition-colors data-[state=active]:bg-card data-[state=active]:text-on-surface data-[state=active]:shadow-sm", className),
		...props
	});
}
var TabsContent = Content;
function Access() {
	const startPreview = useHub((s) => s.startPreview);
	const subscribe = useHub((s) => s.subscribe);
	const nav = useNavigate();
	const [email, setEmail] = (0, import_react.useState)("");
	const [first, setFirst] = (0, import_react.useState)("");
	const [last, setLast] = (0, import_react.useState)("");
	const [org, setOrg] = (0, import_react.useState)("");
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto grid max-w-5xl gap-8 md:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs font-bold uppercase tracking-wider text-on-surface-variant",
				children: "Regional Planning Access"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 text-3xl font-semibold",
				children: "Secure entry for municipal officials, developers, and coordinators"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-muted-foreground",
				children: "Explore the platform with full access for 5 minutes before committing to a subscription."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				className: "mt-6",
				onClick: () => {
					startPreview();
					toast.success("Preview started — 5 minutes");
					nav({ to: "/map" });
				},
				children: "Start One-Time Trial"
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: "in",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "in",
						children: "Sign In"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TabsTrigger, {
						value: "reg",
						children: "Register"
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "in",
						className: "mt-4 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Email Address" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								value: email,
								onChange: (e) => setEmail(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Password" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "password",
								defaultValue: ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "w-full",
								onClick: () => {
									subscribe({
										firstName: "Sarah",
										lastName: "Jenkins",
										email: email || "s.jenkins@county.gov",
										org: "York County Planning"
									});
									toast.success("Signed in");
									nav({ to: "/dashboard" });
								},
								children: "Authenticate Access"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "reg",
						className: "mt-4 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "First Name" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: first,
								onChange: (e) => setFirst(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Last Name" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: last,
								onChange: (e) => setLast(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Municipality / Organization" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: org,
								onChange: (e) => setOrg(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Work Email" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								value: email,
								onChange: (e) => setEmail(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "w-full",
								onClick: () => {
									subscribe({
										firstName: first || "Planner",
										lastName: last || "Account",
										email: email || "planner@susquehanna.gov",
										org: org || "Municipality"
									});
									toast.success("Credentials issued");
									nav({ to: "/dashboard" });
								},
								children: "Request Credentials"
							})
						]
					})
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-4 text-center text-xs text-muted-foreground",
				children: [
					"Need the full platform?",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/subscription",
						className: "underline",
						children: "View Pro"
					})
				]
			})]
		}) })]
	}) });
}
//#endregion
export { Access as component };
