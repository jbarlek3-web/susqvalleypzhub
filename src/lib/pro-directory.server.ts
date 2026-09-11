import countyRows from "@/lib/data/pro-directory/counties.json";
import municipalityRows from "@/lib/data/pro-directory/municipalities.json";
import type {
  CountyDirectoryPayload,
  CountyDirectoryRecord,
  MunicipalityDirectoryPayload,
} from "@/lib/pro-directory";

function officialCodeLibraryUrl(value: string | null) {
  return value && /^https:\/\/ecode360\.com\/[a-z]{2}\d{4}\/?$/i.test(value) ? value : null;
}

function countyZoningStatus(value: string): CountyDirectoryRecord["countyZoningStatus"] {
  return value === "YES" || value === "NO" ? value : "UNKNOWN";
}

export function countyDirectory(): CountyDirectoryPayload {
  return {
    source: countyRows.source,
    records: countyRows.records.map((record) => ({
      ...record,
      departmentName: record.departmentName.replace(/\s*\/\s*GIS\b/gi, ""),
      countyZoningStatus: countyZoningStatus(record.countyZoningStatus),
    })),
  };
}

export function municipalityDirectory(): MunicipalityDirectoryPayload {
  return {
    source: municipalityRows.source,
    compiled: municipalityRows.compiled,
    records: municipalityRows.records.map((record) => ({
      county: record.county,
      municipality: record.municipality,
      municipalityWebsiteUrl: record.municipalityWebsiteUrl,
      ecode360Url: officialCodeLibraryUrl(record.ecode360Url),
      countyPlanningUrl: record.countyPlanningUrl,
    })),
  };
}
