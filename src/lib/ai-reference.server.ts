import cumberlandRaw from "./data/ai-reference/cumberland.json" with { type: "json" };
import dauphinRaw from "./data/ai-reference/dauphin.json" with { type: "json" };
import lancasterRaw from "./data/ai-reference/lancaster.json" with { type: "json" };
import summaryRaw from "./data/ai-reference/summary.json" with { type: "json" };
import yorkRaw from "./data/ai-reference/york.json" with { type: "json" };

type Jurisdiction = { county: string; municipality: string };
type ReferenceDocument = {
  id: string;
  filename: string;
  aliases: string[];
  kind: string;
  category: string;
  status: string;
  jurisdictions: Jurisdiction[];
  pageCount: number;
  chunkCount: number;
  needsOcr: boolean;
};
type ReferenceChunk = {
  id: string;
  documentId: string;
  filename: string;
  category: string;
  page: number | null;
  text: string;
};

export type AiReferenceEvidence = {
  id: string;
  documentId: string;
  filename: string;
  kind: string;
  category: string;
  page: number | null;
  jurisdiction: string;
  text: string;
};
type ReferenceCorpus = {
  schemaVersion: number;
  audience: "ai-only";
  counties: string[];
  documents: ReferenceDocument[];
  chunks: ReferenceChunk[];
  coverage: {
    candidateFiles: number;
    uniqueDocuments: number;
    duplicateFiles: number;
    countyDocumentAssociations: Record<string, number>;
    municipalityDocumentAssociations: Record<string, number>;
    unresolved: Array<Record<string, string>>;
    failures: Array<Record<string, string>>;
  };
};

type ReferenceShard = {
  schemaVersion: number;
  audience: "ai-only";
  county: string;
  documents: ReferenceDocument[];
  chunks: ReferenceChunk[];
};

const summary = summaryRaw as Omit<ReferenceCorpus, "documents" | "chunks"> & {
  documentCount: number;
  chunkCount: number;
};
const shards = [cumberlandRaw, dauphinRaw, lancasterRaw, yorkRaw] as ReferenceShard[];
const uniqueDocuments = new Map<string, ReferenceDocument>();
const uniqueChunks = new Map<string, ReferenceChunk>();
for (const shard of shards) {
  for (const document of shard.documents) uniqueDocuments.set(document.id, document);
  for (const chunk of shard.chunks) uniqueChunks.set(chunk.id, chunk);
}
const corpus: ReferenceCorpus = {
  schemaVersion: summary.schemaVersion,
  audience: summary.audience,
  counties: summary.counties,
  documents: [...uniqueDocuments.values()],
  chunks: [...uniqueChunks.values()],
  coverage: summary.coverage,
};
const documentsById = new Map(corpus.documents.map((document) => [document.id, document]));
const municipalityCounties = new Map<string, Set<string>>();

const STOP_WORDS = new Set([
  "about",
  "after",
  "also",
  "and",
  "are",
  "county",
  "for",
  "from",
  "give",
  "known",
  "listed",
  "none",
  "parcel",
  "pennsylvania",
  "the",
  "this",
  "township",
  "with",
]);

function jurisdictionKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replaceAll("townhsip", "township")
    .replaceAll("towmship", "township")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

for (const document of corpus.documents) {
  for (const jurisdiction of document.jurisdictions) {
    const county = jurisdictionKey(jurisdiction.county);
    const municipality = jurisdictionKey(jurisdiction.municipality);
    if (municipality === `${county} county`) continue;
    const counties = municipalityCounties.get(municipality) ?? new Set<string>();
    counties.add(county);
    municipalityCounties.set(municipality, counties);
  }
}

function tokens(value: string): string[] {
  return [...new Set(value.toLowerCase().match(/[a-z0-9-]{3,}/g) ?? [])].filter(
    (token) => !STOP_WORDS.has(token),
  );
}

function appliesTo(document: ReferenceDocument, county: string, municipality: string): boolean {
  const countyKey = jurisdictionKey(county);
  const municipalityKey = jurisdictionKey(municipality);
  return document.jurisdictions.some((jurisdiction) => {
    if (jurisdictionKey(jurisdiction.county) !== countyKey) return false;
    const sourceMunicipality = jurisdictionKey(jurisdiction.municipality);
    return sourceMunicipality === municipalityKey || sourceMunicipality === `${countyKey} county`;
  });
}

