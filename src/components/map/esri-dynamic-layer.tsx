import L from "leaflet";
import { useEffect, useState } from "react";
import { ImageOverlay, useMap } from "react-leaflet";
import { esriExportUrl } from "@/lib/data/gis-layers";

export function EsriDynamicLayer({
  serviceUrl,
  layerIds,
  enabled,
  opacity = 0.72,
  minZoom = 10,
  pane,
}: {
  serviceUrl: string;
  layerIds: number[];
  enabled: boolean;
  opacity?: number;
  minZoom?: number;
  pane?: string;
}) {
  const map = useMap();
  const [frame, setFrame] = useState<{ url: string; bounds: L.LatLngBounds } | null>(null);
  const idsKey = layerIds.join(",");

  useEffect(() => {
    if (!enabled) {
      setFrame(null);
      return;
    }
    if (pane && !map.getPane(pane)) {
      const created = map.createPane(pane);
      created.style.zIndex = "350";
      created.style.pointerEvents = "none";
    }

    let timer: number | undefined;
    const refresh = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (map.getZoom() < minZoom) {
          setFrame(null);
          return;
        }
        const size = map.getSize();
        const b = map.getBounds();
        const nw = L.CRS.EPSG3857.project(b.getNorthWest());
        const se = L.CRS.EPSG3857.project(b.getSouthEast());
        const url = esriExportUrl(
          serviceUrl,
          { xmin: nw.x, ymin: se.y, xmax: se.x, ymax: nw.y },
          { w: Math.min(Math.round(size.x), 1920), h: Math.min(Math.round(size.y), 1080) },
          layerIds,
        );
        setFrame({ url, bounds: b });
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
  }, [enabled, map, serviceUrl, idsKey, minZoom, pane, layerIds]);

  if (!frame) return null;
  return <ImageOverlay url={frame.url} bounds={frame.bounds} opacity={opacity} pane={pane} />;
}
