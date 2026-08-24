import { o as __toESM } from "../_runtime.mjs";
import { b as require_react, y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { M as Download, R as Bookmark, c as Share2, s as Sparkles, z as BookmarkCheck } from "../_libs/lucide-react.mjs";
import { S as getParcel, f as RENO_2026, r as Button, t as AppShell, w as useHub, x as formatFullMoney, y as cn } from "./app-shell-9N-sEoVp.mjs";
import { i as CardTitle, n as CardContent, r as CardHeader, t as Card } from "./card-Dt3hoZGo.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as createServerFn } from "./ssr.mjs";
import { a as string, i as object, r as number, t as array } from "../_libs/zod.mjs";
import { n as Route$1 } from "./router-BvpTSFY9.mjs";
import { t as createSsrRpc } from "./createSsrRpc-C1p7zOu_.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/parcels._id-BAcHf5ne.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Textarea = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
	ref,
	className: cn("flex min-h-24 w-full rounded-md border border-input bg-card px-3 py-2 text-sm placeholder:text-on-surface-variant/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className),
	...props
}));
Textarea.displayName = "Textarea";
var Input = object({
	address: string().max(120),
	municipality: string().max(80),
	county: string().max(40),
	zoning: string().max(12),
	acres: number(),
	constraints: array(string().max(80)).max(8),
	question: string().max(400).optional()
});
var analyzeParcel = createServerFn({ method: "POST" }).validator((input) => Input.parse(input)).handler(createSsrRpc("207f4c58f494037067199d147cf9867d5c710e7b2c76804513f527979a0741c2"));
function ParcelReport() {
	const { id } = Route$1.useParams();
	const parcel = getParcel(id);
	const comments = useHub((s) => s.comments).filter((c) => c.parcelId === id);
	const addComment = useHub((s) => s.addComment);
	const saved = useHub((s) => s.savedIds.includes(id));
	const toggleSaved = useHub((s) => s.toggleSaved);
	const profile = useHub((s) => s.profile);
	const [note, setNote] = (0, import_react.useState)("");
	const [ai, setAi] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [renoSf, setRenoSf] = (0, import_react.useState)(12e3);
	if (!parcel) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Parcel not found." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: "/map",
		className: "text-primary-container",
		children: "Back to map"
	})] });
	const flood = parcel.flood[0];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AppShell, { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-wrap items-start justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-mono text-xs text-on-surface-variant",
					children: [
						"PARCEL ID: ",
						parcel.apn,
						" · LAST UPDATED: 24 OCT 2024"
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-3xl font-semibold",
					children: parcel.address
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-muted-foreground",
					children: [
						parcel.municipality,
						", PA · ",
						parcel.county,
						" County"
					]
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => {
							navigator.clipboard.writeText(window.location.href);
							toast.success("Link copied");
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Share2, { className: "size-3.5" }), " Share"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => toggleSaved(id),
						children: [saved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookmarkCheck, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bookmark, { className: "size-3.5" }), saved ? "Saved" : "Save"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => {
							if (!useHub.getState().canExport()) {
								toast.error("Subscribe to export PDF reports.");
								return;
							}
							window.print();
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-3.5" }), " PDF Report"]
					})
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-3 sm:grid-cols-3",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
					label: "Lot Size",
					value: `${parcel.acres} Acres`,
					sub: `${parcel.sqft.toLocaleString()} Sq. Ft.`
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
					label: "Zoning District",
					value: parcel.zoning,
					sub: parcel.zoningName
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Kpi, {
					label: "Assessed Value",
					value: formatFullMoney(parcel.assessed),
					sub: `Tax Year ${parcel.taxYear}`
				})
			]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-6 grid gap-4 lg:grid-cols-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "lg:col-span-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Zoning & Development Details" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs font-bold uppercase tracking-wider text-on-surface-variant",
						children: "Permitted Uses (selected)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-2 grid gap-1 sm:grid-cols-2",
						children: parcel.permittedUses.map((u) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: "text-sm",
							children: ["· ", u]
						}, u))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dim, {
								l: "Max Height",
								v: `${parcel.maxHeight} ft`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dim, {
								l: "Front",
								v: `${parcel.setbacks.front} ft`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dim, {
								l: "Side",
								v: `${parcel.setbacks.side} ft`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dim, {
								l: "Rear",
								v: `${parcel.setbacks.rear} ft`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dim, {
								l: "Max Coverage",
								v: `${parcel.maxCoverage}%`
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-5 text-xs font-bold uppercase tracking-wider text-on-surface-variant",
						children: "Buildable Area Analysis"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("dl", {
						className: "mt-2 space-y-1 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								l: "Gross Lot Area",
								v: `${parcel.sqft.toLocaleString()} SF`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								l: "Right-of-Way Dedication",
								v: `− ${parcel.rowDedicationSf.toLocaleString()} SF`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								l: "Environmental Buffers",
								v: `− ${parcel.envBufferSf.toLocaleString()} SF`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								l: "Required Setbacks",
								v: `− ${parcel.setbackSf.toLocaleString()} SF`
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
								l: "Net Buildable Area",
								v: `${parcel.buildableSf.toLocaleString()} SF`,
								strong: true
							})
						]
					})
				] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Utilities & Infrastructure" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: "Water. "
						}), parcel.utilities.water] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: "Sewer. "
						}), parcel.utilities.sewer] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: "Electric. "
						}), parcel.utilities.electric] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: "Gas. "
						}), parcel.utilities.gas] })
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Environmental & Risk" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Flood Zone ", /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-semibold",
							children: ["ZONE ", flood]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Steep Slopes",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-semibold",
								children: parcel.slopePct >= 15 ? `${parcel.slopePct}%` : "NONE"
							}),
							" ",
							"(",
							parcel.slopePct,
							"% grade)"
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: ["Historic District ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: parcel.historic ? "YES" : "NO"
						})] })
					]
				})] })]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mt-4 grid gap-4 lg:grid-cols-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Transfer History" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-3",
				children: parcel.transfers.map((t) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-medium",
						children: t.party
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground",
						children: t.date
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-mono",
						children: t.price ? formatFullMoney(t.price) : "—"
					})]
				}, t.date))
			}) })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "2026 Renovation Calculator" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
					className: "text-xs font-semibold uppercase tracking-wider text-on-surface-variant",
					children: "Building SF"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "range",
					min: 1e3,
					max: 4e4,
					step: 500,
					value: renoSf,
					onChange: (e) => setRenoSf(Number(e.target.value)),
					className: "mt-2 w-full accent-primary-container"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-3 font-mono text-sm",
					children: [renoSf.toLocaleString(), " sf"]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full text-left text-xs",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "text-on-surface-variant",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "py-1 font-medium",
								children: "Item"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "font-medium",
								children: "Low"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "font-medium",
								children: "High"
							})
						]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: RENO_2026.filter((r) => r.unit === "sf").map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-outline-variant",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-1.5",
								children: r.item
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "font-mono",
								children: formatFullMoney(r.low * renoSf)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "font-mono",
								children: formatFullMoney(r.high * renoSf)
							})
						]
					}, r.item)) })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-[11px] text-muted-foreground",
					children: "Central PA 2026 contractor ranges. Site work priced separately by acre."
				})
			] })] })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
				className: "flex flex-row items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Grok Feasibility Brief" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					disabled: busy,
					onClick: async () => {
						setBusy(true);
						const res = await analyzeParcel({ data: {
							address: parcel.address,
							municipality: parcel.municipality,
							county: parcel.county,
							zoning: parcel.zoning,
							acres: parcel.acres,
							constraints: parcel.constraints
						} });
						setBusy(false);
						if (!res.ok) {
							toast.error(res.error);
							return;
						}
						setAi(res.text);
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-3.5" }),
						" ",
						busy ? "Analyzing…" : "Ask Grok"
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: ai ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "whitespace-pre-wrap font-sans text-sm leading-relaxed",
				children: ai
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground",
				children: "User-initiated zoning and process brief for this parcel. Not a substitute for municipal counsel."
			}) })]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
			className: "mt-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Internal Team Discussion" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "space-y-3",
				children: comments.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "rounded-md bg-surface-low p-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-sm font-semibold",
						children: [
							c.author,
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-normal text-muted-foreground",
								children: c.at
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm",
						children: c.body
					})]
				}, c.id))
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-3 flex flex-col gap-2",
				onSubmit: (e) => {
					e.preventDefault();
					if (!note.trim()) return;
					addComment(id, profile ? `${profile.firstName} ${profile.lastName}` : "You", note.trim());
					setNote("");
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: note,
					onChange: (e) => setNote(e.target.value),
					placeholder: "Post comment"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "submit",
					className: "self-end",
					children: "Post comment"
				})]
			})] })]
		})
	] });
}
function Kpi({ label, value, sub }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg border border-outline-variant bg-card p-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-[11px] font-bold uppercase tracking-wider text-on-surface-variant",
				children: label
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-1 text-2xl font-semibold",
				children: value
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "text-sm text-muted-foreground",
				children: sub
			})
		]
	});
}
function Dim({ l, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-md bg-surface-low p-2 text-center",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "font-mono text-sm font-semibold",
			children: v
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "text-[10px] uppercase text-on-surface-variant",
			children: l
		})]
	});
}
function Row({ l, v, strong }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex justify-between",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: strong ? "font-semibold" : "",
			children: l
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: strong ? "font-mono font-semibold" : "font-mono",
			children: v
		})]
	});
}
//#endregion
export { ParcelReport as component };
