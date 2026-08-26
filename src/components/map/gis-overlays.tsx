import L from "leaflet";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { GeoJSON, TileLayer, useMap } from "react-leaflet";
import { EsriDynamicLayer } from "@/components/map/esri-dynamic-layer";
import {
  FEMA_NFHL,
  HYDRO,
  MUNICIPALITIES,
  PARCEL_MIN_ZOOM,
  PARCEL_SERVICES,
  SOILS,
  USGS_TOPO,
  YORK_PASDA,
  boundsOverlap,
  esc,
  esriQueryUrl,
  type LatLngBoundsLike,
  type ParcelService,
} from "@/lib/data/gis-layers";
import { useHub } from "@/lib/store";
import type { County } from "@/lib/types";

type Collection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, string | number | null>;
    geometry: GeoJSON.Geometry;
  }>;
};

function viewBounds(map: L.Map): LatLngBoundsLike {
  const b = map.getBounds();
  return { west: b.getWest(), south: b.getSouth(), east: b.getEast(), north: b.getNorth() };
}

function parcelsEnabled(layers: Record<string, boolean | undefined>) {
  return (layers.parcels ?? layers.yorkParcels) !== false;
}

function ParcelServiceLayer({
  service,
  active,
  onCount,
}: {
  service: ParcelService;
  active: boolean;
  onCount: (county: County, n: number | null) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (!active) {
      onCount(service.county, null);
      return;
    }
    const paneName = `parcels-${service.county.toLowerCase()}`;
    if (!map.getPane(paneName)) {
      const pane = map.createPane(paneName);
      pane.style.zIndex = "450";
    }
    const layer = L.geoJSON(undefined, {
      pane: paneName,
      style: {
        color: "#466649",
        weight: 1.05,
        fillColor: "#466649",
        fillOpacity: 0.05,
      },
      onEachFeature: (feature, lyr) => {
        const props = (feature.properties ?? {}) as Record<string, string | number | null>;
        lyr.bindPopup(service.popup(props));
      },
    }).addTo(map);
    map.attributionControl?.addAttribution(service.source);

    let timer: number | undefined;
    let abort: AbortController | null = null;

    const load = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(async () => {
        const bounds = viewBounds(map);
        if (map.getZoom() < PARCEL_MIN_ZOOM || !boundsOverlap(bounds, service.extent)) {
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
          const json = (await res.json()) as Collection;
          layer.clearLayers();
          layer.addData(json as GeoJSON.FeatureCollection);
          onCount(service.county, json.features?.length ?? 0);
        } catch (err) {
          if ((err as { name?: string }).name === "AbortError") return;
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
  }, [active, map, onCount, service]);

  return null;
}

function ParcelBoundariesLayer() {
  const map = useMap();
  const layers = useHub((s) => s.layers);
  const county = useHub((s) => s.county);
  const enabled = parcelsEnabled(layers);
  const [counts, setCounts] = useState<Partial<Record<County, number>>>({});
  const [zoom, setZoom] = useState(map.getZoom());

  useEffect(() => {
    const sync = () => setZoom(map.getZoom());
    map.on("zoomend", sync);
    return () => {
      map.off("zoomend", sync);
    };
  }, [map]);

  const onCount = useMemo(() => {
    return (c: County, n: number | null) => {
      setCounts((prev) => {
        if (n == null) {
          if (!(c in prev)) return prev;
          const next = { ...prev };
          delete next[c];
          return next;
        }
        if (prev[c] === n) return prev;
        return { ...prev, [c]: n };
      });
    };
  }, []);

  const hint = !enabled
    ? null
    : zoom < PARCEL_MIN_ZOOM
      ? "Zoom in to load official county parcel boundaries"
      : (() => {
          const parts = Object.entries(counts).map(([k, n]) => `${n?.toLocaleString()} ${k}`);
          return parts.length ? `${parts.join(" · ")} parcels in view` : null;
        })();

  return (
    <>
      {PARCEL_SERVICES.map((service) => (
        <ParcelServiceLayer
          key={service.county}
          service={service}
          active={enabled && (county === "all" || county === service.county)}
          onCount={onCount}
        />
      ))}
      {hint
        ? createPortal(
            <div className="pointer-events-none absolute bottom-10 left-3 z-[500] max-w-72 rounded-sm bg-card/90 px-2 py-1 text-[11px] font-medium shadow-sm">
              {hint}
            </div>,
            map.getContainer(),
          )
        : null}
    </>
  );
}

let muniCache: Collection | null = null;

function MunicipalitiesLayer() {
  const enabled = useHub((s) => s.layers.municipalities);
  const county = useHub((s) => s.county);
  const [data, setData] = useState<Collection | null>(muniCache);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!enabled || muniCache) {
      if (muniCache) setData(muniCache);
      return;
    }
    let alive = true;
    fetch(MUNICIPALITIES.url)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((json: Collection) => {
        muniCache = json;
        if (alive) setData(json);
      })
      .catch(() => {
        if (alive) setError(true);
      });
    return () => {
      alive = false;
    };
  }, [enabled]);

  const filtered = useMemo(() => {
    if (!data) return data;
    if (county === "all") return data;
    return {
      type: "FeatureCollection" as const,
      features: data.features.filter(
        (f) =>
          MUNICIPALITIES.fipsCounty[
            String(f.properties.fips_count ?? f.properties.FIPS_COUNT ?? "")
          ] === county,
      ),
    };
  }, [data, county]);

  if (!enabled) return null;
  if (error || !filtered) return null;

  return (
    <GeoJSON
      key={`muni-${county}-${filtered.features.length}`}
      data={filtered as GeoJSON.FeatureCollection}
      style={{
        color: "#1b365d",
        weight: 2,
        fillColor: "#1b365d",
        fillOpacity: 0.06,
        dashArray: "5 4",
      }}
      onEachFeature={(feature, layer) => {
        const p = (feature.properties ?? {}) as Record<string, string | number | null>;
        const cnty =
          MUNICIPALITIES.fipsCounty[String(p.fips_count ?? p.FIPS_COUNT ?? "")] ??
          String(p.fips_name ?? p.COUNTY_NAM ?? "PA");
        layer.bindPopup(
          `<div class="min-w-40"><div class="text-[10px] font-bold uppercase tracking-wider">Municipality</div><div class="font-semibold">${esc(p.municipal1 ?? p.MUNICIPAL1)}</div><div class="text-xs">${esc(p.class_of_m ?? p.CLASS_OF_M)} · ${esc(cnty)} County</div></div>`,
        );
      }}
    />
  );
}

