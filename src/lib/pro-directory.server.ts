import countyRows from "@/lib/data/pro-directory/counties.json";
import municipalityRows from "@/lib/data/pro-directory/municipalities.json";
import type { CountyDirectoryPayload, MunicipalityDirectoryPayload } from "@/lib/pro-directory";

export function countyDirectory(): CountyDirectoryPayload {
  return countyRows as CountyDirectoryPayload;
}

export function municipalityDirectory(): MunicipalityDirectoryPayload {
  return municipalityRows as MunicipalityDirectoryPayload;
}
