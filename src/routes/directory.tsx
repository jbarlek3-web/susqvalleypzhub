import { createFileRoute } from "@tanstack/react-router";
import {
  Building2,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  getProCountyDirectory,
  getProMunicipalityDirectory,
  type CountyDirectoryPayload,
  type CountyDirectoryRecord,
  type MunicipalityDirectoryPayload,
  type MunicipalityDirectoryRecord,
} from "@/lib/pro-directory";

export const Route = createFileRoute("/directory")({ component: ProDirectories });

type LoadState<T> = { data: T | null; error: string | null; loading: boolean };

function ProDirectories() {
  const [activeTab, setActiveTab] = useState("counties");
  const [counties, setCounties] = useState<LoadState<CountyDirectoryPayload>>({
    data: null,
    error: null,
    loading: true,
  });
  const [municipalities, setMunicipalities] = useState<LoadState<MunicipalityDirectoryPayload>>({
    data: null,
    error: null,
    loading: false,
  });

  useEffect(() => {
    let current = true;
    void getProCountyDirectory()
      .then((data) => {
        if (current) setCounties({ data, error: null, loading: false });
      })
      .catch(() => {
        if (current)
          setCounties({
            data: null,
            error: "The county directory could not be loaded.",
            loading: false,
          });
      });
    return () => {
      current = false;
    };
  }, []);

  useEffect(() => {
    if (activeTab !== "municipalities" || municipalities.data || municipalities.loading) return;
    let current = true;
    setMunicipalities((state) => ({ ...state, error: null, loading: true }));
    void getProMunicipalityDirectory()
      .then((data) => {
        if (current) setMunicipalities({ data, error: null, loading: false });
      })
      .catch(() => {
        if (current)
          setMunicipalities({
            data: null,
            error: "The municipal source directory could not be loaded.",
            loading: false,
          });
      });
    return () => {
      current = false;
    };
  }, [activeTab, municipalities.data, municipalities.loading]);

  return (
    <AppShell>
      <section className="rounded-xl border border-outline-variant border-t-4 border-t-brand-lime bg-card px-5 py-7 md:px-8">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-secondary">
            Pennsylvania development directories
          </p>
          <Badge variant="approved">
            <ShieldCheck className="mr-1 size-3" /> Pro only
          </Badge>
        </div>
        <h1 className="mt-2 text-3xl font-semibold">Planning and zoning directories</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
          Search county planning contacts and official municipal source websites. Field ACQ points
          you to the agency, code library, or planning page where current materials are maintained.
        </p>
      </section>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList aria-label="Pro directory selection" className="h-auto flex-wrap">
          <TabsTrigger value="counties">County P&amp;Z directory</TabsTrigger>
          <TabsTrigger value="municipalities">Municipal source directory</TabsTrigger>
        </TabsList>
        <TabsContent value="counties" className="mt-4">
          <DirectoryLoadState state={counties}>
            {(data) => <CountyDirectory data={data} />}
          </DirectoryLoadState>
        </TabsContent>
        <TabsContent value="municipalities" className="mt-4">
          <DirectoryLoadState state={municipalities}>
            {(data) => <MunicipalityDirectory data={data} />}
          </DirectoryLoadState>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function DirectoryLoadState<T>({
  state,
  children,
}: {
  state: LoadState<T>;
  children: (data: T) => ReactNode;
}) {
  if (state.loading) {
    return (
      <div className="grid min-h-64 place-items-center rounded-lg border border-outline-variant bg-card">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Loading protected directory…
        </div>
      </div>
    );
  }
  if (state.error || !state.data) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-card px-5 py-12 text-center">
        <p className="font-medium">{state.error ?? "This directory is unavailable."}</p>
        <p className="mt-2 text-sm text-muted-foreground">Reload the page to try again.</p>
      </div>
    );
  }
  return <>{children(state.data)}</>;
}

function CountyDirectory({ data }: { data: CountyDirectoryPayload }) {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();
  const filtered = useMemo(
    () =>
      data.records.filter((entry) =>
        needle
          ? `${entry.county} ${entry.departmentName} ${entry.directorOrZoningOfficer ?? ""}`
              .toLowerCase()
              .includes(needle)
          : true,
      ),
    [data.records, needle],
  );

  return (
    <section>
      <DirectorySearch
        id="county-directory-search"
        value={query}
        onChange={setQuery}
        placeholder="Search county, department, or official"
      />
      <p className="mt-3 text-xs text-muted-foreground">
        Showing {filtered.length} of {data.records.length} county departments · Source:{" "}
        {data.source}
      </p>
      {filtered.length ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {filtered.map((entry) => (
            <CountyCard key={entry.county} entry={entry} />
          ))}
        </div>
      ) : (
        <EmptySearch label="county contacts" onClear={() => setQuery("")} />
      )}
    </section>
  );
}

