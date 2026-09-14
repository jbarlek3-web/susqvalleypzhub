import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, BookOpen, Box, ContactRound, FileText, HelpCircle, Menu, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FieldAcqOrdinanceAideLogo } from "@/components/brand/field-acq-ordinance-aide-logo";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { PARCELS, searchParcels } from "@/lib/data/parcels";
import { ZONING_CODES as CODES } from "@/lib/data/zoning";
import { useHub } from "@/lib/store";
import { cn } from "@/lib/utils";
import { getEntitlement } from "@/lib/billing";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/map", label: "Map" },
  { to: "/scene-3d", label: "3D House" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/aide", label: "Ordinance AI" },
  { to: "/directory", label: "Directory" },
  { to: "/zoning", label: "Zoning" },
  { to: "/acquire", label: "Acquire" },
  { to: "/insights", label: "Insights" },
  { to: "/subscription", label: "Pro" },
];

const MORE = [
  { to: "/scene-3d", label: "3D Parcel Model", icon: Box },
  { to: "/directory", label: "PA County Directory", icon: ContactRound },
  { to: "/minutes", label: "Meeting Minutes", icon: FileText },
  { to: "/guide", label: "Quick Start", icon: BookOpen },
  { to: "/acquire", label: "Acquisition Toolkit", icon: FileText },
];

