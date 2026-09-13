import { lazy, Suspense, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCcw } from "lucide-react";

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
    <ErrorBoundary
      fallback={({ reset }) => (
        <div className={cn("flex min-h-80 flex-col items-center justify-center gap-3 bg-surface-high p-6 text-center", className)}>
          <div className="rounded-full bg-destructive/10 p-3 text-destructive">
            <AlertTriangle className="size-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">Map View Interrupted</h3>
          <p className="max-w-md text-xs text-muted-foreground">
            A map rendering or GIS layer issue occurred. You can reload the map view.
          </p>
          <Button size="sm" variant="outline" onClick={reset} className="gap-1.5 text-xs">
            <RotateCcw className="size-3.5" /> Retry Map
          </Button>
        </div>
      )}
    >
      <Suspense
        fallback={
          <div className={cn("flex min-h-80 items-center justify-center bg-surface-high text-sm text-muted-foreground", className)}>
            Loading regional map…
          </div>
        }
      >
        <LeafletMap className={className} />
      </Suspense>
    </ErrorBoundary>
  );
}
