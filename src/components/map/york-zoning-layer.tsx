import L from "leaflet";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";
import {
  findDistrict,
  prettyMuni,
  yorkZoningQueryUrl,
  zoneFill,
  YORK_ZONING,
  dimLabel,
} from "@/lib/data/york-zoning";
import { useHub } from "@/lib/store";

type YorkCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, string | number | null>;
    geometry: GeoJSON.Geometry;
  }>;
};

function esc(value: unknown) {
  const amp = "\u0026";
  return String(value ?? "\u2014")
    .replaceAll("&", `${amp}amp;`)
    .replaceAll("<", `${amp}lt;`)
    .replaceAll(">", `${amp}gt;`)
    .replaceAll('"', `${amp}quot;`);
}

function popupHtml(props: Record<string, string | number | null>) {
  const d = findDistrict(String(props.MUNI_NAME ?? ""), String(props.ZCODE ?? ""), String(props.JOIN_FIELD ?? ""));
  const muni = prettyMuni(String(props.MUNI_NAME ?? ""));
  const uses = d
    ? [
        d.useSf ? "SF" : null,
        d.use2f ? "2F" : null,
        d.useMf ? "MF" : null,
        d.useRet ? "Retail" : null,
        d.useInd ? "Ind" : null,
        d.useAg ? "Ag" : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";
  return `
    <div class="min-w-52">
      <div class="text-[10px] font-bold uppercase tracking-wider">York County Zoning</div>
      <div class="font-semibold">${esc(props.ZCODE)} — ${esc(props.ZNAME)}</div>
      <div class="text-xs">${esc(muni)}</div>
      <div class="mt-1 text-xs">${esc(props.GEN_ZNAME || props.GEN_ZCODE)}</div>
      ${
        d
          ? `<div class="mt-1 text-xs">Front ${esc(dimLabel(d.front, "ft"))} · Side ${esc(dimLabel(d.side, "ft"))}<br/>Min lot ${esc(dimLabel(d.lot, "sf"))} · Height ${esc(dimLabel(d.height, "ft"))} · Cover ${esc(dimLabel(d.cov, "%"))}</div>`
          : ""
      }
      ${uses ? `<div class="mt-1 text-xs">By-right: ${esc(uses)}</div>` : ""}
    </div>
  `;
}

export function YorkZoningLayer() {
  const map = useMap();
  const enabled = useHub((s) => s.layers.yorkZoning) !== false;
  const county = useHub((s) => s.county);
  const active = enabled && (county === "all" || county === "York");
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      setHint(null);
      return;
    }

    const paneName = "york-zoning";
    if (!map.getPane(paneName)) {
      const pane = map.createPane(paneName);
      pane.style.zIndex = "420";
    }

    const layer = L.geoJSON(undefined, {
      pane: paneName,
      style: (feature) => {
        const props = (feature?.properties ?? {}) as Record<string, string | number | null>;
        const color = zoneFill(props);
        return {
          color,
          weight: 1.15,
          fillColor: color,
          fillOpacity: 0.22,
        };
      },
      onEachFeature: (feature, lyr) => {
        const props = (feature.properties ?? {}) as Record<string, string | number | null>;
        lyr.bindPopup(popupHtml(props));
        lyr.on("mouseover", () => {
          (lyr as L.Path).setStyle({ weight: 2.2, fillOpacity: 0.38 });
        });
        lyr.on("mouseout", () => {
          const color = zoneFill(props);
          (lyr as L.Path).setStyle({ color, weight: 1.15, fillColor: color, fillOpacity: 0.22 });
        });
      },
    }).addTo(map);

    map.attributionControl?.addAttribution("York County Planning Commission zoning");

    let timer: number | undefined;
    let abort: AbortController | null = null;

    const load = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(async () => {
        if (map.getZoom() < YORK_ZONING.minZoom) {
          layer.clearLayers();
          setHint("Zoom in to load live York County zoning districts");
          return;
        }
        abort?.abort();
        abort = new AbortController();
        setHint("Loading York zoning districts…");
        const b = map.getBounds();
        const url = yorkZoningQueryUrl(
          { west: b.getWest(), south: b.getSouth(), east: b.getEast(), north: b.getNorth() },
          map.getZoom(),
        );
        try {
          const res = await fetch(url, { signal: abort.signal });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = (await res.json()) as YorkCollection;
          layer.clearLayers();
          layer.addData(json as GeoJSON.FeatureCollection);
          const n = json.features?.length ?? 0;
          setHint(n ? `${n.toLocaleString()} York zoning polygons in view` : "No zoning polygons in this view");
        } catch (err) {
          if ((err as { name?: string }).name === "AbortError") return;
          setHint("York County zoning service is unavailable");
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
      map.attributionControl?.removeAttribution("York County Planning Commission zoning");
    };
  }, [active, map]);

  if (!active || !hint) return null;
  return createPortal(
    <div className="pointer-events-none absolute bottom-16 left-3 z-[500] max-w-64 rounded-sm bg-card/90 px-2 py-1 text-[11px] font-medium shadow-sm">
      {hint}
    </div>,
    map.getContainer(),
  );
}
