import { TriangleAlert, FileQuestion, RotateCcw, Home } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function AppErrorComponent({ reset }: { error?: unknown; reset?: () => void } = {}) {
  const handleReload = () => {
    if (reset) {
      reset();
    } else if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <main
      className={
        "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center " +
        "bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
      }
    >
      <span className="text-red-500" aria-hidden="true">
        <TriangleAlert className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400">
        An unexpected error occurred. Try reloading the page. If the problem continues, email
        admin@fieldacq.com.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <Button size="sm" variant="outline" onClick={handleReload} className="gap-1.5 text-xs">
          <RotateCcw className="size-3.5" />
          Try reloading
        </Button>
        <Button size="sm" variant="default" asChild className="gap-1.5 text-xs">
          <Link to="/">
            <Home className="size-3.5" />
            Return home
          </Link>
        </Button>
      </div>
    </main>
  );
}

export function AppNotFoundComponent() {
  return (
    <main
      className={
        "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center " +
        "bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50"
      }
    >
      <span className="text-muted-foreground" aria-hidden="true">
        <FileQuestion className="size-10" strokeWidth={2} />
      </span>
      <h1 className="text-lg font-semibold">Page not found</h1>
      <p className="max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400">
        The requested page could not be found or may have been moved.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <Button size="sm" variant="default" asChild className="gap-1.5 text-xs">
          <Link to="/">
            <Home className="size-3.5" />
            Return to dashboard
          </Link>
        </Button>
        <Button size="sm" variant="outline" asChild className="gap-1.5 text-xs">
          <Link to="/map">
            View regional map
          </Link>
        </Button>
      </div>
    </main>
  );
}

