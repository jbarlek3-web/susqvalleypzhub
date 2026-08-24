import { o as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { _ as Map, k as FileDown, p as Plus } from "../_libs/lucide-react.mjs";
import { b as formatAcres, l as PARCELS, m as StatusBadge, r as Button, t as AppShell, w as useHub } from "./app-shell-9N-sEoVp.mjs";
import { n as CardContent, t as Card } from "./card-Dt3hoZGo.mjs";
import { t as Input } from "./input-Dmy1aY5S.mjs";
import { t as Label } from "./label-8kOYyLtf.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as DialogTitle, n as DialogContent, r as DialogHeader, t as Dialog } from "./dialog-C-ARcuEM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-BNQqBVmI.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Dashboard() {
	const projects = useHub((s) => s.projects);
	const save = useHub((s) => s.saveBatchAsProject);
	const selectedIds = useHub((s) => s.selectedIds);
	const [status, setStatus] = (0, import_react.useState)("All");
	const [open, setOpen] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const list = (0, import_react.useMemo)(() => status === "All" ? projects : projects.filter((p) => p.status === status), [projects, status]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-end justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-bold uppercase tracking-wider text-on-surface-variant",
					children: "Overview"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-semibold",
					children: "Project Dashboard"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-1 max-w-xl text-sm text-muted-foreground",
					children: "Manage saved property batches, track status, and generate compliance reports for active developments."
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				onClick: () => setOpen(true),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }), " Create New Project"]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-4 flex flex-wrap gap-2",
			children: [
				"All",
				"Lead",
				"Due Diligence",
				"Permitting",
				"Approved"
			].map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setStatus(s),
				className: status === s ? "rounded-full bg-primary-container px-3 py-1.5 text-xs font-semibold text-on-primary" : "rounded-full bg-surface-container px-3 py-1.5 text-xs font-semibold",
				children: s
			}, s))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3",
			children: list.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "p-5",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-start justify-between gap-2",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusBadge, { status: p.status }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 text-lg font-semibold",
								children: p.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted-foreground",
								children: [
									p.municipality,
									" · ",
									p.county
								]
							})
						] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-4 grid grid-cols-3 gap-2 text-center text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-[10px] uppercase tracking-wider text-on-surface-variant",
								children: "Parcels"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-mono font-semibold",
								children: p.parcelIds.length
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-[10px] uppercase tracking-wider text-on-surface-variant",
								children: "Acreage"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dd", {
								className: "font-mono font-semibold",
								children: [formatAcres(p.acres), " ac"]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("dt", {
								className: "text-[10px] uppercase tracking-wider text-on-surface-variant",
								children: "Modified"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("dd", {
								className: "font-semibold",
								children: p.modified
							})] })
						]
					}),
					p.constraints.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-3 text-xs text-destructive",
						children: ["Constraints: ", p.constraints.join(", ")]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							variant: "outline",
							size: "sm",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/map",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Map, { className: "size-3.5" }), " Open Map"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "outline",
							size: "sm",
							onClick: () => {
								if (!useHub.getState().canExport()) {
									toast.error("Subscribe to export reports.");
									return;
								}
								toast.success("Preparing PDF export…");
								window.print();
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileDown, { className: "size-3.5" }), " Export"]
						})]
					})
				]
			}) }, p.id))
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open,
			onOpenChange: setOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Create New Project" }) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Project name" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					className: "mt-1",
					value: name,
					onChange: (e) => setName(e.target.value)
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs text-muted-foreground",
					children: [
						"Uses the current map selection (",
						selectedIds.length,
						" parcel",
						selectedIds.length === 1 ? "" : "s",
						selectedIds.length ? ` — ${PARCELS.filter((x) => selectedIds.includes(x.id)).map((x) => x.address).join(", ")}` : "",
						")."
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-4 w-full",
					onClick: () => {
						save(name.trim() || "Untitled project");
						toast.success("Project saved");
						setOpen(false);
						setName("");
					},
					children: "Save project"
				})
			] })
		})
	] });
}
//#endregion
export { Dashboard as component };
