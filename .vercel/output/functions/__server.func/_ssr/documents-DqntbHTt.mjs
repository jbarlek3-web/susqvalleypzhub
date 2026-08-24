import { o as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { A as ExternalLink, D as FileText, E as FolderOpen, I as ChevronDown, M as Download, u as Rows3, y as LayoutList } from "../_libs/lucide-react.mjs";
import { o as DOCUMENTS, r as Button, t as AppShell, w as useHub, y as cn } from "./app-shell-9N-sEoVp.mjs";
import { t as Input } from "./input-Dmy1aY5S.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/documents-DqntbHTt.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var CATS = [
	"Zoning",
	"SALDO",
	"Builder",
	"Codes"
];
var CAT_LABEL = {
	Zoning: "Zoning Ordinances",
	SALDO: "SALDO Documents",
	Builder: "Builder's Docs",
	Codes: "Codes & Standards"
};
var CORE_COUNTIES = [
	"York",
	"Cumberland",
	"Dauphin",
	"Lancaster"
];
function Documents() {
	const [q, setQ] = (0, import_react.useState)("");
	const [county, setCounty] = (0, import_react.useState)("All");
	const [cat, setCat] = (0, import_react.useState)("Zoning");
	const [view, setView] = (0, import_react.useState)("list");
	const [expandAll, setExpandAll] = (0, import_react.useState)(true);
	const [openKeys, setOpenKeys] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const isPro = useHub((s) => s.isPro);
	const previewStartedAt = useHub((s) => s.previewStartedAt);
	const canExport = isPro || previewStartedAt != null && Date.now() - previewStartedAt < 3e5;
	const countyOptions = (0, import_react.useMemo)(() => {
		const counts = /* @__PURE__ */ new Map();
		for (const d of DOCUMENTS) counts.set(d.county, (counts.get(d.county) || 0) + 1);
		const core = CORE_COUNTIES.filter((c) => counts.has(c));
		const rest = [...counts.keys()].filter((c) => !CORE_COUNTIES.includes(c)).sort();
		return [...core, ...rest];
	}, []);
	const catCounts = (0, import_react.useMemo)(() => {
		const counts = {
			Zoning: 0,
			SALDO: 0,
			Builder: 0,
			Codes: 0
		};
		for (const d of DOCUMENTS) {
			if (county !== "All" && d.county !== county) continue;
			counts[d.category] += 1;
		}
		return counts;
	}, [county]);
	const list = (0, import_react.useMemo)(() => DOCUMENTS.filter((d) => d.category === cat).filter((d) => county === "All" || d.county === county).filter((d) => !q.trim() || d.name.toLowerCase().includes(q.toLowerCase()) || d.municipality.toLowerCase().includes(q.toLowerCase()) || d.county.toLowerCase().includes(q.toLowerCase())), [
		q,
		county,
		cat
	]);
	const grouped = (0, import_react.useMemo)(() => {
		const map = /* @__PURE__ */ new Map();
		for (const d of list) {
			const key = `${d.municipality} · ${d.county}`;
			const arr = map.get(key);
			if (arr) arr.push(d);
			else map.set(key, [d]);
		}
		return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
	}, [list]);
	function isOpen(key) {
		if (expandAll) return !openKeys.has(key);
		return openKeys.has(key);
	}
	function toggle(key) {
		setOpenKeys((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-semibold",
			children: "Document Library"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 max-w-2xl text-sm text-muted-foreground",
			children: "Official zoning ordinances, SALDO, building applications, and codes — live municipal PDFs and code books, plus the recovered archive. Every counted file is listed below and opens the original source."
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "Search documents or municipality",
				className: "max-w-sm",
				autoComplete: "off"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				value: county,
				onChange: (e) => setCounty(e.target.value),
				className: "h-10 rounded-md border border-input bg-card px-3 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: "All",
					children: "All counties"
				}), countyOptions.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
					value: c,
					children: c
				}, c))]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex flex-wrap gap-2",
			children: CATS.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => {
					setCat(c);
					setOpenKeys(/* @__PURE__ */ new Set());
				},
				className: cat === c ? "rounded-full bg-primary-container px-3 py-1.5 text-xs font-semibold text-on-primary" : "rounded-full bg-surface-container px-3 py-1.5 text-xs font-semibold",
				children: [
					CAT_LABEL[c],
					" ",
					catCounts[c]
				]
			}, c))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-3 flex flex-wrap items-center justify-between gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-muted-foreground",
				children: [
					"Showing ",
					list.length,
					" ",
					CAT_LABEL[cat].toLowerCase(),
					view === "group" ? ` in ${grouped.length} municipalities` : "",
					county !== "All" ? ` · ${county} County` : "",
					q.trim() ? ` matching “${q.trim()}”` : ""
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					className: "inline-flex items-center gap-1 text-xs font-semibold text-primary-container underline-offset-2 hover:underline",
					onClick: () => setView((v) => v === "list" ? "group" : "list"),
					children: [view === "list" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rows3, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LayoutList, { className: "size-3.5" }), view === "list" ? "Group by municipality" : "Show full list"]
				}), view === "group" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "text-xs font-semibold text-primary-container underline-offset-2 hover:underline",
					onClick: () => {
						setExpandAll((v) => !v);
						setOpenKeys(/* @__PURE__ */ new Set());
					},
					children: expandAll ? "Collapse all" : "Expand all"
				}) : null]
			})]
		}),
		list.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 rounded-lg border border-dashed border-outline-variant bg-card px-5 py-10 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderOpen, { className: "mx-auto size-8 text-on-surface-variant" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm font-medium",
					children: "No documents in this view"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 text-xs text-muted-foreground",
					children: "Try another category, county, or search."
				})
			]
		}) : view === "list" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "mt-4 divide-y divide-outline-variant overflow-hidden rounded-lg border border-outline-variant bg-card",
			children: list.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocRow, {
				d,
				canExport,
				showMuni: true
			}, d.id))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 overflow-hidden rounded-lg border border-outline-variant bg-card",
			children: grouped.map(([muni, docs]) => {
				const open = isOpen(muni);
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "border-b border-outline-variant last:border-b-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: () => toggle(muni),
						className: "flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium hover:bg-surface-low",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex min-w-0 items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate",
								children: muni
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-full bg-surface-container px-2 py-0.5 text-xs font-semibold text-on-surface-variant",
								children: docs.length
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: cn("size-4 shrink-0 text-on-surface-variant transition-transform", open ? "rotate-180" : "") })]
					}), open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "divide-y divide-outline-variant border-t border-outline-variant bg-surface-low/40",
						children: docs.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DocRow, {
							d,
							canExport
						}, d.id))
					}) : null]
				}, muni);
			})
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-8 rounded-lg bg-primary px-5 py-6 text-on-primary",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-lg font-semibold",
					children: "Need access to municipal GIS data?"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-on-primary/80",
					children: "The Property Map tool integrates directly with these zoning ordinances so you can visualize parcel-level data across York, Cumberland, Dauphin, and Lancaster counties."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					className: "mt-4 bg-on-primary text-primary hover:bg-primary-fixed",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/map",
						children: "Open Property Map"
					})
				})
			]
		})
	] });
}
function DocRow({ d, canExport, showMuni = false }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex min-w-0 items-start gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mt-0.5 size-4 shrink-0 text-primary-container" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-medium leading-snug",
					children: d.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs text-muted-foreground",
					children: [
						showMuni ? `${d.municipality} · ${d.county} · ` : "",
						d.kind,
						" · ",
						d.size,
						" · ",
						d.updated,
						d.source === "official" ? " · Official source" : " · Drive archive"
					]
				})]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex shrink-0 gap-2 pl-6 sm:pl-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				size: "sm",
				variant: "outline",
				asChild: true,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: d.url,
					target: "_blank",
					rel: "noreferrer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "size-3.5" }), " Open"]
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				variant: "outline",
				onClick: () => downloadDoc(d, canExport),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), " Download"]
			})]
		})]
	});
}
function downloadDoc(d, canExport) {
	if (!canExport) {
		toast.error("Preview expired. Subscribe to download.");
		return;
	}
	const a = document.createElement("a");
	a.href = d.url;
	a.target = "_blank";
	a.rel = "noreferrer";
	a.click();
	toast.success("Opening original document");
}
//#endregion
export { Documents as component };