export function AppShell({
  children,
  fullBleed = false,
}: {
  children: ReactNode;
  fullBleed?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const unread = useHub((s) => s.alerts.filter((a) => a.unread).length);
  const setPro = useHub((s) => s.setPro);
  const { user } = useCurrentUserState();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void useHub.persist.rehydrate();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA")
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (!user) {
      setPro(false);
      return;
    }
    let active = true;
    void getEntitlement()
      .then((value) => {
        if (active) setPro(value.isPro);
      })
      .catch(() => {
        if (active) setPro(false);
      });
    return () => {
      active = false;
    };
  }, [user, setPro]);

  const hits = useMemo(() => {
    if (q.trim().length < 2)
      return {
        parcels: [] as typeof PARCELS,
        codes: [] as typeof CODES,
      };
    const parcels = searchParcels(q).slice(0, 5);
    const codes = CODES.filter((c) =>
      `${c.section} ${c.municipality}`.toLowerCase().includes(q.toLowerCase()),
    ).slice(0, 3);
    return { parcels, codes };
  }, [q]);

  return (
    <div className="min-h-dvh bg-background text-on-surface">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground focus:shadow-lg focus:ring-2 focus:ring-ring focus:outline-none"
      >
        Skip to main content
      </a>
      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-outline-variant/80 bg-card/85 text-on-surface shadow-[0_2px_16px_rgb(17_40_71/0.06)] backdrop-blur-xl md:h-20 transition-all">
        <div className="mx-auto flex h-full max-w-[1400px] items-center gap-3 px-3 md:px-6">
          <Button
            variant="nav"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </Button>
          <Link to="/" preload="intent" className="flex min-w-0 items-center transition-transform active:scale-95">
            <FieldAcqOrdinanceAideLogo className="h-10 max-w-[150px] md:h-12 md:max-w-[190px]" />
          </Link>
          <nav className="ml-3 hidden items-center gap-1 rounded-full border border-outline-variant/60 bg-surface-low/70 p-1 backdrop-blur-md lg:flex">
            {NAV.map((n) => {
              const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  preload="intent"
                  className={cn(
                    "relative rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-all duration-150 active:scale-95",
                    active
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-on-surface-variant hover:bg-surface-high/60 hover:text-on-surface",
                  )}
                >
                  {n.label}
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-brand-lime shadow-[0_0_6px_var(--color-brand-lime)]" />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="relative hidden md:block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
              <input
                ref={searchInputRef}
                id="global-parcel-search"
                name="globalParcelSearch"
                type="search"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => setSearchOpen(true)}
                placeholder="Address, APN, owner…"
                aria-label="Search by address, APN, or owner"
                autoComplete="off"
                suppressHydrationWarning
                className="h-9 w-48 rounded-full border border-outline-variant/70 bg-surface-low/80 pl-8 pr-12 text-sm text-on-surface placeholder:text-on-surface-variant focus:w-64 focus:outline-none focus:ring-2 focus:ring-secondary/40 focus:border-secondary transition-all lg:w-56"
              />
              <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2">
                <kbd className="hidden sm:inline-flex items-center rounded border border-outline-variant bg-surface px-1.5 py-0.5 text-[10px] font-medium text-on-surface-variant">
                  ⌘K
                </kbd>
              </div>
              {searchOpen && q.trim().length >= 2 && hits && (
                <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-outline-variant bg-card/95 p-2 text-on-surface shadow-2xl backdrop-blur-lg animate-page-enter">
                  <SearchResults hits={hits} onPick={() => setSearchOpen(false)} />
                </div>
              )}
            </div>
            <Link to="/guide" preload="intent" className="hidden md:block">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary-fixed active:scale-95 transition-transform"
                aria-label="Help"
              >
                <HelpCircle />
              </Button>
            </Link>
            <Link to="/notifications" preload="intent" className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary-fixed active:scale-95 transition-transform"
                aria-label="Notifications"
              >
                <Bell />
              </Button>
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive animate-pulse" />
              )}
            </Link>
            <SignedOut>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-primary hover:bg-primary-fixed active:scale-95">
                  Sign In
                </Button>
              </Link>
            </SignedOut>
            <SignedIn>
              <div className="hidden rounded-full border border-outline-variant/80 bg-surface-low px-2 py-1 text-on-surface sm:block">
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </div>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="bg-card p-0 text-on-surface">
          <div className="flex items-center border-b border-outline-variant px-4 py-5">
            <FieldAcqOrdinanceAideLogo className="h-11 max-w-[180px]" />
          </div>
          <nav className="flex flex-col p-2">
            {NAV.concat(MORE.map((m) => ({ to: m.to, label: m.label }))).map((n) => (
              <Link
                key={n.to}
                to={n.to}
                preload="intent"
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-sm font-medium hover:bg-primary-fixed hover:text-primary transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="border-t border-outline-variant p-4">
            <SignedOut>
              <Button asChild className="w-full">
                <Link to="/login" onClick={() => setOpen(false)}>
                  Sign In
                </Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center justify-center rounded-lg border border-outline-variant bg-surface-low p-2 text-on-surface">
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </SheetContent>
      </Sheet>

      <main
        id="main-content"
        key={pathname}
        className={cn(
          "animate-page-enter",
          fullBleed ? "pt-16 md:pt-20" : "mx-auto max-w-[1400px] px-3 pb-16 pt-20 md:px-6 md:pt-24",
        )}
      >
        {children}
      </main>

      {!fullBleed && <SiteFooter />}
    </div>
  );
}

function SearchResults({
  hits,
  onPick,
}: {
  hits: {
    parcels: typeof PARCELS;
    codes: typeof CODES;
  };
  onPick: () => void;
}) {
  if (!hits.parcels.length && !hits.codes.length) {
    return <p className="p-3 text-sm text-muted-foreground">No matches.</p>;
  }
  return (
    <div className="max-h-80 overflow-auto text-sm">
      {hits.parcels.map((p) => (
        <Link
          key={p.id}
          to="/parcels/$id"
          params={{ id: p.id }}
          onClick={onPick}
          className="block rounded-sm px-2 py-2 hover:bg-surface-low"
        >
          <div className="font-medium">{p.address}</div>
          <div className="text-xs text-muted-foreground">
            {p.municipality} · {p.zoning}
          </div>
        </Link>
      ))}
      {hits.codes.map((c) => (
        <Link
          key={c.id}
          to="/zoning"
          onClick={onPick}
          className="block rounded-sm px-2 py-2 hover:bg-surface-low"
        >
          <div className="font-medium">{c.section}</div>
          <div className="text-xs text-muted-foreground">{c.municipality}</div>
        </Link>
      ))}
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant bg-surface-low">
      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 md:grid-cols-4 md:px-6">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            County Resources
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link className="font-medium text-primary-container hover:underline" to="/directory">
                Pennsylvania County Planning and Zoning Directory
              </Link>
            </li>
            <li>
              <a
                className="hover:text-primary-container"
                href="https://www.ycpc.org/"
                target="_blank"
                rel="noreferrer"
              >
                York County
              </a>
            </li>
            <li>
              <a
                className="hover:text-primary-container"
                href="https://www.cumberlandcountypa.gov/120/Planning-Department"
                target="_blank"
                rel="noreferrer"
              >
                Cumberland County
              </a>
            </li>
            <li>
              <a
                className="hover:text-primary-container"
                href="https://www.tcrpc-pa.org/dcpc-about"
                target="_blank"
                rel="noreferrer"
              >
                Dauphin County
              </a>
            </li>
            <li>
              <a
                className="hover:text-primary-container"
                href="https://lancastercountyplanning.org/"
                target="_blank"
                rel="noreferrer"
              >
                Lancaster County
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Contact Us
          </p>
          <div className="space-y-2 text-sm">
            <p>Field Acq Team</p>
            <p>
              <a className="hover:text-primary-container" href="mailto:admin@fieldacq.com">
                admin@fieldacq.com
              </a>
            </p>
            <p>
              Visit our Home Page at{" "}
              <a
                className="hover:text-primary-container"
                href="https://fieldacq.online"
                target="_blank"
                rel="noreferrer"
              >
                Fieldacq.online
              </a>
            </p>
            <p>
              and our GC CRM at{" "}
              <a
                className="hover:text-primary-container"
                href="https://fieldacq.com"
                target="_blank"
                rel="noreferrer"
              >
                Fieldacq.com
              </a>
            </p>
          </div>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Legal
          </p>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/privacy" className="hover:text-primary-container">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms" className="hover:text-primary-container">
                Terms of Use
              </Link>
            </li>
            <li>
              <Link to="/guide" className="hover:text-primary-container">
                Help & Support
              </Link>
            </li>
          </ul>
        </div>
        <div className="flex items-end">
          <FieldAcqOrdinanceAideLogo className="w-full max-w-60" />
        </div>
      </div>
      <div className="border-t border-outline-variant bg-surface px-4 py-5 text-center text-xs leading-relaxed text-muted-foreground">
        Field ACQ Ordinance Aide is an independent information service. It is not affiliated with,
        endorsed by, or operated by any Pennsylvania municipality, county, or state agency.
        Questions or concerns may be sent to{" "}
        <a className="font-medium underline" href="mailto:admin@fieldacq.com">
          admin@fieldacq.com
        </a>
        ; we aim to respond within 24–48 hours.
      </div>
      <div className="border-t border-outline-variant py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
        © 2026 Field ACQ Ordinance Aide. All Rights Reserved.
      </div>
    </footer>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "Lead"
      ? "lead"
      : status === "Permitting"
        ? "permitting"
        : status === "Approved"
          ? "approved"
          : "diligence";
  return (
    <span className={cn("inline-flex")}>{status && <StatusInner v={variant} s={status} />}</span>
  );
}

function StatusInner({ v, s }: { v: "lead" | "permitting" | "approved" | "diligence"; s: string }) {
  const cls = {
    lead: "border border-primary/30 bg-primary-fixed text-primary",
    permitting: "border border-secondary/30 bg-secondary-container text-secondary",
    approved: "border border-secondary/30 bg-secondary-container text-secondary",
    diligence: "border border-outline-variant bg-surface-high text-on-surface",
  }[v];
  return (
    <span
      className={cn("rounded-sm px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider", cls)}
    >
      {s}
    </span>
  );
}
