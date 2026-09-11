import directoryRows from "@/lib/data/pa-county-planning-directory.json";
import zoningSourceRows from "@/lib/data/pa-county-zoning-source-urls.json";
import type { CountyPlanningContact, CountyZoningSourceLinks } from "@/lib/types";

export const PA_COUNTY_PLANNING_DIRECTORY: CountyPlanningContact[] = directoryRows;

export const PA_COUNTY_ZONING_SOURCE_URLS: CountyZoningSourceLinks[] = zoningSourceRows;

export const PA_MUNICIPALITY_LIST_SOURCE_URL =
  PA_COUNTY_ZONING_SOURCE_URLS[0]?.municipalityListSourceUrl ??
  "https://dced.pa.gov/local-government/municipal-statistics/municipalities/";
