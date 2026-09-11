import type { AlertItem, County } from "@/lib/types";

/** Increment when the official-source watchlist changes. */
export const NOTIFICATION_FEED_VERSION = 3;

const OFFICIAL_PLANNING_SOURCES: Array<{
  county: County;
  title: string;
  url: string;
}> = [
  {
    county: "York",
    title: "York County Planning Commission",
    url: "https://www.ycpc.org/",
  },
  {
    county: "Cumberland",
    title: "Cumberland County Planning Department",
    url: "https://www.cumberlandcountypa.gov/120/Planning-Department",
  },
  {
    county: "Dauphin",
    title: "Dauphin County Planning Commission",
    url: "https://www.tcrpc-pa.org/dcpc-contact",
  },
  {
    county: "Lancaster",
    title: "Lancaster County Planning",
    url: "https://lancastercountyplanning.org/",
  },
];

/**
 * In-app shortcuts to official planning websites. Municipal and county files
 * remain available to the private Ordinance Aide corpus, not this client feed.
 */
export const OPERATIONAL_ALERTS: AlertItem[] = OFFICIAL_PLANNING_SOURCES.map((source) => ({
  id: `official-planning-${source.county.toLowerCase()}`,
  kind: "diligence",
  title: source.title,
  body: `Use the official ${source.county} County planning website to locate current ordinances, applications, fee schedules, maps, and municipal contacts.`,
  at: "Official source",
  unread: true,
  county: source.county,
  municipality: `${source.county} County`,
  source: "Official planning website",
  actionUrl: source.url,
  actionLabel: "Open official planning website",
  priority: "watch",
}));
