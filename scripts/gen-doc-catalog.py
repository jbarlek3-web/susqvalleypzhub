#!/usr/bin/env python3
"""Build src/lib/data/documents.ts from official, recovered, and Drive sources."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src/lib/data/documents.ts"
SUMMARY_OUT = ROOT / "src/lib/data/regional-document-coverage.ts"
CORE_COUNTIES = ("York", "Cumberland", "Dauphin", "Lancaster")

SKIP_RE = re.compile(
    r"complaint|right[- ]to[- ]know|right to know|volunteer application|"
    r"pool pass|park reservation|yard sale|peddl|peddlar|tenant registration|"
    r"vacation check|water quality|ccr water|sewer bill|voter registration|"
    r"hauler|residency report|chicken permit|food truck|fireworks permit|"
    r"alarm device|brush permit|burn permit|community room|junior council|"
    r"america 250|final bill|grease trap|facade program|penn waste|"
    r"chemical toilet|plumber.?s license|rental registration|tenant-change|"
    r"special-event-application|special event application|dumpster.?pod|"
    r"non-conforming use or structure|certificate application|"
    r"release form|storm floodwater safety|proposed green lane|"
    r"york excavating|serving your community|ems reflective|"
    r"idde citizen|landlord tenant form|ord\. 2024-1 amend chapter 23 of fire|"
    r"ord\. 2025-4 noise|weight limit ordinance|peddling and soliciting|"
    r"nuisance form|rental unit -tenant|park facilities|damage report|"
    r"affected by a storm|transient retail|this form\.doc|"
    r"lst refund|quarterly sewer rate|sewer connection application|"
    r"plumber license|pods unit|public fireworks|street paving|"
    r"setting 19\d\d tax|tax rate\.pdf|realty transfer|street lighting|"
    r"numbering of all houses|adopting as public road|recyclable materials|"
    r"prohibiting sand mounds|wwtp expansion|fixing and imposing sewer|"
    r"on-lot sewage disposal system permit|housing code|"
    r"amending no\.|amending 1\d\d|adding 1\d\d|"
    r"lihwap|conservation planning made easy|spill prevention|"
    r"your actions prevent|am i in compliance|water.?sewer certification|"
    r"portal ebill|is your water|new water_sewer|useful information|"
    r"municipal information\.html|general information|"
    r"record request|manheim adventure|fire coverage map|"
    r"location map\.pdf|what you should know about flood insurance|"
    r"educational information|request form\.pdf|"
    r"republic services|public water\.pdf|cleangreen|"
    r"agriculturalsecurity|sewer system\.pdf|"
    r"wellhead protection|curfew ordinance|public nuisance ordinance|"
    r"solicitation ordinance|new resident info|"
    r"planning commission\.pdf|vacancies – planning|"
    r"timeline for recent stormwater|flood & pollution reduction fees|"
    r"blasting permit|burning permit|bmp 6\.6\.4|"
    r"developing an effective erosion|"
    r"joint comp plan maps|"  # map atlas, keep zoning maps instead
    r"ordinance of definitions|"
    r"post constr\. stormwater annual|"
    r"wood burner|pumping report|registered haulers|"
    r"application for water_sewer|water_sewer settlement|"
    r"2026 pool pass|dumpster application|sidewalk cafe|"
    r"yard sale permit|status of occupancy report|"
    r"residential rental unit|illicit discharge form 1|"
    r"on-lot sewer system policiy|stc permit application|"
    r"stormwater activity book|stormwater assessment presentation|"
    r"stormwater bmps –|stormwater brochure with rates|"
    r"epa coal tar|epa deicing|epa reducing stormwater|"
    r"epa stormwater|epa street trees|dep when it rains|"
    r"dep pag-03|dep homeowner|homeowner’s bayscape|"
    r"pa dep stormwater smart|"
    r"do i need a permit|inspection forms\.html|"
    r"halifax boro america|"
    r"landlord form \(pdf\)|"
    r"j-119-|j-120 joint|j-121-|j-122 -|j-123-|"
    r"codes department updates|crane clean energy|"
    r"financial information|request a reflective|"
    r"submit an application\.html|water quality projects|"
    r"garden chat|program guide|stay informed|summer camp|"
    r"maintenance complaint|"
    r"brush site permit|appointments application|"
    r"reflective address|timbering notice|"
    r"business certificate|restaurant sidewalk|"
    r"soliciting application|special request-community|"
    r"local information|water _ sewer\.html|"
    r"005-code enforcement \[reserved\]|"
    r"is your water_sewer|new water_sewer bills|"
    r"information\.html|permits & forms\.html|"
    r"stormwater management\.html|zoning hearing board\.html|"
    r"zoning\.html|building permits\.html|"
    r"associated building inspections llc|"
    r"open records policy|"
    r"short term rental|"
    r"policies & forms|"
    r"10 things to reduce|citizen complaint illicit|"
    r"code of ordinances chapter|"
    r"construction stormwater field guide|"
    r"developing your stormwater pollution|"
    r"what is a stormwater illicit|"
    r"common complaints|realtor & title|"
    r"2027 reassessment|other legislative|"
    r"annual bmp inspection information|"
    r"downloadable forms|east donegal township right-to-know|"
    r"erosion and sediment control for agriculture|"
    r"lancaster county 2027|"
    r"ms4 self-inspection form",
    re.I,
)

# Penn Twp historic ordinances that are not planning docs
PENN_SKIP = re.compile(
    r"penn township - ▸ ordinance 20[0-9] |"
    r"penn township - ▸ ordinance 21[0-9] |"
    r"penn township - ▸ ordinance 22[0-9] |"
    r"penn township - ▸ ordinance 346 |"
    r"penn township - ▸ ordinance 359 |"
    r"penn township - ▸ ordinance 390 |"
    r"penn township - ▸ ordinance 405 |"
    r"penn township - ▸ ordinance 432 |"
    r"penn township - ▸ ordinance 434 |"
    r"penn township - ▸ ordinance 459 |"
    r"penn township - ▸ ordinance 495 |"
    r"penn township - ▸ ord 526 |"
    r"penn township - ▸ ord 535 |"
    r"penn township - ▸ ord 563 |"
    r"penn township - ▸ ordinance 200 building code|"
    r"penn township - ▸ ordinance 201 housing",
    re.I,
)


def clean_name(name: str) -> str:
    name = (
        name.replace("Â", "")
        .replace("â", "–")
        .replace("· ", "")
        .replace("\ufeff", "")
        .replace("\u200b", "")
        .strip()
    )
    name = re.sub(r"\s+", " ", name)
    if name.lower().endswith(".pdf"):
        name = name[:-4]
    elif name.lower().endswith(".docx"):
        name = name[:-5]
    elif name.lower().endswith(".doc"):
        name = name[:-4]
    elif name.lower().endswith(".xlsx"):
        name = name[:-5]
    name = re.sub(r"\s+\(pdf\)$", "", name, flags=re.I)
    name = re.sub(r"\s+\[reserved\]$", "", name, flags=re.I)
    name = name.replace("▸ ", "").replace("[", "").replace("]", "")
    return name.strip(" -_")


def muni_from(name: str) -> str:
    if " - " in name:
        return name.split(" - ", 1)[0].strip()
    n = re.sub(r"\.(pdf|docx?|xlsx|html)$", "", name, flags=re.I)
    return n.strip()


def fmt_size(n: int) -> str:
    if n <= 0:
        return "Online"
    if n < 1024:
        return f"{n} B"
    kb = n / 1024
    if kb < 1024:
        return f"{kb:.0f} KB" if kb >= 10 else f"{kb:.1f} KB"
    mb = kb / 1024
    return f"{mb:.1f} MB" if mb < 10 else f"{mb:.0f} MB"


def fmt_date(iso: str) -> str:
    if not iso:
        return "2026"
    m = re.match(r"(\d{4})-(\d{2})-(\d{2})", iso)
    if not m:
        return iso
    y, mo, d = m.groups()
    months = "Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec".split()
    return f"{months[int(mo) - 1]} {int(d)}, {y}"


def kind_of(name: str, mime: str = "") -> str:
    n = name.lower()
    if n.endswith(".xlsx") or "spreadsheet" in mime:
        return "XLSX"
    if n.endswith(".docx") or n.endswith(".doc") or "word" in mime:
        return "DOCX"
    if n.endswith(".html") or mime.startswith("text/html"):
        return "WEB"
    return "PDF"


def categorize(full: str) -> str | None:
    n = full.lower()
    if SKIP_RE.search(n) or PENN_SKIP.search(n):
        return None
    if n.endswith(".html"):
        return None

    # Builder first for permit/application forms that mention zoning
    builder_keys = (
        "permit application",
        "building permit",
        "zoning permit",
        "zoning hearing",
        "demolition permit",
        "driveway",
        "street opening",
        "street cut",
        "road occupancy",
        "road opening",
        "road cut",
        "fence permit",
        "sign permit",
        "use permit",
        "occupancy",
        "electrical permit",
        "ucc permit",
        "construction permit",
        "conditional use application",
        "variance application",
        "special exception application",
        "fee schedule",
        "plan review",
        "workers compensation",
        "workmen",
        "plot plan",
        "land use application",
        "land use permit",
        "development permit",
        "floodplain development permit",
        "stormwater permit",
        "stormwater management permit",
        "stormwater application",
        "small project application",
        "exemption application",
        "agricultural exemption",
        "when a permit is required",
        "when a zoning permit",
        "when a residential permit",
        "permit process",
        "permit packet",
        "single family dwelling permit",
        "pmca ",
        "prior to applying",
        "instructions for zoning hearing",
        "application to appear before",
        "application for appeal",
        "application for special exception",
        "application for variance",
        "application for zoning",
        "zhb application",
        "zoning hearing board application",
        "subdivision and land development application",
        "subdivision application",
        "saldo application",
        "land development application",
        "plan submission",
        "time extension request",
        "modification or waiver",
        "modification request",
        "rezoning_text amendment petition",
        "zoning map – ordinance amendment application",
        "zoning_building permit",
        "construction code permit",
        "abi permit",
        "farm occupation permit",
        "home occupation permit",
        "no-impact home-based",
        "well permit",
        "sewage disposal permit info",
        "highway occupancy",
        "foresting_timber",
        "dumpster permit",
        "tree permit",
        "tree removal permit",
        "sewer lateral repair permit",
        "sewer permit application",
        "municipal authority permit",
        "streetcutapplication",
        "building permit amendment",
        "permit extension",
        "change of occupancy",
        "manufactured dwelling",
        "pole building",
        "residential deck",
        "porch roof",
        "re-roof",
        "solar panel permit",
        "swimming pool",
        "sign permit",
        "electrical exemption",
        "general building permit",
        "uniform construction code building permit",
        "workmen’s compensation",
        "worker's compensation",
        "ucc permit exempt",
        "requirements for a construction permit",
        "residential construction building permit guide",
        "electrical permit guide",
        "cooke requires building",
        "building inspection fee",
        "york county planning fees",
        "saldo & stormwater plan submission and review fee",
        "saldo and land development fees",
        "2026 saldo submission schedule",
        "2026 subdivision & land development (saldo) fee",
        "subdivision_land development fee",
        "land development plan information",
        "exhibit b application",
        "exhibit g application",
        "application for consideration of a modification",
        "application for subdivision",
        "subdivision land development application packet",
        "zoning-building permit application packet",
        "zoning hearing board application packet",
        "zhb application instructions",
        "permit process – zoning-building",
        "when do i need a permit",
        "deck-permit",
        "deck permit",
        "fence-permit",
        "shed-permit",
        "shed permit",
        "patio-permit",
        "patio permit",
        "pool-permit",
        "pool permit",
        "finish-basement",
        "residential-addition",
        "residential-accessory",
        "variance-application",
        "specialexception-application",
        "special exception",
        "zhb-deadline",
        "zhb-rules",
        "instruction-for-filing",
        "home_occupation",
        "home occupation",
        "plumbing_permit",
        "plumbing-license",
        "building-permit-application",
        "2026-fee-schedule",
        "fee schedule",
        "county-saldo-application",
        "use certification",
        "storm water management application",
        "what type of work requires",
        "requires what permit",
        "commercial application",
        "residential application",
        "application for hearing",
        "application submission",
        "inspection checklist",
        "interpretation appeal",
        "variance appeal",
        "special exception hearing",
        "permit extension",
        "application.pdf",
    )
    if any(k in n for k in builder_keys):
        return "Builder"
    if re.search(r"\bpermit\b", n) and not any(
        k in n for k in ("ordinance", "chapter ", "code of", "management.pdf")
    ):
        # generic "* Permit.pdf" forms
        if any(k in n for k in ("zoning", "building", "driveway", "stormwater", "use ", "sign ")):
            return "Builder"

    saldo_keys = (
        "saldo",
        "subdivision and land development",
        "subdivision & land development",
        "chapter 22",
        "chapter 108",
        "chapter 22 – subdivision",
        "subdivision and land development ordinance",
        "subdivision & land development ordinance",
        "view subdivision and land development ordinance",
        "saldo-3-17-2016",
        "saldo – subdivision",
        "exhibit a subdivision",
        "subdivision and land development procedures",
        "subdivision and land development plan procedure",
        "construction and materials specifications for subdivision",
        "saldo table",
        "nonresidential land development agreement",
        "residential land development agreement",
        "saldo w-9",
        "york township saldo",
        "county-saldo",
        "subdivision-land-development-ordinance",
        "chapter 22 subdivision",
        "chapter 108",
        "land subdivision",
    )
    if any(k in n for k in saldo_keys):
        return "SALDO"

    zoning_keys = (
        "zoning ordinance",
        "zoning map",
        "zoning text amendment",
        "zoning overlay",
        "official map",
        "comprehensive plan",
        "data center ordinance",
        "chapter 27",
        "chapter 149 zoning",
        "chapter 130 - zoning",
        "chapter 27 – zoning",
        "part 6a, zoning",
        "part 6, designation of zoning",
        "part 17, airport zoning",
        "planning & zoning code",
        "article ii. establishment of zoning",
        "article iv_ non-conforming",
        "article vi_ special exception regulations",
        "article viii_ appeals",
        "part 15 nonconforming",
        "part 16 special exceptions",
        "part 19 zoning hearing board",
        "part 21 zoning map amendments",
        "part 3 – zoning districts",
        "part 9 fp",
        "caernarvon township zoning ordinance",
        "caernarvon zoning map",
        "zoning-ordinance-2025",
        "ordinance 2025-3 zoning",
        "ord. 2025-1 zoning",
        "ord. 2025-2 zoning",
        "ord. 2025-02 township zoning",
        "amending the zoning ordinance",
        "amendment to the zoning ordinance",
        "zoning ordinance amendment",
        "windsortownshipzoningordinance",
        "click here for zoning map",
        "nct-map-zoning",
        "nct-map-official",
        "penn twp zoning map",
        "municipal zoning maps",
        "tod overlay",
    )
    if any(k in n for k in zoning_keys):
        return "Zoning"
    if "zoning" in n and any(k in n for k in ("ordinance", "map", "amendment", "overlay", "code")):
        return "Zoning"

    codes_keys = (
        "stormwater ordinance",
        "stormwater management ordinance",
        "stormwater management.pdf",
        "stormwater management plan",
        "stormwater bmp",
        "homeowners guide to stormwater",
        "homeowner's guide to stormwater",
        "homeowner’s guide to stormwater",
        "floodplain",
        "flood plain",
        "chapter 8 flood",
        "chapter 23 stormwater",
        "chapter 125 stormwater",
        "chapter 101 - stormwater",
        "chapter 5 code enforcement",
        "chapter 48 - building permits and floodplain",
        "chapter 65 - flood",
        "chapter 17-stormwater",
        "chapter 8-floodplain",
        "ms4",
        "npdes",
        "uniform construction code",
        "list of adopted ucc",
        "ipmc",
        "international property maintenance",
        "illicit discharge ordinance",
        "act 167",
        "building code.pdf",
        "code enforcement",
        "construction code information",
        "pcsm bmp",
        "post constr. stormwater mgmt",
        "stormwater operations & maintenance",
        "stormwater operations and maintenance",
        "stormwater management assistance",
        "stormwater management small projects",
        "stormwater and floodplains",
        "stormwater site plan",
        "rates, rules, and regulations for the stormwater",
        "cumberland county stormwater",
        "sewage disposal system",
        "on-lot sewage",
        "key lock box ordinance",
        "traffic impact fee ordinance",
        "wellhead ordinance",
        "soil erosion and sediment",
        "pennsylvania uniform construction code",
        "red lion borough stormwater ordinance",
        "j-117- 2006 stormwater",
        "j-124 2010 stormwater",
        "j-127-2012 floodplain",
        "j-128",
        "part 15, floodplain",
        "part 6b, floodplain",
        "highspire ms4",
        "ms4 information",
        "stormwater management ordinance no",
        "revision to stormwater",
        "floodplain overlay",
        "floodplain ordinance",
        "floodplain zone amendment",
        "sewer ordiance",
        "chapter 18 sewers",
        "dccs – zoning & codes",
        "cooke requires solic",
        "uniform business code",
        "uniform construction code",
        "sign ordinance",
        "borough ordinances",
        "code of the township",
        "code of ordinances",
    )
    if any(k in n for k in codes_keys):
        return "Codes"
    if "stormwater" in n and "permit" not in n and "application" not in n:
        return "Codes"

    return None


OFFICIAL: list[tuple[str, str, str, str, str, str]] = [
    # name, municipality, county, category, url, updated
    ("West Manchester Township Zoning Ordinance (eCode360)", "West Manchester Township", "York", "Zoning", "https://ecode360.com/WE1311", "2024-01-01"),
    ("Shrewsbury Township Zoning Ordinance, Chapter 27", "Shrewsbury Township", "York", "Zoning", "https://ecode360.com/28606689", "2024-01-01"),
    ("Shrewsbury Township SALDO — Plan Requirements", "Shrewsbury Township", "York", "SALDO", "https://ecode360.com/33406657", "2010-08-04"),
    ("Hellam Township Zoning Ordinance, Chapter 490", "Hellam Township", "York", "Zoning", "https://ecode360.com/9980133", "2025-01-01"),
    ("Hellam Township Official Map, Chapter 58", "Hellam Township", "York", "Zoning", "https://ecode360.com/9865349", "2024-01-01"),
    ("Springettsbury Township Zoning, Chapter 325", "Springettsbury Township", "York", "Zoning", "https://ecode360.com/5176819", "2024-01-01"),
    ("Springettsbury Township SALDO, Chapter 289", "Springettsbury Township", "York", "SALDO", "https://ecode360.com/5175442", "2024-01-01"),
    ("New Freedom Borough Zoning, Chapter 225", "New Freedom Borough", "York", "Zoning", "https://ecode360.com/14026810", "2024-01-01"),
    ("New Freedom Borough Subdivision and Land Development", "New Freedom Borough", "York", "SALDO", "https://ecode360.com/27253687", "2024-01-01"),
    ("Hanover Borough Code of Ordinances", "Hanover Borough", "York", "Zoning", "https://ecode360.com/14396460", "2024-01-01"),
    ("Jackson Township Code of Ordinances", "Jackson Township", "York", "Zoning", "https://ecode360.com/JA1508", "2024-01-01"),
    ("North Codorus Township Code of Ordinances", "North Codorus Township", "York", "Zoning", "https://ecode360.com/27138634", "2012-08-21"),
    ("New Salem Borough Planning Commission, Chapter 27", "New Salem Borough", "York", "Zoning", "https://ecode360.com/7264772", "2024-01-01"),
    ("York County Planning Commission — Resources", "York County", "York", "Zoning", "https://www.ycpc.org/", "2026-01-01"),
    ("YCPC Model Ordinances (Zoning / SALDO)", "York County", "York", "SALDO", "https://www.ycpc.org/293/Model-Ordinance", "2026-01-01"),
    ("West Manchester Township Zoning Map Amendment Ord. 2024-06", "West Manchester Township", "York", "Zoning", "https://ecode360.com/WE1311/laws/LF2160651.pdf", "2024-06-01"),
    ("Hellam Township Zoning Ordinance Amendment 2025-01", "Hellam Township", "York", "Zoning", "https://ecode360.com/HE2351/laws/LF2674518.pdf", "2025-01-01"),
    ("Camp Hill Borough Zoning Code", "Camp Hill Borough", "Cumberland", "Zoning", "https://www.camphillborough.com/departments/codes_enforcement___zoning/zoning_code.php", "2024-01-01"),
    ("Camp Hill Borough SALDO (December 2020)", "Camp Hill Borough", "Cumberland", "SALDO", "https://cms8.revize.com/revize/camphillborough/Departments/Code%20Enforcement-Zoning/CHB%20FINAL%20SALDO%20120920.pdf", "2020-12-09"),
    ("Camp Hill Borough Codes Enforcement & Zoning", "Camp Hill Borough", "Cumberland", "Codes", "https://www.camphillborough.com/departments/codes_enforcement___zoning/index.php", "2026-01-01"),
    ("Camp Hill Borough Commercial Zoning Districts (eCode360)", "Camp Hill Borough", "Cumberland", "Zoning", "https://ecode360.com/50221673", "2024-01-01"),
    ("Carlisle Borough Code of Ordinances (eCode360 CA1126)", "Carlisle Borough", "Cumberland", "Zoning", "https://ecode360.com/CA1126", "2026-01-01"),
    ("Carlisle Borough Zoning Information", "Carlisle Borough", "Cumberland", "Zoning", "https://www.carlislepa.org/business/zoning_information/index.php", "2026-01-01"),
    ("Carlisle Borough Nonconformities (Zoning)", "Carlisle Borough", "Cumberland", "Zoning", "https://ecode360.com/10686463", "2024-01-01"),
    ("Cumberland County Planning Department", "Cumberland County", "Cumberland", "Zoning", "https://www.cumberlandcountypa.gov/120/Planning-Department", "2026-01-01"),
    ("Harrisburg Zoning Code (2014)", "Harrisburg City", "Dauphin", "Zoning", "https://cityofharrisburg.zendesk.com/hc/en-us/articles/204832530", "2014-01-01"),
    ("Harrisburg Planning and Zoning", "Harrisburg City", "Dauphin", "Zoning", "https://harrisburgpa.gov/services/planning/index.php", "2026-01-01"),
    ("Harrisburg Variance & Special Exception Application", "Harrisburg City", "Dauphin", "Builder", "https://cityofharrisburg.zendesk.com/hc/en-us/articles/204531720", "2024-01-01"),
    ("Dauphin County Planning Commission", "Dauphin County", "Dauphin", "Zoning", "https://www.tcrpc-pa.org/dcpc-about", "2026-01-01"),
    ("Lancaster City Zoning", "Lancaster City", "Lancaster", "Zoning", "https://www.cityoflancasterpa.gov/zoning-info/", "2026-01-01"),
    ("Lancaster City Planning Ordinances", "Lancaster City", "Lancaster", "Zoning", "https://www.cityoflancasterpa.gov/planning-ordinances/", "2026-01-01"),
    ("Lancaster City Official Zoning Map", "Lancaster City", "Lancaster", "Zoning", "https://www.cityoflancasterpa.gov/wp-content/uploads/2020/05/Zoning-Districts-Map.pdf", "2013-08-01"),
    ("Lancaster City Planning Maps & Resources", "Lancaster City", "Lancaster", "Zoning", "https://www.cityoflancasterpa.gov/planning-maps-resources/", "2026-01-01"),
    ("Lancaster County Simplified Zoning", "Lancaster County", "Lancaster", "Zoning", "https://lancastercountyplanning.org/241/Simplified-Zoning", "2026-01-01"),
    ("Lancaster County Planning Department", "Lancaster County", "Lancaster", "Zoning", "https://lancastercountyplanning.org/", "2026-01-01"),
    # York Township — official municipal PDFs
    ("York Township Zoning Ordinance (amended 3-14-23)", "York Township", "York", "Zoning", "https://yorktownshippa.gov/wp-content/uploads/Zoning-Ordinance-last-amendment-3-14-23.pdf", "2023-03-14"),
    ("York Township Zoning Map (amended 5-22-2026)", "York Township", "York", "Zoning", "https://yorktownshippa.gov/wp-content/uploads/Zoning-Map-last-amendment-05-22-2026.pdf", "2026-05-22"),
    ("York Township SALDO (amended 10-28-13)", "York Township", "York", "SALDO", "https://yorktownshippa.gov/wp-content/uploads/SALDO-as-amended-10-28-13-.pdf", "2013-10-28"),
    ("York Township Stormwater Management Ordinance (2022)", "York Township", "York", "Codes", "https://yorktownshippa.gov/wp-content/uploads/York-Township-2022-Stormwater-Management-Ordinance.pdf", "2022-01-01"),
    ("York Township Code of Ordinances (June 2020)", "York Township", "York", "Codes", "https://yorktownshippa.gov/wp-content/uploads/CODE-OF-THE-TOWNSHIP-OF-YORK-UPDATE-2020.pdf", "2020-06-01"),
    ("York Township Ordinances & Studies", "York Township", "York", "Zoning", "https://yorktownshippa.gov/os/", "2026-01-01"),
    # Manchester Township (York)
    ("Manchester Township Code of Ordinances (eCode360 MA2383)", "Manchester Township", "York", "Zoning", "https://ecode360.com/MA2383", "2024-01-01"),
    ("Manchester Township Stormwater Management Ordinance", "Manchester Township", "York", "Codes", "https://ecode360.com/30842774", "2012-01-01"),
    ("Manchester Township Zoning Map (2023)", "Manchester Township", "York", "Zoning", "https://www.mantwp.com/wp-content/uploads/2023-Zoning-Map.pdf", "2023-01-01"),
    ("Manchester Township Planning / Zoning", "Manchester Township", "York", "Zoning", "https://www.mantwp.com/departments/planning-zoning/", "2026-01-01"),
    # Newberry Township
    ("Newberry Township Code of Ordinances (eCode360 NE2598)", "Newberry Township", "York", "Zoning", "https://ecode360.com/NE2598", "2024-01-01"),
    ("Newberry Township Ordinances", "Newberry Township", "York", "Zoning", "https://newberrytwp.com/ordinances", "2026-01-01"),
    # Dover Township (York)
    ("Dover Township Code of Ordinances (AmLegal)", "Dover Township", "York", "Zoning", "https://codelibrary.amlegal.com/codes/dovertwp/latest/overview", "2026-01-01"),
    ("Dover Township Zoning Amendment Ord. 2026-02", "Dover Township", "York", "Zoning", "https://www.dovertownship.org/wp-content/uploads/2026/07/Ordinance-2026-02.pdf", "2026-06-22"),
    ("Dover Township Ordinances & Regulations", "Dover Township", "York", "Zoning", "https://www.dovertownship.org/home/business/ordinances/", "2026-01-01"),
    # West Manchester Township
    ("West Manchester Township Zoning & Codes Department", "West Manchester Township", "York", "Codes", "https://www.westmanchestertownship.com/departments/zoning-codes/", "2026-01-01"),
    ("West Manchester Township SALDO (eCode360)", "West Manchester Township", "York", "SALDO", "https://ecode360.com/WE1311", "2024-01-01"),
    # York City
    ("York City Codified Ordinances — Planning & Zoning", "York City", "York", "Zoning", "https://www.yorkcity.org/government/authorities-boards-and-commissions/codified-ordinances/", "2026-01-01"),
    ("York City Zoning Hearing Board, Article 191", "York City", "York", "Zoning", "https://www.yorkcity.org/wp-content/uploads/2017/04/Article-191-Zoning-Hearing-Board.pdf", "2017-04-01"),
    # Jackson Township
    ("Jackson Township Ordinances Portal", "Jackson Township", "York", "Zoning", "https://jacksontwpyork.org/ordinances", "2026-01-01"),
    # YCPC
    ("YCPC County Subdivision & Land Development", "York County", "York", "SALDO", "https://www.ycpc.org/308/County-Subdivisions", "2026-01-01"),
    ("YCPC 2026 Fee Schedule", "York County", "York", "Builder", "https://www.ycpc.org/", "2026-01-01"),
    # Cumberland
    ("East Pennsboro Township Code of Ordinances (eCode360 EA3722)", "East Pennsboro Township", "Cumberland", "Zoning", "https://ecode360.com/EA3722", "2024-01-01"),
    ("East Pennsboro Township Zoning Ordinance 851-2023", "East Pennsboro Township", "Cumberland", "Zoning", "https://ecode360.com/30879561", "2023-12-01"),
    ("East Pennsboro Township Zoning Department", "East Pennsboro Township", "Cumberland", "Zoning", "https://www.eastpennsboro.net/departments/zoning.php", "2026-01-01"),
    ("Hampden Township Code of Ordinances (Municode)", "Hampden Township", "Cumberland", "Zoning", "https://library.municode.com/pa/hampden_township", "2025-11-14"),
    ("Hampden Township Community Development / Zoning", "Hampden Township", "Cumberland", "Builder", "https://www.hampdentownship.us/township_departments/community_development/index.php", "2026-01-01"),
    ("New Cumberland Borough SALDO Ordinance 719", "New Cumberland Borough", "Cumberland", "SALDO", "https://drive.google.com/file/d/1I2S3ww1ywK75UDn1cpxwVuuqHA9QsdhM/view", "2024-01-01"),
    ("Silver Spring Township Planning & Zoning", "Silver Spring Township", "Cumberland", "Zoning", "https://www.sstwp.org/", "2026-01-01"),
    ("Upper Allen Township", "Upper Allen Township", "Cumberland", "Zoning", "https://www.upperallen.com/", "2026-01-01"),
    ("Lower Allen Township", "Lower Allen Township", "Cumberland", "Zoning", "https://www.lowerallen.com/", "2026-01-01"),
    ("Mechanicsburg Borough", "Mechanicsburg Borough", "Cumberland", "Zoning", "https://www.mechanicsburgpa.org/", "2026-01-01"),
    # Dauphin
    ("Derry Township Code of Ordinances (eCode360 DE2152)", "Derry Township", "Dauphin", "Zoning", "https://ecode360.com/DE2152", "2024-01-01"),
    ("Lower Paxton Township Code of Ordinances (eCode360 LO1649)", "Lower Paxton Township", "Dauphin", "Zoning", "https://ecode360.com/LO1649", "2024-01-01"),
    ("Swatara Township", "Swatara Township", "Dauphin", "Zoning", "https://www.swataratwp.com/", "2026-01-01"),
    ("Susquehanna Township", "Susquehanna Township", "Dauphin", "Zoning", "https://www.susquehannatwp.com/", "2026-01-01"),
    # Lancaster additional
    ("Manheim Township (Lancaster) Planning & Zoning", "Manheim Township", "Lancaster", "Zoning", "https://www.manheimtownship.org/", "2026-01-01"),
    ("East Hempfield Township", "East Hempfield Township", "Lancaster", "Zoning", "https://www.easthempfield.org/", "2026-01-01"),
    ("West Lampeter Township", "West Lampeter Township", "Lancaster", "Zoning", "https://www.westlampeter.com/", "2026-01-01"),
    ("Warwick Township (Lancaster)", "Warwick Township", "Lancaster", "Zoning", "https://www.warwicktownship.org/", "2026-01-01"),
    ("Ephrata Borough Code", "Ephrata Borough", "Lancaster", "Zoning", "https://www.ephrataboro.org/", "2026-01-01"),
    ("Pennsylvania Uniform Construction Code (UCC)", "Pennsylvania", "York", "Codes", "https://www.dli.pa.gov/Individuals/Labor-Management-Relations/ucc/Pages/default.aspx", "2026-01-01"),
    ("Pennsylvania Municipalities Planning Code (Act 247)", "Pennsylvania", "York", "SALDO", "https://dced.pa.gov/download/pennsylvania-municipalities-planning-code-act-247-of-1968/?wpdmdl=56205", "2022-01-01"),
    # Additional official sources recovered from municipal sites
    ("York City Zoning Ordinance (Feb 2026)", "York City", "York", "Zoning", "https://www.yorkcity.org/wp-content/uploads/2026/02/H-Zoning.doc.pdf", "2026-02-01"),
    ("Springettsbury Township Code of Ordinances (eCode360 SP2128)", "Springettsbury Township", "York", "Zoning", "https://ecode360.com/SP2128", "2026-01-01"),
    ("Dover Township Zoning Ordinance (AmLegal)", "Dover Township", "York", "Zoning", "https://codelibrary.amlegal.com/codes/dovertwp/latest/dovertwp_pa/0-0-0-6363", "2026-01-01"),
    ("West Manchester Township Zoning Ordinance (eCode360)", "West Manchester Township", "York", "Zoning", "https://ecode360.com/15443121", "2024-01-01"),
    ("Manchester Township Zoning Hearing Application", "Manchester Township", "York", "Builder", "https://www.mantwp.com/wp-content/uploads/ZHB-Application-2-11-1.pdf", "2024-01-01"),
    ("Lancaster City Zoning Ordinance, Section 300", "Lancaster City", "Lancaster", "Zoning", "https://ecode360.com/8122408", "2026-01-01"),
    ("Lancaster Township Zoning Ordinance (eCode360)", "Lancaster Township", "Lancaster", "Zoning", "https://ecode360.com/13005392", "2012-08-20"),
    ("Penn Township (Lancaster) Code of Ordinances (eCode360 PE3692)", "Penn Township", "Lancaster", "Zoning", "https://ecode360.com/PE3692", "2026-01-01"),
    ("Manheim Township (Lancaster) Zoning, Chapter 500", "Manheim Township", "Lancaster", "Zoning", "https://ecode360.com/44797427", "2026-01-01"),
    ("East Hempfield Township Code of Ordinances", "East Hempfield Township", "Lancaster", "Zoning", "https://ecode360.com/14056173", "2025-03-19"),
    ("West Hempfield Township Code of Ordinances", "West Hempfield Township", "Lancaster", "Zoning", "https://ecode360.com/34201932", "2025-11-06"),
    ("Upper Allen Township Code of Ordinances", "Upper Allen Township", "Cumberland", "Zoning", "https://ecode360.com/8581258", "2026-01-01"),
    ("Swatara Township Code of Ordinances", "Swatara Township", "Dauphin", "Zoning", "https://ecode360.com/11632895", "2026-03-04"),
    ("East Pennsboro Township SALDO Ordinance 852-2023", "East Pennsboro Township", "Cumberland", "SALDO", "https://ecode360.com/EA3722", "2023-12-01"),
    ("Silver Spring Township Zoning Ordinance (Updated Jan 2026)", "Silver Spring Township", "Cumberland", "Zoning", "https://www.sstwp.org/government/zoning_ordinance/index.php", "2026-01-28"),
    ("Silver Spring Township Zoning Hearing Application", "Silver Spring Township", "Cumberland", "Builder", "https://www.sstwp.org/App%20for%20Variance-Special%20Exception-Appeal%206.2026%20with%20INSTRUCTIONS%20&%20AFFIDAVIT%20-%20FILLABLE%20FORM.pdf", "2026-06-16"),
    ("Hampden Township Zoning, Chapter 27E (Municode)", "Hampden Township", "Cumberland", "Zoning", "https://library.municode.com/pa/hampden_township", "2025-11-14"),
    ("Columbia Borough Code of Ordinances (eCode360)", "Columbia Borough", "Lancaster", "Zoning", "https://www.columbiapa.net/government/code_of_the_borough_of_columbia/index.php", "2026-01-01"),
    ("Lancaster Township Zoning Map (Ord. 2024-01)", "Lancaster Township", "Lancaster", "Zoning", "https://www.twp.lancaster.pa.us/departments/planning___zoning/zoning_map.php", "2024-04-08"),
    ("Penn Township (Lancaster) Land Use Ordinances", "Penn Township", "Lancaster", "Zoning", "https://penntwplanco.org/government/departments-information/community-development/land-use-ordinances/", "2026-01-01"),
    ("Dover Township Zoning & Land Use", "Dover Township", "York", "Zoning", "https://www.dovertownship.org/home/departments/planning-development/zoning-land-use/", "2026-01-01"),
    ("Springettsbury Township Zoning Administration", "Springettsbury Township", "York", "Zoning", "https://springettsbury.com/construction/community-development/zoning/", "2026-01-01"),
    ("York Township Floodplain Management Ordinance (2015)", "York Township", "York", "Codes", "https://yorktownshippa.gov/ordinances-and-studies-4/", "2015-11-10"),
    ("York Township Official Map Ordinance", "York Township", "York", "Zoning", "https://yorktownshippa.gov/ordinances-and-studies-4/", "2012-08-13"),
    ("YCPC Zoning Ordinance Content Guide", "York County", "York", "Zoning", "https://www.ycpc.org/301/Zoning-Ordinance-Content-Guide-PDF", "2026-01-01"),
    ("YCPC Data Centers Model Ordinance", "York County", "York", "Zoning", "https://www.ycpc.org/700/Data-Centers-Model-Ordinance-PDF", "2026-01-01"),
    ("YCPC Solar Energy Systems Model Ordinance", "York County", "York", "Zoning", "https://www.ycpc.org/296/Solar-Energy-Systems-Model-Ordinance-PDF", "2026-01-01"),
    ("Manheim Township (Lancaster) SALDO, Chapter 440", "Manheim Township", "Lancaster", "SALDO", "https://ecode360.com/14972684", "2026-01-01"),
    ("Manheim Township (Lancaster) Planning & Zoning", "Manheim Township", "Lancaster", "Zoning", "https://www.manheimtownship.org/478/Planning-Zoning", "2026-01-01"),
    ("East Hempfield Township Zoning, SALDO & Stormwater", "East Hempfield Township", "Lancaster", "SALDO", "https://www.easthempfield.org/departments/development_services/zoning,_saldo,___stormwater_ordinances.php", "2026-01-01"),
    ("Lower Paxton Township Codified Ordinances (eCode360 LO1649)", "Lower Paxton Township", "Dauphin", "Zoning", "https://www.lowerpaxton-pa.gov/264/Codified-Ordinances", "2026-01-01"),
    ("YCPC County Subdivision & Land Development Approval", "York County", "York", "SALDO", "https://www.ycpc.org/323/Mandated-Reviews", "2026-01-01"),
    ("York City Subdivision and Land Development Ordinance (Part 13)", "York City", "York", "SALDO", "http://www.yorkcity.org/user-files/file/City%20Council/Codified%20Ordinances/CO-Part%2013%20-%20Planning%20%26%20Zoning%20(1331-1379).pdf", "2017-01-01"),
    ("Manchester Township SALDO (eCode360 MA2383)", "Manchester Township", "York", "SALDO", "https://ecode360.com/MA2383", "2024-01-01"),
    ("Hellam Township Code — Subdivision chapters (eCode360 HE2351)", "Hellam Township", "York", "SALDO", "https://ecode360.com/HE2351", "2025-01-01"),
    ("Hanover Borough Subdivision regulations (eCode360)", "Hanover Borough", "York", "SALDO", "https://ecode360.com/14396460", "2024-01-01"),
    ("Jackson Township SALDO (eCode360 JA1508)", "Jackson Township", "York", "SALDO", "https://ecode360.com/JA1508", "2024-01-01"),
    ("Newberry Township SALDO (eCode360 NE2598)", "Newberry Township", "York", "SALDO", "https://ecode360.com/NE2598", "2024-01-01"),
    ("Derry Township SALDO (eCode360 DE2152)", "Derry Township", "Dauphin", "SALDO", "https://ecode360.com/DE2152", "2024-01-01"),
    # Recovered from municipal sites — SALDO gap close (York / Cumberland / Dauphin / Lancaster)
    ("Loganville Borough Subdivision and Land Development Ordinance", "Loganville Borough", "York", "SALDO", "https://www.loganvillepa.us/pdfs/Sub_Divisions.pdf", "2024-01-01"),
    ("Loganville Borough Zoning Ordinance", "Loganville Borough", "York", "Zoning", "https://www.loganvillepa.us/pdfs/Zoning.pdf", "2024-01-01"),
    ("Loganville Borough Stormwater Management Ordinance", "Loganville Borough", "York", "Codes", "https://www.loganvillepa.us/pdfs/Stormwater.pdf", "2024-01-01"),
    ("Loganville Borough Residential Zoning / Building Permit Application", "Loganville Borough", "York", "Builder", "https://www.loganvillepa.us/pdfs/Zoning_App.pdf", "2024-01-01"),
    ("Carroll Township SALDO (December 2018)", "Carroll Township", "York", "SALDO", "https://www.carrolltownship.com/wp-content/uploads/Carroll-Twp-SALDO-December-2018-ID-1645789.pdf", "2018-12-10"),
    ("Carroll Township Zoning Ordinance", "Carroll Township", "York", "Zoning", "https://www.carrolltownship.com/zoning-ordinance/", "2024-01-01"),
    ("York County Subdivision and Land Development Ordinance (2012 PDF)", "York County", "York", "SALDO", "https://www.ycpc.org/DocumentCenter/View/283/County-Subdivision-and-Land-Development-Ordinance-2012-PDF", "2012-01-18"),
    ("Dover Township SALDO, Chapter 22 (AmLegal)", "Dover Township", "York", "SALDO", "https://codelibrary.amlegal.com/codes/dovertwp/latest/dovertwp_pa/0-0-0-3031", "2011-03-14"),
    ("Fairview Township Code of Ordinances (eCode360 FA2330)", "Fairview Township", "York", "SALDO", "https://ecode360.com/FA2330", "2025-01-01"),
    ("Fairview Township Zoning Map Amendment Ord. 2025-01 / 2025-02", "Fairview Township", "York", "Zoning", "https://twp.fairview.pa.us/wp-content/uploads/2025/10/Revised-Zoning-Map-Ord-2025-01-and-2025-02.pdf", "2025-10-01"),
    ("Fairview Township Data Center Zoning Text Amendment Ord. 2025-03", "Fairview Township", "York", "Zoning", "https://twp.fairview.pa.us/wp-content/uploads/2025/12/Ord_-2025-03-Zoning-Text-Amendment-Data-Centers.pdf", "2025-12-01"),
    ("Windsor Township SALDO (September 21, 2015)", "Windsor Township", "York", "SALDO", "https://www.windsortwp.com/wp-content/uploads/Subdivision-and-Land-Development-Ordinance-9212015.pdf", "2015-09-21"),
    ("Windsor Township Stormwater Management Ordinance", "Windsor Township", "York", "Codes", "https://windsortwp.com/wp-content/uploads/StormwaterManagementOrdinance-2B.pdf", "2024-01-01"),
    ("Spring Garden Township Code of Ordinances (eCode360 SP2461)", "Spring Garden Township", "York", "SALDO", "https://ecode360.com/SP2461", "2024-01-01"),
    ("Spring Garden Township Zoning Ordinance (eCode360)", "Spring Garden Township", "York", "Zoning", "https://ecode360.com/14756391", "2024-01-01"),
    ("Spring Garden / York City Joint Comprehensive Plan (Fall 2025)", "Spring Garden Township", "York", "Zoning", "https://www.springgardentwp.org/wp-content/uploads/Y-SG-Comp-Plan_Adopted-Fall-2025.pdf", "2025-10-01"),
    ("Lower Windsor Township Code of Ordinances (eCode360 LO4166)", "Lower Windsor Township", "York", "SALDO", "https://ecode360.com/LO4166", "2024-01-01"),
    ("West Manheim Township Code of Ordinances (eCode360 WE3200)", "West Manheim Township", "York", "SALDO", "https://ecode360.com/WE3200", "2024-01-01"),
    ("Manheim Township (York) Code of Ordinances (eCode360 MA2385)", "Manheim Township", "York", "SALDO", "https://ecode360.com/MA2385", "2024-01-01"),
    ("North Codorus Township Code of Ordinances (eCode360 NO1256)", "North Codorus Township", "York", "SALDO", "https://ecode360.com/NO1256", "2012-08-21"),
    ("Peach Bottom Township Zoning Ordinance (2024)", "Peach Bottom Township", "York", "Zoning", "https://www.peachbottomtownship.org/wp-content/uploads/2025/02/Peach-Bottom-Township-Zoning-Ordinance-2024.pdf", "2024-01-01"),
    ("Peach Bottom Township Zoning Map", "Peach Bottom Township", "York", "Zoning", "https://peachbottomtownship.org/wp-content/uploads/2017/05/pbottz.pdf", "2017-05-01"),
    ("Peach Bottom Township Zoning Permit / Use Certificate Application", "Peach Bottom Township", "York", "Builder", "https://www.peachbottomtownship.org/wp-content/uploads/2025/07/PBTwp-Zoning-Permit-Application-2025.pdf", "2025-07-01"),
    ("Stewartstown Borough Codes, Enforcement & Zoning", "Stewartstown Borough", "York", "Zoning", "https://www.stewartstown.org/codes-enforcement-zoning/", "2026-01-01"),
    ("Stewartstown Borough Zoning Ordinance Amendment 2024-01", "Stewartstown Borough", "York", "Zoning", "https://www.stewartstown.org/pdf/docs/Ordinance_2024-01_Amending_the_Zoning_Ordinance_for_Multi-Family_Conversion_.pdf", "2024-01-01"),
    # Cumberland / Dauphin / Lancaster SALDO
    ("Silver Spring Township SALDO", "Silver Spring Township", "Cumberland", "SALDO", "https://cms2.revize.com/revize/silverspringtowns/Documents/Departments/Community%20Development/Permit%20Forms%20Applications/Subdivision-and-Land-Development-Ordinance-SALDO.pdf", "2021-12-16"),
    ("Hampden Township Land Development Ordinance, Chapter 22 (Municode)", "Hampden Township", "Cumberland", "SALDO", "https://library.municode.com/pa/hampden_township", "2025-11-14"),
    ("Lower Allen Township Code of Ordinances (eCode360 LO1571)", "Lower Allen Township", "Cumberland", "SALDO", "https://ecode360.com/LO1571", "2023-01-01"),
    ("Upper Allen Township Code of Ordinances (eCode360 UP1380)", "Upper Allen Township", "Cumberland", "SALDO", "https://ecode360.com/UP1380", "2024-01-01"),
    ("Upper Allen Township Subdivision / Land Development Application", "Upper Allen Township", "Cumberland", "Builder", "https://cms3.revize.com/revize/upperallen/Documents/I%20Want%20To/Read%20Download/Applications%20And%20Forms/Applications/Sub-LD%20Application%20Complete-Fillable.pdf", "2024-01-01"),
    ("Carlisle Borough SALDO, Chapter 226 (eCode360 CA1126)", "Carlisle Borough", "Cumberland", "SALDO", "https://ecode360.com/CA1126", "2024-01-01"),
    ("Carlisle Borough SALDO Application Package", "Carlisle Borough", "Cumberland", "Builder", "https://cms8.revize.com/revize/carlislepa/Forms%20and%20Applications/Permit%20Applications/SALDO%20Application%20Package%20REV%20042022.pdf", "2022-04-01"),
    ("Lower Paxton Township SALDO (eCode360 LO1649)", "Lower Paxton Township", "Dauphin", "SALDO", "https://ecode360.com/LO1649", "2024-01-01"),
    ("Swatara Township Subdivision and Land Development (eCode360 SW2044)", "Swatara Township", "Dauphin", "SALDO", "https://ecode360.com/SW2044", "2026-03-04"),
    ("Lancaster City SALDO, Chapter 265", "Lancaster City", "Lancaster", "SALDO", "https://ecode360.com/8120437", "2020-11-10"),
    ("Lancaster City SALDO Amendment (Nov 10, 2020)", "Lancaster City", "Lancaster", "SALDO", "https://ecode360.com/LA1674/laws/LF1242607.pdf", "2020-11-10"),
    ("Lancaster City Subdivision / Land Development Plan Application", "Lancaster City", "Lancaster", "Builder", "https://www.cityoflancasterpa.gov/wp-content/uploads/2019/12/Application-for-Subdivision-and-or-Land-Development-Plan-Review.pdf", "2019-12-01"),
    ("Lancaster Township SALDO (eCode360 LA3847)", "Lancaster Township", "Lancaster", "SALDO", "https://ecode360.com/LA3847", "2012-08-20"),
    ("West Lampeter Township SALDO", "West Lampeter Township", "Lancaster", "SALDO", "https://ecode360.com/11693695", "2024-01-01"),
    ("West Lampeter Township Zoning Ordinance, Chapter 285", "West Lampeter Township", "Lancaster", "Zoning", "http://ecode360.com/11694778", "2024-01-01"),
    ("Warwick Township SALDO, Chapter 285", "Warwick Township", "Lancaster", "SALDO", "https://ecode360.com/11669903", "2024-01-01"),
    ("Warwick Township Zoning Ordinance, Chapter 340", "Warwick Township", "Lancaster", "Zoning", "https://ecode360.com/11671452", "2024-09-19"),
    ("Warwick Township Stormwater Management Ordinance, Chapter 270", "Warwick Township", "Lancaster", "Codes", "https://ecode360.com/11669240", "2024-01-01"),
    ("Columbia Borough SALDO (eCode360 CO0213)", "Columbia Borough", "Lancaster", "SALDO", "https://ecode360.com/CO0213", "2024-01-01"),
    ("Ephrata Borough Code of Ordinances (eCode360 EP1497)", "Ephrata Borough", "Lancaster", "SALDO", "https://ecode360.com/EP1497", "2024-01-01"),
    ("Penn Township (Lancaster) SALDO, Chapter 22", "Penn Township", "Lancaster", "SALDO", "https://ecode360.com/30832282", "2024-01-01"),
    ("Penn Township (Lancaster) SALDO Chapter 22 (PDF)", "Penn Township", "Lancaster", "SALDO", "https://ecode360.com/attachment/PE3692/Chapter%2022%20Subdivision%20and%20Land%20Development.pdf", "2024-01-01"),
    ("West Hempfield Township Code of Ordinances (SALDO chapters)", "West Hempfield Township", "Lancaster", "SALDO", "https://ecode360.com/34201932", "2025-11-06"),
    # Supplied official municipal / county collections
    ("York Township Building & Zoning Permit Applications and Fee Schedule", "York Township", "York", "Builder", "https://yorktownshippa.gov/departments/building-and-zoning/", "2026-01-01"),
    ("York Township Zoning Hearing Board Application Downloads", "York Township", "York", "Builder", "https://yorktownshippa.gov/boards/zhb/", "2026-01-01"),
    ("Lancaster County SALDO Checklist for Applicants (2024)", "Lancaster County", "Lancaster", "Builder", "https://lancastercountyplanning.org/DocumentCenter/View/5415/Checklist-for-Applicants-2024", "2024-01-24"),
    ("Lancaster County SALDO Plan Processing Application", "Lancaster County", "Lancaster", "Builder", "https://lancastercountyplanning.org/DocumentCenter/View/38/Application-for-Subdivision-or-LDP-Plan-Processing-REV12021", "2021-01-01"),
]


def load_drive() -> list[dict]:
    path = ROOT / "scripts/drive-docs.json"
    docs = json.loads(path.read_text(encoding="utf-8"))
    extra = ROOT / "scripts/extra-drive-docs.json"
    if extra.exists():
        docs.extend(json.loads(extra.read_text(encoding="utf-8")))
    # de-dupe by Drive file id, keep first
    seen_ids: set[str] = set()
    out: list[dict] = []
    for rec in docs:
        fid = rec.get("id") or ""
        if fid in seen_ids:
            continue
        seen_ids.add(fid)
        out.append(rec)
    return out


def load_recovered_official() -> list[dict]:
    docs: list[dict] = []
    for path in sorted((ROOT / "scripts").glob("recovered-*-official-documents.json")):
        docs.extend(json.loads(path.read_text(encoding="utf-8")))
    return docs


def ts_escape(s: str) -> str:
    return s.replace("\\", "\\\\").replace('"', '\\"')


def main() -> None:
    docs: list[dict] = []
    seen: set[str] = set()
    seen_content_hashes: set[str] = set()

    for i, (name, muni, county, cat, url, updated) in enumerate(OFFICIAL, 1):
        did = f"off-{i:03d}"
        docs.append(
            {
                "id": did,
                "name": name,
                "kind": "WEB" if not url.lower().endswith(".pdf") else "PDF",
                "size": "PDF" if url.lower().endswith(".pdf") else "Online",
                "municipality": muni,
                "county": county,
                "category": cat,
                "updated": fmt_date(updated),
                "url": url,
                "source": "official",
            }
        )
        seen.add(name.lower())

    recovered = load_recovered_official()
    for rec in [*load_drive(), *recovered]:
        name = rec["n"]
        cat = rec.get("category") or categorize(name)
        if not cat:
            continue
        display = clean_name(name)
        key = display.lower()
        if key in seen:
            continue
        content_hash = rec.get("contentHash")
        if content_hash and content_hash in seen_content_hashes:
            continue
        seen.add(key)
        if content_hash:
            seen_content_hashes.add(content_hash)
        fid = rec["id"]
        mime = rec.get("m", "application/pdf")
        kind = rec.get("kind") or kind_of(name, mime)
        if kind == "WEB" and not rec.get("url"):
            continue
        doc = {
            "id": fid if rec.get("source") == "official" else f"drv-{fid[:16]}",
            "name": display,
            "kind": kind,
            "size": rec.get("size") or fmt_size(int(rec.get("s") or 0)),
            "municipality": rec.get("muni") or muni_from(name),
            "county": rec["c"],
            "category": cat,
            "updated": fmt_date(rec.get("d") or ""),
            "url": rec.get("url") or f"https://drive.google.com/file/d/{fid}/view",
            "source": rec.get("source") or "drive",
        }
        if rec.get("linkType"):
            doc["linkType"] = rec["linkType"]
        docs.append(doc)

    # stable sort: county, municipality, category, name
    cat_order = {"Zoning": 0, "SALDO": 1, "Builder": 2, "Codes": 3}
    docs.sort(key=lambda d: (d["county"], d["municipality"], cat_order[d["category"]], d["name"].lower()))

    counts = {}
    for d in docs:
        counts[d["category"]] = counts.get(d["category"], 0) + 1

    regional_docs = [d for d in docs if d["county"] in CORE_COUNTIES]
    regional_saldo = [d for d in regional_docs if d["category"] == "SALDO"]
    regional_saldo_municipalities = {d["municipality"] for d in regional_saldo}

    lines = [
        'import type { PlanningDoc } from "@/lib/types";',
        "",
        "/** Curated municipal planning documents from official and archived source intake. */",
        "export const DOCUMENTS: PlanningDoc[] = [",
    ]
    for d in docs:
        lines.append("  {")
        for k in ("id", "name", "kind", "size", "municipality", "county", "category", "updated", "url", "source", "linkType"):
            if k not in d:
                continue
            v = d[k]
            lines.append(f'    {k}: "{ts_escape(str(v))}",')
        lines.append("  },")
    lines.append("];")
    lines.append("")
    OUT.write_text("\n".join(lines) + "\n", encoding="utf-8")
    summary_lines = [
        "/** Generated by scripts/gen-doc-catalog.py. Do not edit by hand. */",
        "export const REGIONAL_DOCUMENT_COVERAGE = {",
        f"  sourceRecords: {len(regional_docs)},",
        f"  saldoRecords: {len(regional_saldo)},",
        f"  saldoMunicipalities: {len(regional_saldo_municipalities)},",
        f"  counties: {list(CORE_COUNTIES)!r} as const,",
        "} as const;",
        "",
    ]
    SUMMARY_OUT.write_text("\n".join(summary_lines), encoding="utf-8")
    print(f"wrote {len(docs)} docs -> {OUT}")
    print(f"wrote regional coverage -> {SUMMARY_OUT}")
    print(counts)


if __name__ == "__main__":
    main()
