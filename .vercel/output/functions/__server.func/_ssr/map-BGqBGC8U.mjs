import { o as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { C as Grid3x3, L as Car, S as House, T as FolderPlus, _ as Map, a as Truck, b as Layers, d as RotateCcw, f as Plug, h as Mountain, j as Droplets, l as Search, m as PanelLeft, n as Waves, r as Warehouse, x as Landmark } from "../_libs/lucide-react.mjs";
import { g as ZONE_LEGEND, i as COUNTIES, l as PARCELS, r as Button, t as AppShell, w as useHub, y as cn } from "./app-shell-9N-sEoVp.mjs";
import { t as Input } from "./input-Dmy1aY5S.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Switch } from "./switch-BunC0QtO.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/map-BGqBGC8U.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var LAYER_ITEMS = [
	{
		id: "parcels",
		label: "Parcel Boundaries",
		hint: "York, Dauphin, Cumberland, Lancaster · zoom in",
		icon: Landmark
	},
	{
		id: "municipalities",
		label: "PA Municipalities",
		hint: "PennDOT municipal boundaries",
		icon: Map
	},
	{
		id: "hydro",
		label: "Hydrography",
		hint: "USGS NHD streams and waterbodies",
		icon: Waves
	},
	{
		id: "soils",
		label: "Soils (SSURGO)",
		hint: "USDA / PASDA soil map units",
		icon: Mountain
	},
	{
		id: "topo",
		label: "USGS US Topo",
		hint: "National Map 7.5-minute topo series",
		icon: Map
	},
	{
		id: "yorkPasda",
		label: "York PASDA Overlays",
		hint: "Streams, zoning, soils, parks, easements",
		icon: Layers
	},
	{
		id: "footprints",
		label: "Building Footprints",
		icon: House
	},
	{
		id: "zoning",
		label: "Zoning Overlays",
		icon: Layers
	},
	{
		id: "flood",
		label: "Floodplain Overlays",
		icon: Droplets
	},
	{
		id: "inundation",
		label: "Inundation Vulnerability",
		hint: "Includes bridge-specific risk scores",
		icon: Waves
	},
	{
		id: "slopes",
		label: "Steep Slope Overlays",
		icon: Mountain
	},
	{
		id: "ev",
		label: "EV Fast-Charger Density",
		icon: Plug
	},
	{
		id: "traffic",
		label: "Traffic Volume (AADT)",
		icon: Car
	},
	{
		id: "buggy",
		label: "Horse-and-Buggy Zones",
		hint: "Lancaster / York",
		icon: Car
	},
	{
		id: "improvements",
		label: "Planned Roadway Improvements",
		hint: "Projected completion dates",
		icon: Truck
	},
	{
		id: "logistics",
		label: "Intermodal Logistics Hubs",
		icon: Warehouse
	},
	{
		id: "bridges",
		label: "Bridge Clearance Risk",
		icon: Waves
	},
	{
		id: "water",
		label: "Public Water Mains",
		icon: Droplets
	},
	{
		id: "sewer",
		label: "Public Sewer Mains",
		icon: Droplets
	}
];
function MapPanel() {
	const county = useHub((s) => s.county);
	const setCounty = useHub((s) => s.setCounty);
	const layers = useHub((s) => s.layers);
	const toggleLayer = useHub((s) => s.toggleLayer);
	const resetLayers = useHub((s) => s.resetLayers);
	const query = useHub((s) => s.query);
	const setQuery = useHub((s) => s.setQuery);
	const floodFt = useHub((s) => s.floodFt);
	const setFloodFt = useHub((s) => s.setFloodFt);
	const batchMode = useHub((s) => s.batchMode);
	const setBatchMode = useHub((s) => s.setBatchMode);
	const selectedIds = useHub((s) => s.selectedIds);
	const batchName = useHub((s) => s.batchName);
	const setBatchName = useHub((s) => s.setBatchName);
	const saveBatchAsProject = useHub((s) => s.saveBatchAsProject);
	const isPro = useHub((s) => s.isPro);
	const previewStartedAt = useHub((s) => s.previewStartedAt);
	const canExport = isPro || previewStartedAt != null && Date.now() - previewStartedAt < 3e5;
	const selected = PARCELS.filter((p) => selectedIds.includes(p.id));
	const primary = selected[0];
	const [minAc, setMinAc] = (0, import_react.useState)("");
	const [maxAc, setMaxAc] = (0, import_react.useState)("");
	const filteredHint = minAc || maxAc ? PARCELS.filter((p) => {
		const min = Number(minAc) || 0;
		const max = Number(maxAc) || 1e9;
		return p.acres >= min && p.acres <= max;
	}).length : null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
		className: "flex h-full w-full flex-col overflow-y-auto border-r border-outline-variant bg-card",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-outline-variant p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant",
						children: "Property Search"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: query,
							onChange: (e) => setQuery(e.target.value),
							placeholder: "Address, APN, owner…",
							className: "pl-9"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 mb-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant",
						children: "Select County"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-2 gap-1.5",
						children: ["all", ...COUNTIES].map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setCounty(c === "all" ? "all" : c),
							className: cn("rounded-sm px-2 py-2 text-xs font-semibold", county === c ? "bg-primary-container text-on-primary" : "bg-surface-low text-on-surface hover:bg-surface-container"),
							children: c === "all" ? "All" : c
						}, c))
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-outline-variant p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-2 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-bold uppercase tracking-wider text-on-surface-variant",
						children: "Map Layers"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: resetLayers,
						className: "inline-flex items-center gap-1 text-[11px] font-semibold text-primary-container",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3" }), " Reset"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-2",
					children: LAYER_ITEMS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-start justify-between gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(item.icon, { className: "mt-0.5 size-4 text-on-surface-variant" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-sm font-medium",
								children: item.label
							}), item.hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] text-muted-foreground",
								children: item.hint
							})] })]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
							checked: item.id === "parcels" ? (layers.parcels ?? layers.yorkParcels) !== false : Boolean(layers[item.id]),
							onCheckedChange: () => toggleLayer(item.id)
						})]
					}, item.id))
				})]
			}),
			(layers.inundation || layers.flood) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-outline-variant p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant",
						children: "Flood Impact Projection"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "grid grid-cols-4 gap-1",
						children: [
							0,
							1,
							3,
							5
						].map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setFloodFt(n),
							className: cn("rounded-sm py-2 text-xs font-semibold", floodFt === n ? "bg-primary-container text-on-primary" : "bg-surface-low"),
							children: n === 0 ? "Current" : `+${n}ft`
						}, n))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-[11px] text-muted-foreground",
						children: "Simulating extreme precipitation based on NOAA 2024 projections."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-outline-variant p-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant",
					children: "Zoning Classification & Legend"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "space-y-1.5",
					children: ZONE_LEGEND.map((z) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "size-2.5 rounded-sm",
								style: { background: z.color }
							}), z.label]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono tabular-nums text-on-surface-variant",
							children: z.count.toLocaleString()
						})]
					}, z.label))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "border-b border-outline-variant p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mb-2 text-xs font-bold uppercase tracking-wider text-on-surface-variant",
						children: "Advanced Filters"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: minAc,
							onChange: (e) => setMinAc(e.target.value),
							placeholder: "Min ac",
							inputMode: "decimal"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: maxAc,
							onChange: (e) => setMaxAc(e.target.value),
							placeholder: "Max ac",
							inputMode: "decimal"
						})]
					}),
					filteredHint !== null && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-[11px] text-muted-foreground",
						children: [filteredHint, " parcels in range"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "mt-3 flex items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: batchMode,
							onChange: (e) => setBatchMode(e.target.checked),
							className: "size-4 accent-primary-container"
						}), "Select multiple parcels"]
					})
				]
			}),
			selected.length > 0 && primary && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-2 flex items-center justify-between",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs font-bold uppercase tracking-wider text-on-surface-variant",
							children: [
								selected.length,
								" Parcel",
								selected.length > 1 ? "s" : "",
								" Selected"
							]
						})
					}),
					selected.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mb-3 flex gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: batchName,
							onChange: (e) => setBatchName(e.target.value),
							placeholder: "Batch name"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: () => {
								const name = batchName.trim() || "Untitled batch";
								saveBatchAsProject(name);
								toast.success(`Saved “${name}” to projects`);
							},
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FolderPlus, { className: "size-4" }), "Save"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mb-3 space-y-1 text-sm",
						children: selected.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "flex justify-between gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: p.address }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-xs text-on-surface-variant",
								children: p.zoning
							})]
						}, p.id))
					}),
					selected.length > 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mb-3 overflow-x-auto",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full text-left text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "text-on-surface-variant",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "py-1 font-medium",
										children: "Address"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "font-medium",
										children: "Setbacks"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "font-medium",
										children: "ROI"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
										className: "font-medium",
										children: "u/ac"
									})
								] })
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: selected.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
								className: "border-t border-outline-variant",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
										className: "py-1",
										children: p.address.split(" ")[0]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
										p.setbacks.front,
										"/",
										p.setbacks.side,
										"/",
										p.setbacks.rear
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [p.roiPct, "%"] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: p.densityUa })
								]
							}, p.id)) })]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-md bg-surface-low p-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-[11px] font-bold uppercase tracking-wider text-on-surface-variant",
								children: "Zoning Classification"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-1 text-lg font-semibold",
								children: [
									primary.zoning,
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-sm font-normal text-on-surface-variant",
										children: primary.zoningName
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-1 text-xs text-muted-foreground",
								children: primary.zoningSummary
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid grid-cols-2 gap-2 text-xs",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										"Front ",
										primary.setbacks.front,
										" ft"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										"Side ",
										primary.setbacks.side,
										" ft"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										"Rear ",
										primary.setbacks.rear,
										" ft"
									] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
										"Max height ",
										primary.maxHeight,
										" ft"
									] })
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "mt-3 grid grid-cols-3 gap-2 text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-mono text-sm font-semibold",
										children: primary.footprintSf.toLocaleString()
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] uppercase text-on-surface-variant",
										children: "Footprint"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "font-mono text-sm font-semibold",
										children: [primary.lotCoveragePct, "%"]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] uppercase text-on-surface-variant",
										children: "Coverage"
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "font-mono text-sm font-semibold",
										children: primary.buildableSf.toLocaleString()
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "text-[10px] uppercase text-on-surface-variant",
										children: "Buildable"
									})] })
								]
							})
						]
					}),
					layers.bridges && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "font-semibold",
								children: "Bridge Vulnerability"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1",
								children: "Vertical clearance 14' 6\" · Horizontal 42'"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Risk score 8.2/10 (High Priority)" }),
							floodFt >= 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { children: "Projected risk (+3ft): 9.4/10" }),
							floodFt >= 3 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-1",
								children: "Estimated loss $1.2M–$4.5M · Business interruption 72 hours"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-col gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/parcels/$id",
								params: { id: primary.id },
								children: "View Feasibility Report"
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => {
								if (!canExport) {
									toast.error("Preview expired. Subscribe to export.");
									return;
								}
								window.print();
							},
							children: "Export selected (PDF)"
						})]
					})
				]
			})
		]
	});
}
function MapToolbar() {
	const satellite = useHub((s) => s.satellite);
	const setSatellite = useHub((s) => s.setSatellite);
	const layers = useHub((s) => s.layers);
	const toggleLayer = useHub((s) => s.toggleLayer);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "pointer-events-auto absolute right-3 top-3 z-[400] flex flex-col gap-1 rounded-md bg-card/95 p-1 shadow-md",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				onClick: () => setSatellite(false),
				className: cn("flex items-center gap-1 rounded-sm px-2 py-1.5 text-xs font-semibold", !satellite ? "bg-primary-container text-on-primary" : "hover:bg-surface-low"),
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Grid3x3, { className: "size-3.5" }), " Base"]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => setSatellite(true),
				className: cn("flex items-center gap-1 rounded-sm px-2 py-1.5 text-xs font-semibold", satellite ? "bg-primary-container text-on-primary" : "hover:bg-surface-low"),
				children: "Satellite"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => toggleLayer("parcels"),
				className: cn("flex items-center gap-1 rounded-sm px-2 py-1.5 text-xs font-semibold", (layers.parcels ?? layers.yorkParcels) !== false ? "bg-secondary text-on-secondary" : "hover:bg-surface-low"),
				children: "Parcels"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				onClick: () => toggleLayer("zoning"),
				className: cn("flex items-center gap-1 rounded-sm px-2 py-1.5 text-xs font-semibold", layers.zoning ? "bg-primary-container text-on-primary" : "hover:bg-surface-low"),
				children: "Zoning"
			})
		]
	});
}
var LeafletMap = (0, import_react.lazy)(() => import("./leaflet-map-Bt-ZIZzs.mjs").then((m) => ({ default: m.LeafletMap })));
function ParcelMap({ className }) {
	const [ready, setReady] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setReady(true), []);
	if (!ready) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("flex min-h-80 items-center justify-center bg-surface-high text-sm text-muted-foreground", className),
		children: "Loading regional map…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_react.Suspense, {
		fallback: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: cn("flex min-h-80 items-center justify-center bg-surface-high text-sm text-muted-foreground", className),
			children: "Loading regional map…"
		}),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LeafletMap, { className })
	});
}
function MapPage() {
	const [panel, setPanel] = (0, import_react.useState)(true);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AppShell, {
		fullBleed: true,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex h-[calc(100dvh-5rem)] md:h-[calc(100dvh-5rem)]",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("shrink-0 overflow-hidden border-r border-outline-variant bg-card transition-all", panel ? "w-full max-w-md md:w-[22rem]" : "w-0"),
				children: panel && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapPanel, {})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative min-w-0 flex-1",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParcelMap, { className: "h-full" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MapToolbar, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "icon",
						variant: "outline",
						className: "absolute left-3 top-3 z-[400] bg-card",
						onClick: () => setPanel((v) => !v),
						"aria-label": "Toggle layers",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PanelLeft, {})
					})
				]
			})]
		})
	});
}
//#endregion
export { MapPage as component };