function CountyCard({ entry }: { entry: CountyDirectoryRecord }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-secondary">
              {entry.county} County
            </p>
            <h2 className="mt-1 text-lg font-semibold leading-snug">{entry.departmentName}</h2>
          </div>
          <Badge variant={entry.countyZoningStatus === "YES" ? "approved" : "outline"}>
            County zoning ordinance: {entry.countyZoningStatus}
          </Badge>
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {entry.directorOrZoningOfficer ? (
            <ContactLine icon={UserRound} text={entry.directorOrZoningOfficer} />
          ) : null}
          {entry.phoneNumber ? (
            <ContactLine icon={Phone} text={entry.phoneNumber} href={`tel:${entry.phoneNumber}`} />
          ) : null}
          {entry.emailAddress ? (
            <ContactLine
              icon={Mail}
              text={entry.emailAddress}
              href={`mailto:${entry.emailAddress}`}
            />
          ) : null}
          {entry.physicalAddress ? (
            <ContactLine icon={MapPin} text={entry.physicalAddress} />
          ) : null}
        </ul>
        {entry.websiteUrl ? (
          <Button asChild variant="outline" size="sm" className="mt-5">
            <a href={entry.websiteUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-3.5" /> Open department website
            </a>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}

function ContactLine({
  icon: Icon,
  text,
  href,
}: {
  icon: typeof Phone;
  text: string;
  href?: string;
}) {
  const content = (
    <>
      <Icon className="mt-0.5 size-4 shrink-0 text-secondary" /> <span>{text}</span>
    </>
  );
  return (
    <li className="flex items-start gap-2 text-on-surface-variant">
      {href ? (
        <a className="flex items-start gap-2 hover:text-primary hover:underline" href={href}>
          {content}
        </a>
      ) : (
        content
      )}
    </li>
  );
}

const MUNICIPAL_LINKS: Array<[keyof MunicipalityDirectoryRecord, string]> = [
  ["municipalityWebsiteUrl", "Municipal website"],
  ["ecode360Url", "Official code library"],
  ["countyPlanningUrl", "County planning website"],
];

function MunicipalityDirectory({ data }: { data: MunicipalityDirectoryPayload }) {
  const [query, setQuery] = useState("");
  const [county, setCounty] = useState("all");
  const [visible, setVisible] = useState(60);
  const counties = useMemo(
    () => [...new Set(data.records.map((record) => record.county))].sort(),
    [data.records],
  );
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return data.records.filter(
      (record) =>
        (county === "all" || record.county === county) &&
        (!needle || `${record.municipality} ${record.county}`.toLowerCase().includes(needle)),
    );
  }, [county, data.records, query]);

  useEffect(() => setVisible(60), [county, query]);

  return (
    <section>
      <div className="grid gap-3 rounded-lg border border-outline-variant bg-card p-4 md:grid-cols-[minmax(0,1fr)_260px]">
        <DirectorySearch
          id="municipality-directory-search"
          value={query}
          onChange={setQuery}
          placeholder="Search municipality or notes"
          bare
        />
        <label className="grid gap-1 text-xs font-semibold text-on-surface-variant">
          County
          <select
            id="municipality-directory-county"
            name="municipalityDirectoryCounty"
            value={county}
            onChange={(event) => setCounty(event.target.value)}
            className="h-10 rounded-md border border-outline-variant bg-card px-3 text-sm text-on-surface"
          >
            <option value="all">All {counties.length} counties</option>
            {counties.map((name) => (
              <option key={name} value={name}>
                {name} County
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Showing {Math.min(visible, filtered.length)} of {filtered.length} matching municipalities ·{" "}
        {data.records.length} total · Compiled {data.compiled} · Source: {data.source}
      </p>
      {filtered.length ? (
        <>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {filtered.slice(0, visible).map((entry) => (
              <MunicipalityCard key={`${entry.county}-${entry.municipality}`} entry={entry} />
            ))}
          </div>
          {visible < filtered.length ? (
            <div className="mt-6 text-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setVisible((value) => value + 60)}
              >
                Show 60 more
              </Button>
            </div>
          ) : null}
        </>
      ) : (
        <EmptySearch
          label="municipal records"
          onClear={() => {
            setQuery("");
            setCounty("all");
          }}
        />
      )}
    </section>
  );
}

function MunicipalityCard({ entry }: { entry: MunicipalityDirectoryRecord }) {
  const links = MUNICIPAL_LINKS.flatMap(([key, label]) => {
    const value = entry[key];
    return typeof value === "string" && /^https?:\/\//i.test(value) ? [{ label, url: value }] : [];
  });
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-secondary">
          {entry.county} County
        </p>
        <h2 className="mt-1 text-lg font-semibold">{entry.municipality}</h2>
        {links.length ? (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {links.map((link) => (
              <li key={`${link.label}-${link.url}`}>
                <a
                  className="inline-flex items-start gap-2 text-sm font-medium text-primary-container hover:underline"
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="mt-0.5 size-3.5 shrink-0" /> {link.label}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">
            No official municipal or county source website is listed.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function DirectorySearch({
  id,
  value,
  onChange,
  placeholder,
  bare = false,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  bare?: boolean;
}) {
  const field = (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
      <Input
        id={id}
        name={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="pl-9"
        autoComplete="off"
      />
    </div>
  );
  return bare ? (
    field
  ) : (
    <div className="rounded-lg border border-outline-variant bg-card p-4">{field}</div>
  );
}

function EmptySearch({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <div className="mt-4 rounded-lg border border-dashed border-outline-variant bg-card px-5 py-12 text-center">
      <Building2 className="mx-auto size-8 text-on-surface-variant" />
      <p className="mt-2 font-medium">No {label} match this search.</p>
      <button
        type="button"
        className="mt-2 text-sm font-semibold text-primary-container underline"
        onClick={onClear}
      >
        Clear filters
      </button>
    </div>
  );
}
