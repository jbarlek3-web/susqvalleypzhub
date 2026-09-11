import { lazy, Suspense, useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const LeafletMap = lazy(() =>
  import("./leaflet-map").then((m) => ({ default: m.LeafletMap })),
);

export function ParcelMap({ className }: { className?: string }) {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  if (!ready) {
    return (
      <div className={cn("flex min-h-80 items-center justify-center bg-surface-high text-sm text-muted-foreground", className)}>
        Loading regional map…
      </div>
    );
  }
  return (
    <Suspense
      fallback={
        <div className={cn("flex min-h-80 items-center justify-center bg-surface-high text-sm text-muted-foreground", className)}>
          Loading regional map…
        </div>
      }
    >
      <LeafletMap className={className} />
    </Suspense>
  );
}
