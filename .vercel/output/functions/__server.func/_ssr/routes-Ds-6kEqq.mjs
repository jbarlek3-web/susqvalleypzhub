import { o as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { v as Link, y as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { F as CircleCheck, H as ArrowRight, N as Database, O as FileStack, _ as Map, b as Layers, l as Search, w as Gavel } from "../_libs/lucide-react.mjs";
import { r as Button, t as AppShell, w as useHub } from "./app-shell-9N-sEoVp.mjs";
import { n as CardContent, t as Card } from "./card-Dt3hoZGo.mjs";
import { t as Input } from "./input-Dmy1aY5S.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Ds-6kEqq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const [q, setQ] = (0, import_react.useState)("");
	const setQuery = useHub((s) => s.setQuery);
	const nav = useNavigate();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "relative overflow-hidden rounded-xl bg-primary px-5 py-12 text-on-primary md:px-12 md:py-16",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "pointer-events-none absolute inset-0 opacity-20",
				style: { backgroundImage: "radial-gradient(circle at 80% 20%, rgb(174 199 247 / 0.4), transparent 40%), linear-gradient(120deg, transparent 40%, rgb(70 102 73 / 0.25))" }
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto max-w-3xl text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "text-3xl font-bold tracking-tight md:text-5xl",
						children: "The Centralized Hub for Susquehanna Valley Planning & Zoning"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mx-auto mt-4 max-w-2xl text-sm text-on-primary/80 md:text-lg",
						children: "Access authoritative, up-to-date zoning codes, property maps, and builder documentation across York, Cumberland, Dauphin, and Lancaster counties."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "mx-auto mt-8 flex max-w-xl flex-col gap-2 sm:flex-row",
						onSubmit: (e) => {
							e.preventDefault();
							setQuery(q);
							nav({ to: "/map" });
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: q,
								onChange: (e) => setQ(e.target.value),
								placeholder: "Search address, APN, or municipality",
								className: "h-12 bg-card pl-9 text-on-surface",
								autoComplete: "off",
								suppressHydrationWarning: true
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							size: "lg",
							className: "h-12 bg-on-primary text-primary hover:bg-primary-fixed",
							children: "Explore Map"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-8 grid grid-cols-3 gap-4 text-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								n: "4",
								l: "Counties"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								n: "150+",
								l: "Municipalities"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Stat, {
								n: "Daily",
								l: "Data Updates"
							})
						]
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-4 flex items-end justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-xl font-semibold",
					children: "Covering 4 Counties"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
					to: "/insights",
					className: "inline-flex items-center gap-1 text-sm font-medium text-primary-container",
					children: ["View Regional Overview ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountyCard, {
						name: "York",
						blurb: "Comprehensive zoning & tax parcel records.",
						to: "/map"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountyCard, {
						name: "Cumberland",
						blurb: "Development tracking and municipal codes.",
						to: "/map"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountyCard, {
						name: "Dauphin",
						blurb: "Interactive parcel layers and historic overlays.",
						to: "/map"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CountyCard, {
						name: "Lancaster",
						blurb: "Agricultural zoning and urban growth boundaries.",
						to: "/map"
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-bold uppercase tracking-wider text-on-surface-variant",
					children: "Platform Capabilities"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-1 text-2xl font-semibold",
					children: "Integrated Tools for Planners, Developers, and Municipalities"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 grid gap-4 md:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feature, {
							icon: Layers,
							title: "Interactive Property Map",
							body: "Visualize zoning districts, floodplain overlays, and individual parcel boundaries across county lines.",
							href: "/map",
							cta: "Launch GIS Map"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feature, {
							icon: Gavel,
							title: "Unified Zoning Codes",
							body: "Search and cross-reference municipal zoning ordinances in a standardized format. Track amendments instantly.",
							href: "/zoning",
							extra: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 rounded-md bg-surface-low p-3 font-mono text-xs",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Sec 402.1 — R-1 Residential" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "text-on-surface-variant",
									children: "Max Height: 35ft · Min Lot: 10,000 sqft"
								})]
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feature, {
							icon: FileStack,
							title: "Builder Documentation",
							body: "Access standardized application forms, fee schedules, and review checklists for municipal submissions.",
							href: "/documents"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Feature, {
							icon: Database,
							title: "API & Data Export",
							body: "Export comprehensive parcel reports in CSV, PDF, or GeoJSON. Integrate planning data into your firm's systems.",
							href: "/guide",
							cta: "View Documentation"
						})
					]
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "mt-12 grid items-center gap-8 rounded-xl border border-outline-variant bg-card p-6 md:grid-cols-2 md:p-10",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-2xl font-semibold",
					children: "Professional Access"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-muted-foreground",
					children: "Unlock the full potential of regional data. Join municipal officials, developers, and surveyors who rely on the Hub for integrated land-use intelligence."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "mt-4 space-y-2 text-sm",
					children: [
						"Unlimited parcel data exports and historical queries.",
						"Advanced cross-county zoning comparison tools.",
						"Automated email alerts for zoning code amendments."
					].map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mt-0.5 size-4 text-secondary" }),
							" ",
							t
						]
					}, t))
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-primary-container/30",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "text-xs font-bold uppercase tracking-wider text-secondary",
							children: "Most Popular"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-1 text-lg font-semibold",
							children: "Pro Subscription"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-2 flex items-end gap-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-4xl font-bold",
								children: "$10"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "mb-1 text-muted-foreground",
								children: "/mo"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "Billed annually at $120/year."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "mt-4 w-full",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/subscription",
								children: "Subscribe Now"
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-xs text-muted-foreground",
							children: "Municipal accounts eligible for group licensing."
						})
					]
				})
			})]
		})
	] });
}
function Stat({ n, l }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-2xl font-bold md:text-3xl",
		children: n
	}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "text-xs uppercase tracking-wider text-on-primary/70",
		children: l
	})] });
}
function CountyCard({ name, blurb, to }) {
	const setCounty = useHub((s) => s.setCounty);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to,
		onClick: () => setCounty(name),
		className: "rounded-lg border border-outline-variant bg-card p-4 transition-colors hover:border-primary-container",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center gap-2 font-semibold",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "size-4 text-primary-container" }),
				" ",
				name
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm leading-snug text-muted-foreground",
			children: blurb
		})]
	});
}
function Feature({ icon: Icon, title, body, href, cta, extra }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-outline-variant bg-card p-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-6 text-primary-container" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "mt-3 text-lg font-semibold",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted-foreground",
				children: body
			}),
			extra,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: href,
				className: "mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary-container",
				children: [
					cta ?? "Open",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })
				]
			})
		]
	});
}
//#endregion
export { Home as component };