export function GisOverlays() {
  const layers = useHub((s) => s.layers);
  const topo = Boolean(layers.topo);
  const hydro = Boolean(layers.hydro);
  const soils = Boolean(layers.soils);
  const yorkPasda = Boolean(layers.yorkPasda);
  const femaFlood = Boolean(layers.femaFlood);

  return (
    <>
      {topo ? (
        <TileLayer
          attribution="USGS National Map"
          url={USGS_TOPO.url}
          maxNativeZoom={USGS_TOPO.maxNativeZoom}
          maxZoom={19}
          opacity={0.92}
        />
      ) : null}
      <EsriDynamicLayer
        serviceUrl={HYDRO.serviceUrl}
        layerIds={HYDRO.layerIds}
        enabled={hydro}
        minZoom={HYDRO.minZoom}
        opacity={0.8}
        pane="gis-hydro"
      />
      <EsriDynamicLayer
        serviceUrl={SOILS.serviceUrl}
        layerIds={SOILS.layerIds}
        enabled={soils}
        minZoom={SOILS.minZoom}
        opacity={0.55}
        pane="gis-soils"
      />
      <EsriDynamicLayer
        serviceUrl={FEMA_NFHL.serviceUrl}
        layerIds={FEMA_NFHL.layerIds}
        enabled={femaFlood}
        minZoom={FEMA_NFHL.minZoom}
        opacity={0.72}
        pane="gis-fema-flood"
      />
      <EsriDynamicLayer
        serviceUrl={YORK_PASDA.serviceUrl}
        layerIds={YORK_PASDA.layerIds}
        enabled={yorkPasda}
        minZoom={YORK_PASDA.minZoom}
        opacity={0.6}
        pane="gis-york-pasda"
      />
      <MunicipalitiesLayer />
      <ParcelBoundariesLayer />
    </>
  );
}
