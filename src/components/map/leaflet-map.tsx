import { useEffect } from "react";
import { CircleMarker, MapContainer, Polygon, Popup, TileLayer, useMap } from "react-leaflet";
import { GisOverlays } from "@/components/map/gis-overlays";
import { YorkZoningLayer } from "@/components/map/york-zoning-layer";
import { BRIDGES, COUNTY_CENTERS, IMPROVEMENTS, PARCELS } from "@/lib/data/parcels";
import { PARCEL_MIN_ZOOM } from "@/lib/data/gis-layers";
import { ZONE_META } from "@/lib/data/zoning";
import { useHub } from "@/lib/store";
import type { Parcel } from "@/lib/types";
import { cn } from "@/lib/utils";

function FitCounty() {
  const map = useMap();
  const county = useHub((s) => s.county);
  const lookup = useHub((s) => s.lookup);
  useEffect(() => {
    if (lookup) return;
    const c = COUNTY_CENTERS[county];
    const layers = useHub.getState().layers;
    const parcelsOn = (layers.parcels ?? layers.yorkParcels) !== false;
    const zoom = parcelsOn && county !== "all" ? Math.max(c.zoom, PARCEL_MIN_ZOOM) : c.zoom;
    map.setView([c.lat, c.lng], zoom);
  }, [county, map, lookup]);
  return null;
}

function FlyToLookup() {
  const map = useMap();
  const lookup = useHub((s) => s.lookup);
  useEffect(() => {
    if (!lookup) return;
    map.setView([lookup.lat, lookup.lng], Math.max(map.getZoom(), 16));
  }, [lookup, map]);
  return null;
}

function floodFill(p: Parcel, ft: 0 | 1 | 3 | 5) {
  const z = p.flood[ft];
  if (z === "AE" || z === "A" || z === "VE") return "#1565c0";
  if (z === "X500") return "#64b5f6";
  return null;
}

export function LeafletMap({ className }: { className?: string }) {
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
    return (
      p.address.toLowerCase().includes(s) ||
      p.apn.toLowerCase().includes(s) ||
      p.owner.toLowerCase().includes(s) ||
      p.municipality.toLowerCase().includes(s)
    );
  });

  return (
    <div className={cn("relative h-full min-h-80 w-full overflow-hidden", className)}>
      <MapContainer
        center={[c.lat, c.lng]}
        zoom={c.zoom}
        className="h-full w-full"
        zoomControl
        scrollWheelZoom
      >
        <FitCounty />
        <FlyToLookup />
        {satellite ? (
          <TileLayer
            attribution="Tiles &copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        ) : (
          <TileLayer
            attribution="&copy; OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}
        <GisOverlays />
        <YorkZoningLayer />
        {parcels.map((p) => {
          const selected = selectedIds.includes(p.id);
          const zoneColor = ZONE_META[p.zoning].fill;
          const flood = layers.flood || layers.inundation ? floodFill(p, floodFt) : null;
          const slope = layers.slopes && p.slopePct >= 8;
          const color = flood ?? (slope ? "#6d4c41" : layers.zoning ? zoneColor : "#1b365d");
          return (
            <Polygon
              key={p.id}
              positions={p.polygon}
              pathOptions={{
                color: selected ? "#002046" : color,
                weight: selected ? 3 : 1.5,
                fillColor: color,
                fillOpacity: selected ? 0.55 : 0.32,
              }}
              eventHandlers={{
                click: (e) => {
                  const additive = (e.originalEvent as MouseEvent).shiftKey;
                  selectParcel(p.id, additive);
                },
              }}
            >
              <Popup>
                <div className="min-w-44">
                  <div className="font-semibold">{p.address}</div>
                  <div className="text-xs text-on-surface-variant">
                    {p.municipality} · {p.county}
                  </div>
                  <div className="mt-1 text-xs">
                    {p.zoning} · {p.acres} ac · {p.owner}
                  </div>
                </div>
              </Popup>
            </Polygon>
          );
        })}
        {layers.traffic &&
          parcels.map((p) => (
            <CircleMarker
              key={`t-${p.id}`}
              center={[p.lat, p.lng]}
              radius={Math.min(18, 4 + p.aadt / 2500)}
              pathOptions={{
                color: p.aadt > 20000 ? "#c62828" : p.aadt > 5000 ? "#ef6c00" : "#2e7d32",
                fillOpacity: 0.25,
                weight: 1,
              }}
            />
          ))}
        {layers.bridges &&
          BRIDGES.map((b) => (
            <CircleMarker
              key={b.id}
              center={[b.lat, b.lng]}
              radius={10}
              pathOptions={{ color: "#c62828", fillColor: "#c62828", fillOpacity: 0.8 }}
            >
              <Popup>
                <div className="font-semibold">{b.name}</div>
                <div className="text-xs">
                  V {b.vClear} · H {b.hClear}
                </div>
                <div className="text-xs">Risk {b.risk}/10</div>
              </Popup>
            </CircleMarker>
          ))}
        {layers.improvements &&
          IMPROVEMENTS.map((i) => (
            <CircleMarker
              key={i.id}
              center={[i.lat, i.lng]}
              radius={8}
              pathOptions={{ color: "#ef6c00", fillColor: "#ffd54f", fillOpacity: 0.9 }}
            >
              <Popup>
                <div className="font-semibold">{i.name}</div>
                <div className="text-xs">Projected {i.complete}</div>
              </Popup>
            </CircleMarker>
          ))}
        {layers.ev &&
          (
            [
              [40.263, -76.881],
              [40.048, -76.307],
              [39.96, -76.73],
              [40.202, -77.19],
            ] as [number, number][]
          ).map((pt, i) => (
            <CircleMarker
              key={`ev-${i}`}
              center={pt}
              radius={6}
              pathOptions={{ color: "#00838f", fillOpacity: 0.85 }}
            />
          ))}
        {layers.buggy &&
          (
            [
              [40.08, -76.32],
              [40.12, -76.22],
              [40.02, -76.18],
            ] as [number, number][]
          ).map((pt, i) => (
            <CircleMarker
              key={`bg-${i}`}
              center={pt}
              radius={14}
              pathOptions={{ color: "#6d4c41", fillOpacity: 0.15, weight: 1, dashArray: "4 4" }}
            />
          ))}
        {layers.logistics &&
          (
            [
              [39.978, -76.775],
              [40.254, -76.814],
              [40.27, -76.7],
            ] as [number, number][]
          ).map((pt, i) => (
            <CircleMarker
              key={`lg-${i}`}
              center={pt}
              radius={12}
              pathOptions={{ color: "#6a1b9a", fillOpacity: 0.25 }}
            />
          ))}
      </MapContainer>
      <div className="pointer-events-none absolute bottom-3 left-3 rounded-sm bg-card/90 px-2 py-1 text-[11px] font-medium shadow-sm">
        0 — 500 ft
      </div>
    </div>
  );
}
