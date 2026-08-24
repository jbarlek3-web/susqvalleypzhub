import L from "leaflet";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useMap } from "react-leaflet";
import { YORK_PARCELS, yorkParcelsQueryUrl } from "@/lib/data/york-parcels";
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
  const acres = typeof props.ACRES === "number" ? props.ACRES.toFixed(3) : esc(props.ACRES);
  const value =
    typeof props.APRTOTAL === "number"
      ? props.APRTOTAL.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })
      : esc(props.APRTOTAL);
  return `
    <div class="min-w-48">
      <div class="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">York County Parcel</div>
      <div class="font-semibold">${esc(props.PROPADR)}</div>
      <div class="text-xs text-on-surface-variant">PIDN ${esc(props.PIDN)}</div>
      <div class="mt-1 text-xs">${esc(props.OWNER_FULL)}</div>
      <div class="mt-1 text-xs">${acres} ac · Class ${esc(props.CLASS)} · Dist ${esc(props.DISTRICT)}</div>
      <div class="text-xs">Appraised ${value}</div>
    </div>
  `;
}

export function YorkParcelsLayer() {
  const map = useMap();
  const enabled = useHub((s) => s.layers.yorkParcels) !== false;
  const county = useHub((s) => s.county);
  const active = enabled && (county === "all" || county === "York");
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    if (!active) {
      setHint(null);
      return;
    }

    const paneName = "york-parcels";
    if (!map.getPane(paneName)) {
      const pane = map.createPane(paneName);
      pane.style.zIndex = "450";
    }

    const layer = L.geoJSON(undefined, {
      pane: paneName,
      style: {
        color: "#466649",
        weight: 1.1,
        fillColor: "#466649",
        fillOpacity: 0.04,
      },
      onEachFeature: (feature, lyr) => {
        const props = (feature.properties ?? {}) as Record<string, string | number | null>;
        lyr.bindPopup(popupHtml(props));
      },
    }).addTo(map);

    map.attributionControl?.addAttribution("York County Planning Commission");

    let timer: number | undefined;
    let abort: AbortController | null = null;

    const load = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(async () => {
        if (map.getZoom() < YORK_PARCELS.minZoom) {
          layer.clearLayers();
          setHint("Zoom in to load official York County parcel boundaries");
          return;
        }
        abort?.abort();
        abort = new AbortController();
        setHint("Loading York County parcels…");
        const b = map.getBounds();
        const url = yorkParcelsQueryUrl(
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
          setHint(n ? `${n.toLocaleString()} York parcels in view` : "No parcels in this view");
        } catch (err) {
          if ((err as { name?: string }).name === "AbortError") return;
          setHint("York County parcel service is unavailable");
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
      map.attributionControl?.removeAttribution("York County Planning Commission");
    };
  }, [active, map]);

  if (!active || !hint) return null;
  return createPortal(
    <div className="pointer-events-none absolute bottom-10 left-3 z-[500] max-w-64 rounded-sm bg-card/90 px-2 py-1 text-[11px] font-medium shadow-sm">
      {hint}
    </div>,
    map.getContainer(),
  );
}
