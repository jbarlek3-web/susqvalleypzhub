import { o as __toESM } from "../_runtime.mjs";
import { b as require_react, d as require_react_dom, y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { _ as ZONE_META, a as COUNTY_CENTERS, l as PARCELS, n as BRIDGES, s as IMPROVEMENTS, w as useHub, y as cn } from "./app-shell-9N-sEoVp.mjs";
import { c as require_leaflet_src } from "../_libs/leaflet+react-leaflet__core.mjs";
import { a as ImageOverlay, c as useMap, i as MapContainer, n as Popup, o as GeoJSON, r as Polygon, s as CircleMarker, t as TileLayer } from "../_libs/react-leaflet.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leaflet-map-Bt-ZIZzs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var import_leaflet_src = /* @__PURE__ */ __toESM(require_leaflet_src());
var import_react_dom = /* @__PURE__ */ __toESM(require_react_dom());
var amp = "&";
function esc(value) {
	return String(value ?? "—").replaceAll("&", `${amp}amp;`).replaceAll("<", `${amp}lt;`).replaceAll(">", `${amp}gt;`).replaceAll("\"", `${amp}quot;`);
}
function money(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value.toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0
	});
	const n = Number(value);
	if (Number.isFinite(n) && n > 0) return n.toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0
	});
	return esc(value);
}
function acres(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value.toFixed(3);
	const n = Number(value);
	if (Number.isFinite(n)) return n.toFixed(3);
	return esc(value);
}
var PARCEL_SERVICES = [
	{
		county: "York",
		title: "York County Parcel",
		source: "York County Planning Commission",
		url: "https://arcweb1.ycpc.org/server/rest/services/OPEN_DATA/Parcels/FeatureServer/0",
		fields: "PIDN,PROPADR,OWNER_FULL,ACRES,DISTRICT,CLASS,SCHOOL_DIS,APRTOTAL",
		maxRecords: 1500,
		extent: {
			west: -77.15,
			south: 39.71,
			east: -76.22,
			north: 40.23
		},
		popup: (p) => `
      <div class="min-w-48">
        <div class="text-[10px] font-bold uppercase tracking-wider">York County Parcel</div>
        <div class="font-semibold">${esc(p.PROPADR)}</div>
        <div class="text-xs">PIDN ${esc(p.PIDN)}</div>
        <div class="mt-1 text-xs">${esc(p.OWNER_FULL)}</div>
        <div class="mt-1 text-xs">${acres(p.ACRES)} ac · Class ${esc(p.CLASS)} · Dist ${esc(p.DISTRICT)}</div>
        <div class="text-xs">Appraised ${money(p.APRTOTAL)}</div>
      </div>`
	},
	{
		county: "Dauphin",
		title: "Dauphin County Parcel",
		source: "Dauphin County GIS",
		url: "https://services2.arcgis.com/EEtiX55QzkHKYQKY/arcgis/rest/services/DC_Parcels/FeatureServer/0",
		fields: "PID,MUNICIPALI,house_numb,street_nam,street_suf,last_name,first_name,acres,land,building,cleangrn",
		maxRecords: 1500,
		extent: {
			west: -77.04,
			south: 40.11,
			east: -76.52,
			north: 40.67
		},
		popup: (p) => {
			const addr = [
				p.house_numb,
				p.street_nam,
				p.street_suf
			].filter(Boolean).join(" ");
			const owner = [p.first_name, p.last_name].filter(Boolean).join(" ");
			return `
      <div class="min-w-48">
        <div class="text-[10px] font-bold uppercase tracking-wider">Dauphin County Parcel</div>
        <div class="font-semibold">${esc(addr || p.PID)}</div>
        <div class="text-xs">PID ${esc(p.PID)} · ${esc(p.MUNICIPALI)}</div>
        <div class="mt-1 text-xs">${esc(owner)}</div>
        <div class="mt-1 text-xs">${acres(p.acres)} ac${p.cleangrn === "Y" ? " · Clean and Green" : ""}</div>
        <div class="text-xs">Land ${money(p.land)} · Bldg ${money(p.building)}</div>
      </div>`;
		}
	},
	{
		county: "Cumberland",
		title: "Cumberland County Parcel",
		source: "Cumberland County GIS / PASDA",
		url: "https://mapservices.pasda.psu.edu/server/rest/services/pasda/CumberlandCounty/MapServer/4",
		fields: "PID,SCHOOL_DIS,TOTALTAX,COUNTYTAX,MUNICIPALT,SCHOOLTAX,SITUS_ZIP,VISION_URL",
		maxRecords: 1e3,
		extent: {
			west: -77.48,
			south: 39.98,
			east: -76.93,
			north: 40.38
		},
		popup: (p) => `
      <div class="min-w-48">
        <div class="text-[10px] font-bold uppercase tracking-wider">Cumberland County Parcel</div>
        <div class="font-semibold">PID ${esc(p.PID)}</div>
        <div class="text-xs">School ${esc(p.SCHOOL_DIS)} · ZIP ${esc(p.SITUS_ZIP)}</div>
        <div class="mt-1 text-xs">Total tax ${money(p.TOTALTAX)}</div>
        ${p.VISION_URL ? `<div class="mt-1 text-xs"><a href="${esc(p.VISION_URL)}" target="_blank" rel="noreferrer">Assessment record</a></div>` : ""}
      </div>`
	},
	{
		county: "Lancaster",
		title: "Lancaster County Parcel",
		source: "Lancaster County GIS / PASDA",
		url: "https://mapservices.pasda.psu.edu/server/rest/services/pasda/LancasterCounty/MapServer/21",
		fields: "ACCOUNT",
		maxRecords: 1e3,
		extent: {
			west: -76.61,
			south: 39.71,
			east: -75.87,
			north: 40.26
		},
		popup: (p) => `
      <div class="min-w-48">
        <div class="text-[10px] font-bold uppercase tracking-wider">Lancaster County Parcel</div>
        <div class="font-semibold">Account ${esc(p.ACCOUNT)}</div>
        <div class="text-xs">Lancaster County tax parcel boundary</div>
      </div>`
	}
];
var MUNICIPALITIES = {
	title: "PA Municipality Boundaries",
	source: "PennDOT / PASDA",
	url: "https://mapservices.pasda.psu.edu/server/rest/services/pasda/PennDOT/MapServer/10/query?" + new URLSearchParams({
		where: "FIPS_COUNT in('133','041','043','071')",
		outFields: "MUNICIPAL1,CLASS_OF_M,COUNTY_NAM,FIPS_COUNT",
		returnGeometry: "true",
		outSR: "4326",
		maxAllowableOffset: "0.0004",
		resultRecordCount: "1000",
		f: "geojson"
	}).toString(),
	fipsCounty: {
		"041": "Cumberland",
		"043": "Dauphin",
		"071": "Lancaster",
		"133": "York"
	}
};
var HYDRO = {
	title: "NHD Hydrography",
	source: "USGS National Hydrography Dataset",
	serviceUrl: "https://hydro.nationalmap.gov/arcgis/rest/services/nhd/MapServer",
	layerIds: [
		6,
		9,
		12
	],
	minZoom: 10
};
var SOILS = {
	title: "PA Soils (SSURGO)",
	source: "USDA NRCS / PASDA",
	serviceUrl: "https://mapservices.pasda.psu.edu/server/rest/services/pasda/Soils_PA/MapServer",
	layerIds: [0],
	minZoom: 12
};
var USGS_TOPO = {
	title: "USGS US Topo",
	source: "USGS National Map",
	url: "https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}",
	maxNativeZoom: 16
};
var YORK_PASDA = {
	title: "York County PASDA overlays",
	source: "PASDA / York County",
	serviceUrl: "https://mapservices.pasda.psu.edu/server/rest/services/pasda/YorkCounty/MapServer",
	layerIds: [
		16,
		21,
		22,
		30,
		32,
		33,
		36,
		41
	],
	minZoom: 11
};
function boundsOverlap(a, b) {
	return a.west <= b.east && a.east >= b.west && a.south <= b.north && a.north >= b.south;
}
function esriQueryUrl(layerUrl, bounds, zoom, fields, maxRecords) {
	const offset = Math.max(0, (18 - zoom) * 2e-5);
	return `${layerUrl}/query?${new URLSearchParams({
		where: "1=1",
		geometry: `${bounds.west},${bounds.south},${bounds.east},${bounds.north}`,
		geometryType: "esriGeometryEnvelope",
		inSR: "4326",
		spatialRel: "esriSpatialRelIntersects",
		outFields: fields,
		returnGeometry: "true",
		outSR: "4326",
		maxAllowableOffset: String(offset),
		resultRecordCount: String(maxRecords),
		f: "geojson"
	}).toString()}`;
}
function esriExportUrl(serviceUrl, bounds3857, size, layerIds) {
	return `${serviceUrl}/export?${new URLSearchParams({
		bbox: `${bounds3857.xmin},${bounds3857.ymin},${bounds3857.xmax},${bounds3857.ymax}`,
		bboxSR: "3857",
		imageSR: "3857",
		size: `${size.w},${size.h}`,
		dpi: "96",
		format: "png32",
		transparent: "true",
		layers: `show:${layerIds.join(",")}`,
		f: "image"
	}).toString()}`;
}
function EsriDynamicLayer({ serviceUrl, layerIds, enabled, opacity = .72, minZoom = 10, pane }) {
	const map = useMap();
	const [frame, setFrame] = (0, import_react.useState)(null);
	const idsKey = layerIds.join(",");
	(0, import_react.useEffect)(() => {
		if (!enabled) {
			setFrame(null);
			return;
		}
		if (pane && !map.getPane(pane)) {
			const created = map.createPane(pane);
			created.style.zIndex = "350";
			created.style.pointerEvents = "none";
		}
		let timer;
		const refresh = () => {
			window.clearTimeout(timer);
			timer = window.setTimeout(() => {
				if (map.getZoom() < minZoom) {
					setFrame(null);
					return;
				}
				const size = map.getSize();
				const b = map.getBounds();
				const nw = import_leaflet_src.default.CRS.EPSG3857.project(b.getNorthWest());
				const se = import_leaflet_src.default.CRS.EPSG3857.project(b.getSouthEast());
				const url = esriExportUrl(serviceUrl, {
					xmin: nw.x,
					ymin: se.y,
					xmax: se.x,
					ymax: nw.y
				}, {
					w: Math.min(Math.round(size.x), 1920),
					h: Math.min(Math.round(size.y), 1080)
				}, layerIds);
				setFrame({
					url,
					bounds: b
				});
			}, 220);
		};
		map.on("moveend", refresh);
		map.on("zoomend", refresh);
		refresh();
		return () => {
			window.clearTimeout(timer);
			map.off("moveend", refresh);
			map.off("zoomend", refresh);
		};
	}, [
		enabled,
		map,
		serviceUrl,
		idsKey,
		minZoom,
		pane,
		layerIds
	]);
	if (!frame) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImageOverlay, {
		url: frame.url,
		bounds: frame.bounds,
		opacity,
		pane
	});
}
function viewBounds(map) {
	const b = map.getBounds();
	return {
		west: b.getWest(),
		south: b.getSouth(),
		east: b.getEast(),
		north: b.getNorth()
	};
}
function parcelsEnabled(layers) {
	return (layers.parcels ?? layers.yorkParcels) !== false;
}
function ParcelServiceLayer({ service, active, onCount }) {
	const map = useMap();
	(0, import_react.useEffect)(() => {
		if (!active) {
			onCount(service.county, null);
			return;
		}
		const paneName = `parcels-${service.county.toLowerCase()}`;
		if (!map.getPane(paneName)) {
			const pane = map.createPane(paneName);
			pane.style.zIndex = "450";
		}
		const layer = import_leaflet_src.default.geoJSON(void 0, {
			pane: paneName,
			style: {
				color: "#466649",
				weight: 1.05,
				fillColor: "#466649",
				fillOpacity: .05
			},
			onEachFeature: (feature, lyr) => {
				const props = feature.properties ?? {};
				lyr.bindPopup(service.popup(props));
			}
		}).addTo(map);
		map.attributionControl?.addAttribution(service.source);
		let timer;
		let abort = null;
		const load = () => {
			window.clearTimeout(timer);
			timer = window.setTimeout(async () => {
				const bounds = viewBounds(map);
				if (map.getZoom() < 15 || !boundsOverlap(bounds, service.extent)) {
					layer.clearLayers();
					onCount(service.county, null);
					return;
				}
				abort?.abort();
				abort = new AbortController();
				const url = esriQueryUrl(service.url, bounds, map.getZoom(), service.fields, service.maxRecords);
				try {
					const res = await fetch(url, { signal: abort.signal });
					if (!res.ok) throw new Error(String(res.status));
					const json = await res.json();
					layer.clearLayers();
					layer.addData(json);
					onCount(service.county, json.features?.length ?? 0);
				} catch (err) {
					if (err.name === "AbortError") return;
					onCount(service.county, null);
				}
			}, 280);
		};
		map.on("moveend", load);
		map.on("zoomend", load);
		load();
		return () => {
			window.clearTimeout(timer);
			abort?.abort();
			map.off("moveend", load);
			map.off("zoomend", load);
			map.removeLayer(layer);
			map.attributionControl?.removeAttribution(service.source);
			onCount(service.county, null);
		};
	}, [
		active,
		map,
		onCount,
		service
	]);
	return null;
}
function ParcelBoundariesLayer() {
	const map = useMap();
	const layers = useHub((s) => s.layers);
	const county = useHub((s) => s.county);
	const enabled = parcelsEnabled(layers);
	const [counts, setCounts] = (0, import_react.useState)({});
	const [zoom, setZoom] = (0, import_react.useState)(map.getZoom());
	(0, import_react.useEffect)(() => {
		const sync = () => setZoom(map.getZoom());
		map.on("zoomend", sync);
		return () => {
			map.off("zoomend", sync);
		};
	}, [map]);
	const onCount = (0, import_react.useMemo)(() => {
		return (c, n) => {
			setCounts((prev) => {
				if (n == null) {
					if (!(c in prev)) return prev;
					const next = { ...prev };
					delete next[c];
					return next;
				}
				if (prev[c] === n) return prev;
				return {
					...prev,
					[c]: n
				};
			});
		};
	}, []);
	const hint = !enabled ? null : zoom < 15 ? "Zoom in to load official county parcel boundaries" : (() => {
		const parts = Object.entries(counts).map(([k, n]) => `${n?.toLocaleString()} ${k}`);
		return parts.length ? `${parts.join(" · ")} parcels in view` : null;
	})();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [PARCEL_SERVICES.map((service) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParcelServiceLayer, {
		service,
		active: enabled && (county === "all" || county === service.county),
		onCount
	}, service.county)), hint ? (0, import_react_dom.createPortal)(/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "pointer-events-none absolute bottom-10 left-3 z-[500] max-w-72 rounded-sm bg-card/90 px-2 py-1 text-[11px] font-medium shadow-sm",
		children: hint
	}), map.getContainer()) : null] });
}
var muniCache = null;
function MunicipalitiesLayer() {
	const enabled = useHub((s) => s.layers.municipalities);
	const county = useHub((s) => s.county);
	const [data, setData] = (0, import_react.useState)(muniCache);
	const [error, setError] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!enabled || muniCache) {
			if (muniCache) setData(muniCache);
			return;
		}
		let alive = true;
		fetch(MUNICIPALITIES.url).then((r) => {
			if (!r.ok) throw new Error(String(r.status));
			return r.json();
		}).then((json) => {
			muniCache = json;
			if (alive) setData(json);
		}).catch(() => {
			if (alive) setError(true);
		});
		return () => {
			alive = false;
		};
	}, [enabled]);
	const filtered = (0, import_react.useMemo)(() => {
		if (!data) return data;
		if (county === "all") return data;
		return {
			type: "FeatureCollection",
			features: data.features.filter((f) => MUNICIPALITIES.fipsCounty[String(f.properties.FIPS_COUNT)] === county)
		};
	}, [data, county]);
	if (!enabled) return null;
	if (error || !filtered) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GeoJSON, {
		data: filtered,
		style: {
			color: "#1b365d",
			weight: 2,
			fillColor: "#1b365d",
			fillOpacity: .06,
			dashArray: "5 4"
		},
		onEachFeature: (feature, layer) => {
			const p = feature.properties ?? {};
			const cnty = MUNICIPALITIES.fipsCounty[String(p.FIPS_COUNT)] ?? String(p.COUNTY_NAM ?? "PA");
			layer.bindPopup(`<div class="min-w-40"><div class="text-[10px] font-bold uppercase tracking-wider">Municipality</div><div class="font-semibold">${esc(p.MUNICIPAL1)}</div><div class="text-xs">${esc(p.CLASS_OF_M)} · ${esc(cnty)} County</div></div>`);
		}
	}, `muni-${county}-${filtered.features.length}`);
}
function GisOverlays() {
	const layers = useHub((s) => s.layers);
	const topo = Boolean(layers.topo);
	const hydro = Boolean(layers.hydro);
	const soils = Boolean(layers.soils);
	const yorkPasda = Boolean(layers.yorkPasda);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
		topo ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TileLayer, {
			attribution: "USGS National Map",
			url: USGS_TOPO.url,
			maxNativeZoom: USGS_TOPO.maxNativeZoom,
			maxZoom: 19,
			opacity: .92
		}) : null,
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EsriDynamicLayer, {
			serviceUrl: HYDRO.serviceUrl,
			layerIds: HYDRO.layerIds,
			enabled: hydro,
			minZoom: HYDRO.minZoom,
			opacity: .8,
			pane: "gis-hydro"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EsriDynamicLayer, {
			serviceUrl: SOILS.serviceUrl,
			layerIds: SOILS.layerIds,
			enabled: soils,
			minZoom: SOILS.minZoom,
			opacity: .55,
			pane: "gis-soils"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EsriDynamicLayer, {
			serviceUrl: YORK_PASDA.serviceUrl,
			layerIds: YORK_PASDA.layerIds,
			enabled: yorkPasda,
			minZoom: YORK_PASDA.minZoom,
			opacity: .6,
			pane: "gis-york-pasda"
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MunicipalitiesLayer, {}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ParcelBoundariesLayer, {})
	] });
}
function FitCounty() {
	const map = useMap();
	const county = useHub((s) => s.county);
	(0, import_react.useEffect)(() => {
		const c = COUNTY_CENTERS[county];
		const layers = useHub.getState().layers;
		const zoom = (layers.parcels ?? layers.yorkParcels) !== false && county !== "all" ? Math.max(c.zoom, 15) : c.zoom;
		map.setView([c.lat, c.lng], zoom);
	}, [county, map]);
	return null;
}
function floodFill(p, ft) {
	const z = p.flood[ft];
	if (z === "AE" || z === "A" || z === "VE") return "#1565c0";
	if (z === "X500") return "#64b5f6";
	return null;
}
function LeafletMap({ className }) {
	const layers = useHub((s) => s.layers);
	const floodFt = useHub((s) => s.floodFt);
	const county = useHub((s) => s.county);
	const selectedIds = useHub((s) => s.selectedIds);
	const selectParcel = useHub((s) => s.selectParcel);
	const satellite = useHub((s) => s.satellite);
	const query = useHub((s) => s.query);
	const c = COUNTY_CENTERS[county];
	const parcels = PARCELS.filter((p) => {
		if (county !== "all" && p.county !== county) return false;
		if (!query.trim()) return true;
		const s = query.toLowerCase();
		return p.address.toLowerCase().includes(s) || p.apn.toLowerCase().includes(s) || p.owner.toLowerCase().includes(s) || p.municipality.toLowerCase().includes(s);
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("relative h-full min-h-80 w-full overflow-hidden", className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(MapContainer, {
			center: [c.lat, c.lng],
			zoom: c.zoom,
			className: "h-full w-full",
			zoomControl: true,
			scrollWheelZoom: true,
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FitCounty, {}),
				satellite ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TileLayer, {
					attribution: "Tiles © Esri",
					url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TileLayer, {
					attribution: "© OpenStreetMap",
					url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GisOverlays, {}),
				parcels.map((p) => {
					const selected = selectedIds.includes(p.id);
					const zoneColor = ZONE_META[p.zoning].fill;
					const flood = layers.flood || layers.inundation ? floodFill(p, floodFt) : null;
					const slope = layers.slopes && p.slopePct >= 8;
					const color = flood ?? (slope ? "#6d4c41" : layers.zoning ? zoneColor : "#1b365d");
					return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Polygon, {
						positions: p.polygon,
						pathOptions: {
							color: selected ? "#002046" : color,
							weight: selected ? 3 : 1.5,
							fillColor: color,
							fillOpacity: selected ? .55 : .32
						},
						eventHandlers: { click: (e) => {
							const additive = e.originalEvent.shiftKey;
							selectParcel(p.id, additive);
						} },
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Popup, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-44",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "font-semibold",
									children: p.address
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "text-xs text-on-surface-variant",
									children: [
										p.municipality,
										" · ",
										p.county
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-1 text-xs",
									children: [
										p.zoning,
										" · ",
										p.acres,
										" ac · ",
										p.owner
									]
								})
							]
						}) })
					}, p.id);
				}),
				layers.traffic && parcels.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleMarker, {
					center: [p.lat, p.lng],
					radius: Math.min(18, 4 + p.aadt / 2500),
					pathOptions: {
						color: p.aadt > 2e4 ? "#c62828" : p.aadt > 5e3 ? "#ef6c00" : "#2e7d32",
						fillOpacity: .25,
						weight: 1
					}
				}, `t-${p.id}`)),
				layers.bridges && BRIDGES.map((b) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleMarker, {
					center: [b.lat, b.lng],
					radius: 10,
					pathOptions: {
						color: "#c62828",
						fillColor: "#c62828",
						fillOpacity: .8
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popup, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "font-semibold",
							children: b.name
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs",
							children: [
								"V ",
								b.vClear,
								" · H ",
								b.hClear
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-xs",
							children: [
								"Risk ",
								b.risk,
								"/10"
							]
						})
					] })
				}, b.id)),
				layers.improvements && IMPROVEMENTS.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleMarker, {
					center: [i.lat, i.lng],
					radius: 8,
					pathOptions: {
						color: "#ef6c00",
						fillColor: "#ffd54f",
						fillOpacity: .9
					},
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Popup, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "font-semibold",
						children: i.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-xs",
						children: ["Projected ", i.complete]
					})] })
				}, i.id)),
				layers.ev && [
					[40.263, -76.881],
					[40.048, -76.307],
					[39.96, -76.73],
					[40.202, -77.19]
				].map((pt, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleMarker, {
					center: pt,
					radius: 6,
					pathOptions: {
						color: "#00838f",
						fillOpacity: .85
					}
				}, `ev-${i}`)),
				layers.buggy && [
					[40.08, -76.32],
					[40.12, -76.22],
					[40.02, -76.18]
				].map((pt, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleMarker, {
					center: pt,
					radius: 14,
					pathOptions: {
						color: "#6d4c41",
						fillOpacity: .15,
						weight: 1,
						dashArray: "4 4"
					}
				}, `bg-${i}`)),
				layers.logistics && [
					[39.978, -76.775],
					[40.254, -76.814],
					[40.27, -76.7]
				].map((pt, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleMarker, {
					center: pt,
					radius: 12,
					pathOptions: {
						color: "#6a1b9a",
						fillOpacity: .25
					}
				}, `lg-${i}`))
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "pointer-events-none absolute bottom-3 left-3 rounded-sm bg-card/90 px-2 py-1 text-[11px] font-medium shadow-sm",
			children: "0 — 500 ft"
		})]
	});
}
//#endregion
export { LeafletMap };