function scoreChunk(chunk: ReferenceChunk, queryTokens: string[]): number {
  const title = chunk.filename.toLowerCase();
  const text = chunk.text.toLowerCase();
  let score = 0;
  for (const token of queryTokens) {
    if (title.includes(token)) score += 12;
    const matches = text.split(token).length - 1;
    score += Math.min(matches, 6) * 2;
  }
  if (/zoning|district|setback|variance|special exception/.test(text)) score += 2;
  return score;
}

export function getAiReferenceEvidence(input: {
  municipality: string;
  county: string;
  zoning: string;
  constraints: string[];
  question?: string;
}): AiReferenceEvidence[] {
  const requestedCounty = jurisdictionKey(input.county);
  const knownCounties = municipalityCounties.get(jurisdictionKey(input.municipality));
  if (knownCounties && !knownCounties.has(requestedCounty)) return [];

  const queryTokens = tokens(
    [
      input.municipality,
      input.county,
      input.zoning,
      ...input.constraints,
      input.question ??
        "zoning setbacks permitted uses permit application fee stormwater utilities SALDO",
    ].join(" "),
  );
  const ranked = corpus.chunks
    .map((chunk) => ({ chunk, document: documentsById.get(chunk.documentId) }))
    .filter(
      (item): item is { chunk: ReferenceChunk; document: ReferenceDocument } =>
        Boolean(item.document) &&
        item.document?.status === "ready" &&
        appliesTo(item.document, input.county, input.municipality),
    )
    .map(({ chunk, document }) => ({ chunk, document, score: scoreChunk(chunk, queryTokens) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.chunk.id.localeCompare(b.chunk.id));

  const selected: Array<{ chunk: ReferenceChunk; document: ReferenceDocument }> = [];
  const perDocument = new Map<string, number>();
  let characters = 0;
  for (const { chunk, document } of ranked) {
    const count = perDocument.get(chunk.documentId) ?? 0;
    if (count >= 2 || selected.length >= 10 || characters + chunk.text.length > 14_000) continue;
    selected.push({ chunk, document });
    perDocument.set(chunk.documentId, count + 1);
    characters += chunk.text.length;
  }

  return selected.map(({ chunk, document }) => {
    const source = document.jurisdictions.find((jurisdiction) =>
      appliesTo({ ...document, jurisdictions: [jurisdiction] }, input.county, input.municipality),
    );
    return {
      id: chunk.id,
      documentId: document.id,
      filename: chunk.filename,
      kind: document.kind,
      category: document.category,
      page: chunk.page,
      jurisdiction: `${source?.municipality ?? input.municipality}, ${source?.county ?? input.county} County`,
      text: chunk.text,
    };
  });
}

export function getAiReferenceContext(input: Parameters<typeof getAiReferenceEvidence>[0]): string {
  return getAiReferenceEvidence(input)
    .map((evidence) => {
      const locator = evidence.page ? `, page ${evidence.page}` : "";
      const jurisdiction = evidence.jurisdiction.split(",")[0] ?? input.municipality;
      return `[${evidence.id}] [${input.county} / ${jurisdiction} reference: ${evidence.filename}${locator}]\n${evidence.text}`;
    })
    .join("\n\n---\n\n");
}

export function getAiReferenceScope() {
  const municipalities = new Map<string, Set<string>>();
  for (const county of corpus.counties) municipalities.set(county, new Set<string>());

  for (const document of corpus.documents) {
    if (document.status !== "ready") continue;
    for (const jurisdiction of document.jurisdictions) {
      const county = corpus.counties.find(
        (candidate) => jurisdictionKey(candidate) === jurisdictionKey(jurisdiction.county),
      );
      if (!county) continue;
      const municipality = jurisdiction.municipality.trim();
      if (!/(township|borough|city|county)$/i.test(municipality)) continue;
      municipalities.get(county)?.add(municipality);
    }
  }

  return {
    counties: corpus.counties.map((county) => ({
      county,
      municipalities: [...(municipalities.get(county) ?? [])].sort((a, b) => a.localeCompare(b)),
    })),
    documentCount: corpus.documents.length,
    chunkCount: corpus.chunks.length,
  };
}

export const AI_REFERENCE_SUMMARY = {
  schemaVersion: corpus.schemaVersion,
  audience: corpus.audience,
  counties: corpus.counties,
  documentCount: corpus.documents.length,
  chunkCount: corpus.chunks.length,
  coverage: corpus.coverage,
  documents: corpus.documents.map((document) => ({
    id: document.id,
    filename: document.filename,
    aliases: document.aliases,
    kind: document.kind,
    category: document.category,
    status: document.status,
    jurisdictions: document.jurisdictions,
    pageCount: document.pageCount,
    chunkCount: document.chunkCount,
    needsOcr: document.needsOcr,
  })),
} as const;
