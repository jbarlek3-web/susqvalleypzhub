import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_ALERTS, SEED_COMMENTS, SEED_PROJECTS } from "@/lib/data/catalog";
import { PARCELS } from "@/lib/data/parcels";
import type { YorkLookup } from "@/lib/york-lookup";
import type {
  AlertItem,
  County,
  LayerId,
  Profile,
  Project,
  TeamComment,
} from "@/lib/types";

export const PREVIEW_MS = 5 * 60 * 1000;

const DEFAULT_LAYERS: Record<LayerId, boolean> = {
  zoning: true,
  flood: false,
  slopes: false,
  footprints: true,
  yorkParcels: true,
  yorkZoning: true,
  parcels: true,
  municipalities: true,
  hydro: false,
  soils: false,
  topo: false,
  yorkPasda: false,
  traffic: false,
  improvements: false,
  sewer: false,
  water: false,
  setbacks: false,
  inundation: false,
  ev: false,
  buggy: false,
  logistics: false,
  bridges: false,
};

type State = {
  previewStartedAt: number | null;
  isPro: boolean;
  profile: Profile | null;
  county: County | "all";
  layers: Record<LayerId, boolean>;
  satellite: boolean;
  floodFt: 0 | 1 | 3 | 5;
  selectedIds: string[];
  batchMode: boolean;
  batchName: string;
  query: string;
  lookup: YorkLookup | null;
  lookupError: string | null;
  lookupBusy: boolean;
  projects: Project[];
  comments: TeamComment[];
  alerts: AlertItem[];
  savedIds: string[];
  alertCounties: Record<County, boolean>;
  alertFreq: "Immediate" | "Daily Digest" | "Weekly";
  startPreview: () => void;
  subscribe: (profile: Profile) => void;
  signOut: () => void;
  setCounty: (c: County | "all") => void;
  toggleLayer: (id: LayerId) => void;
  resetLayers: () => void;
  setFloodFt: (n: 0 | 1 | 3 | 5) => void;
  setSatellite: (v: boolean) => void;
  selectParcel: (id: string, additive?: boolean) => void;
  clearSelection: () => void;
  setBatchMode: (v: boolean) => void;
  setBatchName: (n: string) => void;
  setQuery: (q: string) => void;
  setLookupResult: (r: YorkLookup | null, error?: string | null) => void;
  setLookupBusy: (v: boolean) => void;
  clearLookup: () => void;
  saveBatchAsProject: (name: string) => void;
  toggleSaved: (id: string) => void;
  addComment: (parcelId: string, author: string, body: string) => void;
  markAlertsRead: () => void;
  setAlertCounty: (c: County, on: boolean) => void;
  setAlertFreq: (f: State["alertFreq"]) => void;
  previewActive: () => boolean;
  previewExpired: () => boolean;
  canExport: () => boolean;
};

export const useHub = create<State>()(
  persist(
    (set, get) => ({
      previewStartedAt: Date.now(),
      isPro: false,
      profile: null,
      county: "all",
      layers: { ...DEFAULT_LAYERS },
      satellite: false,
      floodFt: 0,
      selectedIds: ["p-1042"],
      batchMode: false,
      batchName: "",
      query: "",
      lookup: null,
      lookupError: null,
      lookupBusy: false,
      projects: SEED_PROJECTS,
      comments: SEED_COMMENTS,
      alerts: SEED_ALERTS,
      savedIds: ["p-1042"],
      alertCounties: { York: true, Cumberland: true, Dauphin: false, Lancaster: true },
      alertFreq: "Daily Digest",
      startPreview: () => set({ previewStartedAt: Date.now() }),
      subscribe: (profile) => set({ isPro: true, profile }),
      signOut: () => set({ isPro: false, profile: null }),
      setCounty: (county) => set({ county }),
      toggleLayer: (id) =>
        set({
          layers: {
            ...get().layers,
            [id]: !(get().layers[id] ?? DEFAULT_LAYERS[id]),
          },
        }),
      resetLayers: () => set({ layers: { ...DEFAULT_LAYERS }, floodFt: 0 }),
      setFloodFt: (floodFt) => set({ floodFt, layers: { ...get().layers, inundation: true } }),
      setSatellite: (satellite) => set({ satellite }),
      selectParcel: (id, additive) => {
        const { selectedIds, batchMode } = get();
        const multi = additive || batchMode;
        if (!multi) {
          set({ selectedIds: [id] });
          return;
        }
        set({
          selectedIds: selectedIds.includes(id)
            ? selectedIds.filter((x) => x !== id)
            : [...selectedIds, id],
        });
      },
      clearSelection: () => set({ selectedIds: [] }),
      setBatchMode: (batchMode) => set({ batchMode }),
      setBatchName: (batchName) => set({ batchName }),
      setQuery: (query) => set({ query }),
      setLookupResult: (lookup, lookupError = null) =>
        set({
          lookup,
          lookupError: lookupError ?? null,
          lookupBusy: false,
          county: lookup ? "York" : get().county,
        }),
      setLookupBusy: (lookupBusy) =>
        set({ lookupBusy, lookupError: lookupBusy ? null : get().lookupError }),
      clearLookup: () => set({ lookup: null, lookupError: null, lookupBusy: false }),
      saveBatchAsProject: (name) => {
        const { selectedIds, projects } = get();
        const selected = PARCELS.filter((p) => selectedIds.includes(p.id));
        if (!selected.length) return;
        const acres = selected.reduce((s, p) => s + p.acres, 0);
        const counties = new Set(selected.map((p) => p.county));
        const project: Project = {
          id: `prj-${Date.now()}`,
          name,
          county: counties.size === 1 ? selected[0]!.county : "Multi",
          municipality: selected[0]!.municipality,
          status: "Lead",
          parcelIds: selectedIds,
          acres: Math.round(acres * 100) / 100,
          modified: "Just now",
          constraints: [...new Set(selected.flatMap((p) => p.constraints))],
        };
        set({ projects: [project, ...projects] });
      },
      toggleSaved: (id) => {
        const { savedIds } = get();
        set({
          savedIds: savedIds.includes(id)
            ? savedIds.filter((x) => x !== id)
            : [...savedIds, id],
        });
      },
      addComment: (parcelId, author, body) => {
        const comment: TeamComment = {
          id: `c-${Date.now()}`,
          parcelId,
          author,
          initials: author
            .split(" ")
            .map((p) => p[0] ?? "")
            .join("")
            .slice(0, 2)
            .toUpperCase(),
          body,
          at: "Just now",
        };
        set({ comments: [comment, ...get().comments] });
      },
      markAlertsRead: () =>
        set({ alerts: get().alerts.map((a) => ({ ...a, unread: false })) }),
      setAlertCounty: (c, on) =>
        set({ alertCounties: { ...get().alertCounties, [c]: on } }),
      setAlertFreq: (alertFreq) => set({ alertFreq }),
      previewActive: () => {
        const t = get().previewStartedAt;
        if (!t || get().isPro) return false;
        return Date.now() - t < PREVIEW_MS;
      },
      previewExpired: () => {
        const t = get().previewStartedAt;
        if (!t || get().isPro) return false;
        return Date.now() - t >= PREVIEW_MS;
      },
      canExport: () => get().isPro || get().previewActive(),
    }),
    { name: "svph-hub", skipHydration: true },
  ),
);

export function selectedParcels() {
  const ids = useHub.getState().selectedIds;
  return PARCELS.filter((p) => ids.includes(p.id));
}
