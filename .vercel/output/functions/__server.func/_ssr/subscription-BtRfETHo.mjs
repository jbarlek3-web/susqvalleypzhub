import { o as __toESM } from "../_runtime.mjs";
import { a as Trigger2, b as require_react, i as Root2, n as Header, r as Item, t as Content2, y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { d as useRouterState, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as ExternalLink, F as CircleCheck, I as ChevronDown, v as Lock } from "../_libs/lucide-react.mjs";
import { r as Button, t as AppShell, w as useHub, y as cn } from "./app-shell-9N-sEoVp.mjs";
import { n as CardContent, t as Card } from "./card-Dt3hoZGo.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as createServerFn } from "./ssr.mjs";
import { a as string, i as object } from "../_libs/zod.mjs";
import { a as stripePaymentHref, i as STRIPE, o as stripeSessionIdFromSearch } from "./stripe-webhook.server-B0Qik3id.mjs";
import { t as createSsrRpc } from "./createSsrRpc-C1p7zOu_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/subscription-BtRfETHo.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function StripeBuyButton() {
	const hostRef = (0, import_react.useRef)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const existing = document.querySelector(`script[src="${STRIPE.scriptSrc}"]`);
		if (customElements.get("stripe-buy-button")) {
			setReady(true);
			return;
		}
		const script = existing ?? Object.assign(document.createElement("script"), {
			src: STRIPE.scriptSrc,
			async: true
		});
		const onLoad = () => setReady(true);
		script.addEventListener("load", onLoad);
		if (!existing) document.body.appendChild(script);
		if (customElements.get("stripe-buy-button")) setReady(true);
		return () => script.removeEventListener("load", onLoad);
	}, []);
	(0, import_react.useEffect)(() => {
		const host = hostRef.current;
		if (!ready || !host) return;
		host.replaceChildren();
		const button = document.createElement("stripe-buy-button");
		button.setAttribute("buy-button-id", STRIPE.buyButtonId);
		button.setAttribute("publishable-key", STRIPE.publishableKey);
		host.appendChild(button);
	}, [ready]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative flex min-h-12 w-full justify-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			ref: hostRef,
			className: ready ? "w-full max-w-sm" : "sr-only"
		}), !ready && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "h-12 w-full max-w-sm animate-pulse rounded-md bg-muted",
			"aria-hidden": true
		})]
	});
}
var Accordion = Root2;
function AccordionItem({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Item, {
		className: cn("border-b border-outline-variant", className),
		...props
	});
}
function AccordionTrigger({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Header, {
		className: "flex",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Trigger2, {
			className: cn("flex flex-1 items-center justify-between py-4 text-left text-sm font-medium hover:underline [&[data-state=open]>svg]:rotate-180", className),
			...props,
			children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 shrink-0 text-on-surface-variant transition-transform" })]
		})
	});
}
function AccordionContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
		className: cn("overflow-hidden text-sm text-muted-foreground", className),
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pb-4",
			children
		})
	});
}
var Input = object({ sessionId: string().regex(/^cs_[a-zA-Z0-9_]+$/).max(255) });
var confirmCheckout = createServerFn({ method: "POST" }).validator((input) => Input.parse(input)).handler(createSsrRpc("b01695d343379842625bd1402efa65e533666bc4f1903c7ca8c5787c15f4f6a8"));
function Subscription() {
	const subscribe = useHub((s) => s.subscribe);
	const isPro = useHub((s) => s.isPro);
	const profile = useHub((s) => s.profile);
	const search = useRouterState({ select: (s) => s.location.searchStr });
	const [confirming, setConfirming] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		const sessionId = stripeSessionIdFromSearch(search);
		if (!sessionId || useHub.getState().isPro) return;
		let cancelled = false;
		setConfirming(true);
		(async () => {
			for (let i = 0; i < 8; i += 1) {
				try {
					const result = await confirmCheckout({ data: { sessionId } });
					if (cancelled) return;
					if (result.paid) {
						subscribe({
							firstName: profile?.firstName || "Pro",
							lastName: profile?.lastName || "Subscriber",
							email: profile?.email || "",
							org: profile?.org || "Field Acq"
						});
						toast.success("Payment confirmed. Pro access is active.");
						setConfirming(false);
						return;
					}
				} catch {}
				await new Promise((r) => setTimeout(r, 1500));
				if (cancelled) return;
			}
			setConfirming(false);
			toast.message("Payment is processing. Pro unlocks as soon as Stripe confirms.");
		})();
		return () => {
			cancelled = true;
		};
	}, [
		search,
		subscribe,
		profile
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "grid items-start gap-8 lg:grid-cols-2",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-3xl font-semibold",
				children: "Susquehanna Valley Planning Hub Pro"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-muted-foreground",
				children: "Unlock comprehensive regional zoning data. Unlimited parcel lookups, full zoning details, SALDO downloads, and four-county coverage for a single monthly fee."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-2 text-sm",
				children: [
					"Unlimited parcel data lookups",
					"Full zoning details & historical ordinances",
					"Unlimited SALDO document downloads",
					"Complete multi-county coverage"
				].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex gap-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-secondary" }),
						" ",
						t
					]
				}, t))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "mt-6 max-w-sm",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-sm font-semibold",
							children: "Professional Plan"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 flex items-end gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-4xl font-bold",
								children: "$10"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mb-1 text-muted-foreground",
								children: "/ month"
							})]
						}),
						isPro && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm font-medium text-secondary",
							children: "Pro access is active on this device."
						})
					]
				})
			})
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
			className: "p-6",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-lg font-semibold",
				children: "Secure Checkout"
			}), isPro ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 rounded-md bg-secondary-container p-4 text-sm text-on-secondary-container",
				children: "You are subscribed. Parcel exports, SALDO downloads, and full zoning tools are unlocked on this device."
			}) : confirming ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-4 text-sm text-muted-foreground",
				children: "Confirming your Stripe payment…"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground",
					children: "Checkout is processed by Stripe. Card details never touch this app. Pro unlocks after Stripe confirms the payment."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-5",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StripeBuyButton, {})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative my-5 text-center text-xs font-semibold uppercase tracking-wider text-on-surface-variant",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "relative z-10 bg-card px-2",
						children: "or"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute inset-x-0 top-1/2 h-px bg-outline-variant" })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "w-full",
					size: "lg",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: stripePaymentHref(profile?.email),
						target: "_blank",
						rel: "noreferrer",
						children: ["Continue to Stripe Checkout", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, {})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-3.5" }), "Payments secured by Stripe"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-3 text-center text-xs text-muted-foreground",
					children: [
						"By subscribing you agree to the",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/terms",
							className: "underline",
							children: "Terms"
						}),
						" ",
						"and",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/privacy",
							className: "underline",
							children: "Privacy Policy"
						}),
						". Recurring $10.00 / month."
					]
				})
			] })]
		}) })]
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Accordion, {
		type: "single",
		collapsible: true,
		className: "mt-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionItem, {
				value: "u",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionTrigger, { children: "How frequently is parcel data updated?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionContent, { children: "Core parcel geometries and ownership data are updated monthly with county GIS departments. Zoning amendments are integrated within 72 hours of municipal publication." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionItem, {
				value: "c",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionTrigger, { children: "Can I cancel my subscription at any time?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionContent, { children: "Yes. Cancel from your Stripe billing portal or email admin@fieldacq.com. You retain Pro access until the end of the current billing cycle. No cancellation fees." })]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AccordionItem, {
				value: "s",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionTrigger, { children: "Is my payment information secure?" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AccordionContent, { children: "Yes. All card data is processed by Stripe. This app never sees or stores your card number, CVC, or expiration date. Payment confirmation is received through Stripe webhooks." })]
			})
		]
	})] });
}
//#endregion
export { Subscription as component };
