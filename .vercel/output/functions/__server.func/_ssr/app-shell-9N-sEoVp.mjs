import { o as __toESM } from "../_runtime.mjs";
import { b as require_react, g as Slot, y as require_jsx_runtime } from "../_libs/@radix-ui/react-accordion+[...].mjs";
import { d as useRouterState, v as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { B as BookOpen, D as FileText, P as CircleHelp, V as Bell, g as Menu, i as Users, l as Search, t as X } from "../_libs/lucide-react.mjs";
import { a as DialogPortal, i as DialogOverlay, n as DialogClose, r as DialogContent, t as Dialog } from "../_libs/@radix-ui/react-dialog+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/app-shell-9N-sEoVp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/** Real municipal planning documents: Drive crawl + official ordinance sources. */
var DOCUMENTS = [
	{
		id: "drv-1Mf9bOV4VmS0w793",
		name: "Clarion County - SALDO 2023",
		kind: "PDF",
		size: "2.4 MB",
		municipality: "Clarion County",
		county: "Clarion",
		category: "SALDO",
		updated: "Jul 31, 2026",
		url: "https://drive.google.com/file/d/1Mf9bOV4VmS0w793HBwqfg7vy_YiGboCE/view",
		source: "drive"
	},
	{
		id: "off-021",
		name: "Camp Hill Borough Commercial Zoning Districts (eCode360)",
		kind: "WEB",
		size: "Online",
		municipality: "Camp Hill Borough",
		county: "Cumberland",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/50221673",
		source: "official"
	},
	{
		id: "off-018",
		name: "Camp Hill Borough Zoning Code",
		kind: "WEB",
		size: "Online",
		municipality: "Camp Hill Borough",
		county: "Cumberland",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://www.camphillborough.com/departments/codes_enforcement___zoning/zoning_code.php",
		source: "official"
	},
	{
		id: "off-019",
		name: "Camp Hill Borough SALDO (December 2020)",
		kind: "PDF",
		size: "PDF",
		municipality: "Camp Hill Borough",
		county: "Cumberland",
		category: "SALDO",
		updated: "Dec 9, 2020",
		url: "https://cms8.revize.com/revize/camphillborough/Departments/Code%20Enforcement-Zoning/CHB%20FINAL%20SALDO%20120920.pdf",
		source: "official"
	},
	{
		id: "off-020",
		name: "Camp Hill Borough Codes Enforcement & Zoning",
		kind: "WEB",
		size: "Online",
		municipality: "Camp Hill Borough",
		county: "Cumberland",
		category: "Codes",
		updated: "Jan 1, 2026",
		url: "https://www.camphillborough.com/departments/codes_enforcement___zoning/index.php",
		source: "official"
	},
	{
		id: "off-022",
		name: "Carlisle Borough Code of Ordinances (eCode360 CA1126)",
		kind: "WEB",
		size: "Online",
		municipality: "Carlisle Borough",
		county: "Cumberland",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://ecode360.com/CA1126",
		source: "official"
	},
	{
		id: "off-024",
		name: "Carlisle Borough Nonconformities (Zoning)",
		kind: "WEB",
		size: "Online",
		municipality: "Carlisle Borough",
		county: "Cumberland",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/10686463",
		source: "official"
	},
	{
		id: "off-023",
		name: "Carlisle Borough Zoning Information",
		kind: "WEB",
		size: "Online",
		municipality: "Carlisle Borough",
		county: "Cumberland",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.carlislepa.org/business/zoning_information/index.php",
		source: "official"
	},
	{
		id: "off-148",
		name: "Carlisle Borough SALDO, Chapter 226 (eCode360 CA1126)",
		kind: "WEB",
		size: "Online",
		municipality: "Carlisle Borough",
		county: "Cumberland",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/CA1126",
		source: "official"
	},
	{
		id: "off-149",
		name: "Carlisle Borough SALDO Application Package",
		kind: "PDF",
		size: "PDF",
		municipality: "Carlisle Borough",
		county: "Cumberland",
		category: "Builder",
		updated: "Apr 1, 2022",
		url: "https://cms8.revize.com/revize/carlislepa/Forms%20and%20Applications/Permit%20Applications/SALDO%20Application%20Package%20REV%20042022.pdf",
		source: "official"
	},
	{
		id: "off-025",
		name: "Cumberland County Planning Department",
		kind: "WEB",
		size: "Online",
		municipality: "Cumberland County",
		county: "Cumberland",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.cumberlandcountypa.gov/120/Planning-Department",
		source: "official"
	},
	{
		id: "off-058",
		name: "East Pennsboro Township Code of Ordinances (eCode360 EA3722)",
		kind: "WEB",
		size: "Online",
		municipality: "East Pennsboro Township",
		county: "Cumberland",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/EA3722",
		source: "official"
	},
	{
		id: "off-060",
		name: "East Pennsboro Township Zoning Department",
		kind: "WEB",
		size: "Online",
		municipality: "East Pennsboro Township",
		county: "Cumberland",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.eastpennsboro.net/departments/zoning.php",
		source: "official"
	},
	{
		id: "off-059",
		name: "East Pennsboro Township Zoning Ordinance 851-2023",
		kind: "WEB",
		size: "Online",
		municipality: "East Pennsboro Township",
		county: "Cumberland",
		category: "Zoning",
		updated: "Dec 1, 2023",
		url: "https://ecode360.com/30879561",
		source: "official"
	},
	{
		id: "off-092",
		name: "East Pennsboro Township SALDO Ordinance 852-2023",
		kind: "WEB",
		size: "Online",
		municipality: "East Pennsboro Township",
		county: "Cumberland",
		category: "SALDO",
		updated: "Dec 1, 2023",
		url: "https://ecode360.com/EA3722",
		source: "official"
	},
	{
		id: "off-061",
		name: "Hampden Township Code of Ordinances (Municode)",
		kind: "WEB",
		size: "Online",
		municipality: "Hampden Township",
		county: "Cumberland",
		category: "Zoning",
		updated: "Nov 14, 2025",
		url: "https://library.municode.com/pa/hampden_township",
		source: "official"
	},
	{
		id: "off-095",
		name: "Hampden Township Zoning, Chapter 27E (Municode)",
		kind: "WEB",
		size: "Online",
		municipality: "Hampden Township",
		county: "Cumberland",
		category: "Zoning",
		updated: "Nov 14, 2025",
		url: "https://library.municode.com/pa/hampden_township",
		source: "official"
	},
	{
		id: "off-144",
		name: "Hampden Township Land Development Ordinance, Chapter 22 (Municode)",
		kind: "WEB",
		size: "Online",
		municipality: "Hampden Township",
		county: "Cumberland",
		category: "SALDO",
		updated: "Nov 14, 2025",
		url: "https://library.municode.com/pa/hampden_township",
		source: "official"
	},
	{
		id: "off-062",
		name: "Hampden Township Community Development / Zoning",
		kind: "WEB",
		size: "Online",
		municipality: "Hampden Township",
		county: "Cumberland",
		category: "Builder",
		updated: "Jan 1, 2026",
		url: "https://www.hampdentownship.us/township_departments/community_development/index.php",
		source: "official"
	},
	{
		id: "off-066",
		name: "Lower Allen Township",
		kind: "WEB",
		size: "Online",
		municipality: "Lower Allen Township",
		county: "Cumberland",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.lowerallen.com/",
		source: "official"
	},
	{
		id: "off-145",
		name: "Lower Allen Township Code of Ordinances (eCode360 LO1571)",
		kind: "WEB",
		size: "Online",
		municipality: "Lower Allen Township",
		county: "Cumberland",
		category: "SALDO",
		updated: "Jan 1, 2023",
		url: "https://ecode360.com/LO1571",
		source: "official"
	},
	{
		id: "off-067",
		name: "Mechanicsburg Borough",
		kind: "WEB",
		size: "Online",
		municipality: "Mechanicsburg Borough",
		county: "Cumberland",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.mechanicsburgpa.org/",
		source: "official"
	},
	{
		id: "drv-1I2S3ww1ywK75UDn",
		name: "New Cumberland Borough - Subdivision and Land Development Ordinance (SALDO) Ordinance 719",
		kind: "PDF",
		size: "750 KB",
		municipality: "New Cumberland Borough",
		county: "Cumberland",
		category: "SALDO",
		updated: "Jul 31, 2026",
		url: "https://drive.google.com/file/d/1I2S3ww1ywK75UDn1cpxwVuuqHA9QsdhM/view",
		source: "drive"
	},
	{
		id: "off-063",
		name: "New Cumberland Borough SALDO Ordinance 719",
		kind: "WEB",
		size: "Online",
		municipality: "New Cumberland Borough",
		county: "Cumberland",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://drive.google.com/file/d/1I2S3ww1ywK75UDn1cpxwVuuqHA9QsdhM/view",
		source: "official"
	},
	{
		id: "drv-1Bel3sTG8LmefV9h",
		name: "Shippensburg Township - Figure 13.4-Proposed & Approved SALDO",
		kind: "PDF",
		size: "296 KB",
		municipality: "Shippensburg Township",
		county: "Cumberland",
		category: "SALDO",
		updated: "Jul 31, 2026",
		url: "https://drive.google.com/file/d/1Bel3sTG8LmefV9hSOYLvlQs4bNnJ928s/view",
		source: "drive"
	},
	{
		id: "off-064",
		name: "Silver Spring Township Planning & Zoning",
		kind: "WEB",
		size: "Online",
		municipality: "Silver Spring Township",
		county: "Cumberland",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.sstwp.org/",
		source: "official"
	},
	{
		id: "off-093",
		name: "Silver Spring Township Zoning Ordinance (Updated Jan 2026)",
		kind: "WEB",
		size: "Online",
		municipality: "Silver Spring Township",
		county: "Cumberland",
		category: "Zoning",
		updated: "Jan 28, 2026",
		url: "https://www.sstwp.org/government/zoning_ordinance/index.php",
		source: "official"
	},
	{
		id: "off-143",
		name: "Silver Spring Township SALDO",
		kind: "PDF",
		size: "PDF",
		municipality: "Silver Spring Township",
		county: "Cumberland",
		category: "SALDO",
		updated: "Dec 16, 2021",
		url: "https://cms2.revize.com/revize/silverspringtowns/Documents/Departments/Community%20Development/Permit%20Forms%20Applications/Subdivision-and-Land-Development-Ordinance-SALDO.pdf",
		source: "official"
	},
	{
		id: "off-094",
		name: "Silver Spring Township Zoning Hearing Application",
		kind: "PDF",
		size: "PDF",
		municipality: "Silver Spring Township",
		county: "Cumberland",
		category: "Builder",
		updated: "Jun 16, 2026",
		url: "https://www.sstwp.org/App%20for%20Variance-Special%20Exception-Appeal%206.2026%20with%20INSTRUCTIONS%20&%20AFFIDAVIT%20-%20FILLABLE%20FORM.pdf",
		source: "official"
	},
	{
		id: "off-065",
		name: "Upper Allen Township",
		kind: "WEB",
		size: "Online",
		municipality: "Upper Allen Township",
		county: "Cumberland",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.upperallen.com/",
		source: "official"
	},
	{
		id: "off-090",
		name: "Upper Allen Township Code of Ordinances",
		kind: "WEB",
		size: "Online",
		municipality: "Upper Allen Township",
		county: "Cumberland",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://ecode360.com/8581258",
		source: "official"
	},
	{
		id: "off-146",
		name: "Upper Allen Township Code of Ordinances (eCode360 UP1380)",
		kind: "WEB",
		size: "Online",
		municipality: "Upper Allen Township",
		county: "Cumberland",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/UP1380",
		source: "official"
	},
	{
		id: "off-147",
		name: "Upper Allen Township Subdivision / Land Development Application",
		kind: "PDF",
		size: "PDF",
		municipality: "Upper Allen Township",
		county: "Cumberland",
		category: "Builder",
		updated: "Jan 1, 2024",
		url: "https://cms3.revize.com/revize/upperallen/Documents/I%20Want%20To/Read%20Download/Applications%20And%20Forms/Applications/Sub-LD%20Application%20Complete-Fillable.pdf",
		source: "official"
	},
	{
		id: "off-029",
		name: "Dauphin County Planning Commission",
		kind: "WEB",
		size: "Online",
		municipality: "Dauphin County",
		county: "Dauphin",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.tcrpc-pa.org/dcpc-about",
		source: "official"
	},
	{
		id: "off-068",
		name: "Derry Township Code of Ordinances (eCode360 DE2152)",
		kind: "WEB",
		size: "Online",
		municipality: "Derry Township",
		county: "Dauphin",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/DE2152",
		source: "official"
	},
	{
		id: "off-117",
		name: "Derry Township SALDO (eCode360 DE2152)",
		kind: "WEB",
		size: "Online",
		municipality: "Derry Township",
		county: "Dauphin",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/DE2152",
		source: "official"
	},
	{
		id: "off-027",
		name: "Harrisburg Planning and Zoning",
		kind: "WEB",
		size: "Online",
		municipality: "Harrisburg City",
		county: "Dauphin",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://harrisburgpa.gov/services/planning/index.php",
		source: "official"
	},
	{
		id: "off-026",
		name: "Harrisburg Zoning Code (2014)",
		kind: "WEB",
		size: "Online",
		municipality: "Harrisburg City",
		county: "Dauphin",
		category: "Zoning",
		updated: "Jan 1, 2014",
		url: "https://cityofharrisburg.zendesk.com/hc/en-us/articles/204832530",
		source: "official"
	},
	{
		id: "off-028",
		name: "Harrisburg Variance & Special Exception Application",
		kind: "WEB",
		size: "Online",
		municipality: "Harrisburg City",
		county: "Dauphin",
		category: "Builder",
		updated: "Jan 1, 2024",
		url: "https://cityofharrisburg.zendesk.com/hc/en-us/articles/204531720",
		source: "official"
	},
	{
		id: "off-069",
		name: "Lower Paxton Township Code of Ordinances (eCode360 LO1649)",
		kind: "WEB",
		size: "Online",
		municipality: "Lower Paxton Township",
		county: "Dauphin",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/LO1649",
		source: "official"
	},
	{
		id: "off-109",
		name: "Lower Paxton Township Codified Ordinances (eCode360 LO1649)",
		kind: "WEB",
		size: "Online",
		municipality: "Lower Paxton Township",
		county: "Dauphin",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.lowerpaxton-pa.gov/264/Codified-Ordinances",
		source: "official"
	},
	{
		id: "off-150",
		name: "Lower Paxton Township SALDO (eCode360 LO1649)",
		kind: "WEB",
		size: "Online",
		municipality: "Lower Paxton Township",
		county: "Dauphin",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/LO1649",
		source: "official"
	},
	{
		id: "off-071",
		name: "Susquehanna Township",
		kind: "WEB",
		size: "Online",
		municipality: "Susquehanna Township",
		county: "Dauphin",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.susquehannatwp.com/",
		source: "official"
	},
	{
		id: "off-070",
		name: "Swatara Township",
		kind: "WEB",
		size: "Online",
		municipality: "Swatara Township",
		county: "Dauphin",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.swataratwp.com/",
		source: "official"
	},
	{
		id: "off-091",
		name: "Swatara Township Code of Ordinances",
		kind: "WEB",
		size: "Online",
		municipality: "Swatara Township",
		county: "Dauphin",
		category: "Zoning",
		updated: "Mar 4, 2026",
		url: "https://ecode360.com/11632895",
		source: "official"
	},
	{
		id: "off-151",
		name: "Swatara Township Subdivision and Land Development (eCode360 SW2044)",
		kind: "WEB",
		size: "Online",
		municipality: "Swatara Township",
		county: "Dauphin",
		category: "SALDO",
		updated: "Mar 4, 2026",
		url: "https://ecode360.com/SW2044",
		source: "official"
	},
	{
		id: "drv-1XLX6-gwgCyw7pXA",
		name: "Erie County - SALDO as Amended 2024",
		kind: "PDF",
		size: "1.3 MB",
		municipality: "Erie County",
		county: "Erie",
		category: "SALDO",
		updated: "Jul 31, 2026",
		url: "https://drive.google.com/file/d/1XLX6-gwgCyw7pXAig0FXYrpL4AcuUdKB/view",
		source: "drive"
	},
	{
		id: "drv-1xxj9n-BaUReJtGy",
		name: "Erie County - SALDO Solar Amendment 2024",
		kind: "PDF",
		size: "1.1 MB",
		municipality: "Erie County",
		county: "Erie",
		category: "SALDO",
		updated: "Jul 31, 2026",
		url: "https://drive.google.com/file/d/1xxj9n-BaUReJtGyVFGdtm3RMdPCCBXiN/view",
		source: "drive"
	},
	{
		id: "drv-1Oq1z7CQzPtiIiU6",
		name: "Venango Township - Venango-SALDO-Final-Draft",
		kind: "PDF",
		size: "2.7 MB",
		municipality: "Venango Township",
		county: "Erie",
		category: "SALDO",
		updated: "Jul 31, 2026",
		url: "https://drive.google.com/file/d/1Oq1z7CQzPtiIiU6EBBB2MlF4ov8bTM6K/view",
		source: "drive"
	},
	{
		id: "drv-1LT3cCuGWfMavgN4",
		name: "Franklin County - SALDO Data Center Amendment 2026",
		kind: "PDF",
		size: "1.2 MB",
		municipality: "Franklin County",
		county: "Franklin",
		category: "SALDO",
		updated: "Jul 31, 2026",
		url: "https://drive.google.com/file/d/1LT3cCuGWfMavgN4SlU785T_chrw_Hc3d/view",
		source: "drive"
	},
	{
		id: "drv-1Bqv3s9tdFpxqAnT",
		name: "Letterkenny Township - Amendment to SALDO",
		kind: "PDF",
		size: "575 KB",
		municipality: "Letterkenny Township",
		county: "Franklin",
		category: "SALDO",
		updated: "Jul 31, 2026",
		url: "https://drive.google.com/file/d/1Bqv3s9tdFpxqAnTHPQECK0-afOVuxJ8n/view",
		source: "drive"
	},
	{
		id: "drv-1Bm-ip6XLll59oCS",
		name: "Letterkenny Township - SALDO-Section 1100 thru 1405",
		kind: "PDF",
		size: "1.2 MB",
		municipality: "Letterkenny Township",
		county: "Franklin",
		category: "SALDO",
		updated: "Jul 31, 2026",
		url: "https://drive.google.com/file/d/1Bm-ip6XLll59oCSYI3QaFr5t8YmlWwS5/view",
		source: "drive"
	},
	{
		id: "drv-1CCHb4-tNXAM7PYF",
		name: "Letterkenny Township - SALDO-Section 400 thru 902",
		kind: "PDF",
		size: "8.8 MB",
		municipality: "Letterkenny Township",
		county: "Franklin",
		category: "SALDO",
		updated: "Jul 31, 2026",
		url: "https://drive.google.com/file/d/1CCHb4-tNXAM7PYFbRMcezd5utag05q78/view",
		source: "drive"
	},
	{
		id: "drv-1qX_JZX6JPzcmWQU",
		name: "Letterkenny Township - SALDO-Section 903 thru 1016",
		kind: "PDF",
		size: "11 MB",
		municipality: "Letterkenny Township",
		county: "Franklin",
		category: "SALDO",
		updated: "Jul 31, 2026",
		url: "https://drive.google.com/file/d/1qX_JZX6JPzcmWQUf8sV02d5AmExekf_e/view",
		source: "drive"
	},
	{
		id: "drv-1cY6tjAnPPnYGNBb",
		name: "Letterkenny Township - SALDO-Table of Contents thru Section 300",
		kind: "PDF",
		size: "13 MB",
		municipality: "Letterkenny Township",
		county: "Franklin",
		category: "SALDO",
		updated: "Jul 31, 2026",
		url: "https://drive.google.com/file/d/1cY6tjAnPPnYGNBb5RU0pBj1m6l3l7J-8/view",
		source: "drive"
	},
	{
		id: "drv-1h3d3NMEpmXAzQtB",
		name: "Wells Township - WELLS SALDO-1979",
		kind: "PDF",
		size: "1.8 MB",
		municipality: "Wells Township",
		county: "Fulton",
		category: "SALDO",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1h3d3NMEpmXAzQtB4p6Jlf6M-b6ToQw6g/view",
		source: "drive"
	},
	{
		id: "drv-1SVnv8SZVVHNwts9",
		name: "Juniata Township - 2018 3 ORD Juniata Township SALDO",
		kind: "PDF",
		size: "765 KB",
		municipality: "Juniata Township",
		county: "Huntingdon",
		category: "SALDO",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1SVnv8SZVVHNwts9d-iLC8lzodU2oeaqk/view",
		source: "drive"
	},
	{
		id: "drv-1SlwsSg9IKHOQoCg",
		name: "Oneida Township - Zoning Ordinance Oneida Township 1999",
		kind: "PDF",
		size: "23 MB",
		municipality: "Oneida Township",
		county: "Huntingdon",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1SlwsSg9IKHOQoCgNwjUpWebgGJCTq7Wf/view",
		source: "drive"
	},
	{
		id: "drv-15lDCSz9RwVOKdvS",
		name: "Smithfield Township - Code Appendix J Zoning; Prior Ordinances",
		kind: "PDF",
		size: "33 KB",
		municipality: "Smithfield Township",
		county: "Huntingdon",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/15lDCSz9RwVOKdvSZ31zpT2BdFuOMYILr/view",
		source: "drive"
	},
	{
		id: "drv-1Kk6G9yXPXuaZLG5",
		name: "Smithfield Township - Zoning District Regulations Including Setbacks (Zoning Ordinance Part 4)",
		kind: "PDF",
		size: "144 KB",
		municipality: "Smithfield Township",
		county: "Huntingdon",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1Kk6G9yXPXuaZLG5x_ff1Kahx0CPL-mOJ/view",
		source: "drive"
	},
	{
		id: "drv-1wMBrPXtId_0XtfC",
		name: "Three Springs Borough - SALDO 2025",
		kind: "PDF",
		size: "1011 KB",
		municipality: "Three Springs Borough",
		county: "Huntingdon",
		category: "SALDO",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1wMBrPXtId_0XtfCYAru-YjDJXM_AIa0Z/view",
		source: "drive"
	},
	{
		id: "drv-1yLG8YL4HBZ5pkmW",
		name: "Walker Township - Walker Township Zoning Ordinance, amended 7-22-2025",
		kind: "PDF",
		size: "921 KB",
		municipality: "Walker Township",
		county: "Huntingdon",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1yLG8YL4HBZ5pkmWOMhH0NGVfhCY5lYqw/view",
		source: "drive"
	},
	{
		id: "drv-1m2ppMDwbCjuI9Pr",
		name: "Warriors Mark Township - Ordinance 2020-01 Amend Zoning 2015-01",
		kind: "PDF",
		size: "5.9 MB",
		municipality: "Warriors Mark Township",
		county: "Huntingdon",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1m2ppMDwbCjuI9PrRCZzVAdYkqZsGWavm/view",
		source: "drive"
	},
	{
		id: "drv-189AnF8nsgKgKyPE",
		name: "Warriors Mark Township - Warriors Mark Township Zoning Ordinance with Amendment – Ordinance No. 2005-2 and Ordinance No. 2010-01",
		kind: "PDF",
		size: "469 KB",
		municipality: "Warriors Mark Township",
		county: "Huntingdon",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/189AnF8nsgKgKyPEXNZk5Vuqw2-HHy2L6/view",
		source: "drive"
	},
	{
		id: "drv-1nAVtgx1DS3crbjd",
		name: "Warriors Mark Township - Zoning Ordinance Setback Requirements",
		kind: "PDF",
		size: "1.3 MB",
		municipality: "Warriors Mark Township",
		county: "Huntingdon",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1nAVtgx1DS3crbjdT25OYgQKdHbtD-R50/view",
		source: "drive"
	},
	{
		id: "drv-1J58UR-yMa8bCj6W",
		name: "Warriors Mark Township - 98-2 SALDO",
		kind: "PDF",
		size: "6.6 MB",
		municipality: "Warriors Mark Township",
		county: "Huntingdon",
		category: "SALDO",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1J58UR-yMa8bCj6WF520P5phEu5YWYboa/view",
		source: "drive"
	},
	{
		id: "drv-1LNwl_t3DSOihnVf",
		name: "Warriors Mark Township - 98-2 SALDO Amendment 2021-1",
		kind: "PDF",
		size: "358 KB",
		municipality: "Warriors Mark Township",
		county: "Huntingdon",
		category: "SALDO",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1LNwl_t3DSOihnVf2avQ71sVinOEJJFW3/view",
		source: "drive"
	},
	{
		id: "drv-1YwuKJsn-kw2Eg37",
		name: "Warriors Mark Township - 98-2 SALDO Amendment 3.7.00",
		kind: "PDF",
		size: "471 KB",
		municipality: "Warriors Mark Township",
		county: "Huntingdon",
		category: "SALDO",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1YwuKJsn-kw2Eg37cWKuZ_n0bntscH7XR/view",
		source: "drive"
	},
	{
		id: "drv-1qk8IKfVxiMb-i7x",
		name: "Warriors Mark Township - New SALDO Application",
		kind: "PDF",
		size: "838 KB",
		municipality: "Warriors Mark Township",
		county: "Huntingdon",
		category: "Builder",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1qk8IKfVxiMb-i7xWdCsZZL4tYhPn3FPn/view",
		source: "drive"
	},
	{
		id: "drv-14Oe0yvgx8xNzxZi",
		name: "Fayette Township - FATP Zoning Ordinance",
		kind: "PDF",
		size: "6.1 MB",
		municipality: "Fayette Township",
		county: "Juniata",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/14Oe0yvgx8xNzxZiJSawnfQ7giN1U9GCw/view",
		source: "drive"
	},
	{
		id: "drv-1zaIgJQ5Meysmbq8",
		name: "Fayette Township - Fayette Township SALDO",
		kind: "PDF",
		size: "5.4 MB",
		municipality: "Fayette Township",
		county: "Juniata",
		category: "SALDO",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1zaIgJQ5Meysmbq8DuJqmVCoVOrsxznnW/view",
		source: "drive"
	},
	{
		id: "drv-1FIdVRT9l_6_U1qO",
		name: "Benton Township - Benton Township Zoning Ordinance",
		kind: "PDF",
		size: "1.4 MB",
		municipality: "Benton Township",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1FIdVRT9l_6_U1qOIQ-0bkgxImxN86_6G/view",
		source: "drive"
	},
	{
		id: "drv-1R9gsbMzgqs-ron3",
		name: "Clarks Summit Borough - 2020-04 Zoning Ordinance",
		kind: "PDF",
		size: "1.9 MB",
		municipality: "Clarks Summit Borough",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1R9gsbMzgqs-ron3hlijXfUV7hEh8cg6U/view",
		source: "drive"
	},
	{
		id: "drv-1q-czCZ76_qmJm-h",
		name: "Covington Township - 2025-04 Large Scale Solar Zoning Ordinance Amendment",
		kind: "PDF",
		size: "523 KB",
		municipality: "Covington Township",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1q-czCZ76_qmJm-hUVkPGD06do820wRT2/view",
		source: "drive"
	},
	{
		id: "drv-1abjVGSwFaBPQ9Oq",
		name: "Covington Township - Covington Township Zoning Ordinance",
		kind: "PDF",
		size: "15 MB",
		municipality: "Covington Township",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1abjVGSwFaBPQ9OqymLDHOzYKSuao57qd/view",
		source: "drive"
	},
	{
		id: "drv-1zbc4n8vHeXX3Wj2",
		name: "Covington Township - Zoning Ordinance Amend Communication Towers",
		kind: "PDF",
		size: "4.3 MB",
		municipality: "Covington Township",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1zbc4n8vHeXX3Wj27sq90EBSkdwPx1BBn/view",
		source: "drive"
	},
	{
		id: "drv-1j8dSXc6bxGAhsTu",
		name: "Covington Township - Zoning Ordinance Amend Forestry, Firewood & Storage",
		kind: "PDF",
		size: "1.7 MB",
		municipality: "Covington Township",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1j8dSXc6bxGAhsTufpVXcPQUIy449P6F4/view",
		source: "drive"
	},
	{
		id: "drv-1Ih6EO9_yCUhf0LS",
		name: "Covington Township - Zoning Ordinance Amend Lot Sizes 2_26_13",
		kind: "PDF",
		size: "973 KB",
		municipality: "Covington Township",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1Ih6EO9_yCUhf0LSOYS1ZaYTIHfTqSU54/view",
		source: "drive"
	},
	{
		id: "drv-1C2fT4sQ8EPqu5CD",
		name: "Covington Township - Covington Twp. Subdivision and Land Development Ordinance (SALDO) 2015-03",
		kind: "PDF",
		size: "43 MB",
		municipality: "Covington Township",
		county: "Lackawanna",
		category: "SALDO",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1C2fT4sQ8EPqu5CDZs_7ZE3ZLP-0xavRa/view",
		source: "drive"
	},
	{
		id: "drv-11MROb6m1XrclWNS",
		name: "Covington Township - Zoning Ordinance Amend Special Exception",
		kind: "PDF",
		size: "468 KB",
		municipality: "Covington Township",
		county: "Lackawanna",
		category: "Builder",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/11MROb6m1XrclWNSuDhGPEdBKrYOhndkk/view",
		source: "drive"
	},
	{
		id: "drv-1GOfROlWChYcFFhR",
		name: "Dunmore Borough - Borough of Dunmore Zoning Ordinance",
		kind: "PDF",
		size: "9.0 MB",
		municipality: "Dunmore Borough",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1GOfROlWChYcFFhRb_37m_Lmq2lqwhVxI/view",
		source: "drive"
	},
	{
		id: "drv-1d0NnX8T28gYtV03",
		name: "Jefferson Township - Ordinance No_4 of 2024 (Zoning Ordinance Amendment)",
		kind: "PDF",
		size: "202 KB",
		municipality: "Jefferson Township",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1d0NnX8T28gYtV035orhAocVM6ftKhZsQ/view",
		source: "drive"
	},
	{
		id: "drv-1xlCwK50b3YUk1jj",
		name: "Jefferson Township - Zoning Ordinance",
		kind: "PDF",
		size: "19 MB",
		municipality: "Jefferson Township",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1xlCwK50b3YUk1jj1dqvaHcvAHDHqMNmX/view",
		source: "drive"
	},
	{
		id: "drv-1ZVKW18VKZUj6OjP",
		name: "Jefferson Township - SALDO (Subdivision & Land Development Ordinance)",
		kind: "PDF",
		size: "7.0 MB",
		municipality: "Jefferson Township",
		county: "Lackawanna",
		category: "SALDO",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1ZVKW18VKZUj6OjPhR7H3xpSdGu7tFWJc/view",
		source: "drive"
	},
	{
		id: "drv-1-fHMf-frHQUdq-p",
		name: "Jessup Borough - 04 2025 Zoning Ordinance Amendment",
		kind: "PDF",
		size: "19 MB",
		municipality: "Jessup Borough",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1-fHMf-frHQUdq-pW9-31oY55rrynwmTt/view",
		source: "drive"
	},
	{
		id: "drv-1EqUlUWBJuEI3Omn",
		name: "Jessup Borough - 06 2025 Zoning Ordinance Amendment",
		kind: "PDF",
		size: "19 MB",
		municipality: "Jessup Borough",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1EqUlUWBJuEI3OmnIVMeL6XY35ZNId50g/view",
		source: "drive"
	},
	{
		id: "drv-1q_92t-ozD-IywwJ",
		name: "Jessup Borough - Zoning Ordinance",
		kind: "PDF",
		size: "2.3 MB",
		municipality: "Jessup Borough",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1q_92t-ozD-IywwJZP7B_FmGIN883GG46/view",
		source: "drive"
	},
	{
		id: "drv-1PK3UAAc9-53MIFD",
		name: "Moscow Borough - Moscow Zoning Ordinance",
		kind: "PDF",
		size: "3.4 MB",
		municipality: "Moscow Borough",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1PK3UAAc9-53MIFD098Qc9-XEFAbc-Wi5/view",
		source: "drive"
	},
	{
		id: "drv-15I8iVGcMBjncQ4q",
		name: "Scott Township - Zoning Ordinance",
		kind: "PDF",
		size: "8.7 MB",
		municipality: "Scott Township",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/15I8iVGcMBjncQ4qAWeKgdxUcc20pCLM1/view",
		source: "drive"
	},
	{
		id: "drv-1aa9DA2yCVnha3hm",
		name: "Spring Brook Township - 2012 Zoning Ordinance (Amended Oct. 2020)",
		kind: "PDF",
		size: "3.1 MB",
		municipality: "Spring Brook Township",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1aa9DA2yCVnha3hm9GhtDeMGejmipho4j/view",
		source: "drive"
	},
	{
		id: "drv-1tNgiI9LBZmcvPxy",
		name: "Taylor Borough - Zoning Ordinance",
		kind: "PDF",
		size: "10 MB",
		municipality: "Taylor Borough",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1tNgiI9LBZmcvPxyvs7JHA3QqUjWhnMrO/view",
		source: "drive"
	},
	{
		id: "drv-1GlE8nPhvnKWj2eo",
		name: "Taylor Borough - Fee Schedules Zoning, SALDO & UCC",
		kind: "PDF",
		size: "550 KB",
		municipality: "Taylor Borough",
		county: "Lackawanna",
		category: "Builder",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1GlE8nPhvnKWj2eohz2MjyC-DPN4wu9X8/view",
		source: "drive"
	},
	{
		id: "drv-1pyiXrR3m7iXklrW",
		name: "Thornhurst Township - Zoning Ordinance Amendment",
		kind: "PDF",
		size: "390 KB",
		municipality: "Thornhurst Township",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/1pyiXrR3m7iXklrWXkt-ZJQICIgRIhSPH/view",
		source: "drive"
	},
	{
		id: "drv-10Z519AUb7baYeFr",
		name: "Thornhurst Township - Zoning Ordinance Amendment 47",
		kind: "PDF",
		size: "4.6 MB",
		municipality: "Thornhurst Township",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/10Z519AUb7baYeFrCwewKKGbuqjMawGCw/view",
		source: "drive"
	},
	{
		id: "drv-15-Ek0-XvSCUB9mh",
		name: "Vandling Borough - Vandling Borough Zoning Ordinance (pdf) Download",
		kind: "PDF",
		size: "8.1 MB",
		municipality: "Vandling Borough",
		county: "Lackawanna",
		category: "Zoning",
		updated: "Aug 1, 2026",
		url: "https://drive.google.com/file/d/15-Ek0-XvSCUB9mh_aokJSAwpTFN86erZ/view",
		source: "drive"
	},
	{
		id: "drv-1Fs9tYr8qx38wdyr",
		name: "Brecknock Township - Ord 196 SALDO amendments March 2014",
		kind: "PDF",
		size: "133 KB",
		municipality: "Brecknock Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1Fs9tYr8qx38wdyrBJP47PcsoRDwoi5vk/view",
		source: "drive"
	},
	{
		id: "drv-183nd6V3Jf-Hl5Cq",
		name: "Brecknock Township - SALDO & Stormwater Plan Submission and Review Fee Schedule (Page 4)",
		kind: "PDF",
		size: "207 KB",
		municipality: "Brecknock Township",
		county: "Lancaster",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/183nd6V3Jf-Hl5Cq3U7r9uo68eTEq_ylt/view",
		source: "drive"
	},
	{
		id: "off-096",
		name: "Columbia Borough Code of Ordinances (eCode360)",
		kind: "WEB",
		size: "Online",
		municipality: "Columbia Borough",
		county: "Lancaster",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.columbiapa.net/government/code_of_the_borough_of_columbia/index.php",
		source: "official"
	},
	{
		id: "off-161",
		name: "Columbia Borough SALDO (eCode360 CO0213)",
		kind: "WEB",
		size: "Online",
		municipality: "Columbia Borough",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/CO0213",
		source: "official"
	},
	{
		id: "off-073",
		name: "East Hempfield Township",
		kind: "WEB",
		size: "Online",
		municipality: "East Hempfield Township",
		county: "Lancaster",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.easthempfield.org/",
		source: "official"
	},
	{
		id: "off-088",
		name: "East Hempfield Township Code of Ordinances",
		kind: "WEB",
		size: "Online",
		municipality: "East Hempfield Township",
		county: "Lancaster",
		category: "Zoning",
		updated: "Mar 19, 2025",
		url: "https://ecode360.com/14056173",
		source: "official"
	},
	{
		id: "off-108",
		name: "East Hempfield Township Zoning, SALDO & Stormwater",
		kind: "WEB",
		size: "Online",
		municipality: "East Hempfield Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jan 1, 2026",
		url: "https://www.easthempfield.org/departments/development_services/zoning,_saldo,___stormwater_ordinances.php",
		source: "official"
	},
	{
		id: "drv-1mBiinLqafuyg4o3",
		name: "East Lampeter Township - Ordinance 308 - SALDO Amendment Road Frontage Improvements",
		kind: "PDF",
		size: "1.3 MB",
		municipality: "East Lampeter Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1mBiinLqafuyg4o3Wk-Kfec6B03QvQS1z/view",
		source: "drive"
	},
	{
		id: "drv-1fAD_Rr3FAZc0Den",
		name: "East Lampeter Township - SALDO Technical Specifications and Standards Details",
		kind: "PDF",
		size: "1.6 MB",
		municipality: "East Lampeter Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1fAD_Rr3FAZc0Den9Aju5fVWk4IzMfGT-/view",
		source: "drive"
	},
	{
		id: "off-076",
		name: "Ephrata Borough Code",
		kind: "WEB",
		size: "Online",
		municipality: "Ephrata Borough",
		county: "Lancaster",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.ephrataboro.org/",
		source: "official"
	},
	{
		id: "off-162",
		name: "Ephrata Borough Code of Ordinances (eCode360 EP1497)",
		kind: "WEB",
		size: "Online",
		municipality: "Ephrata Borough",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/EP1497",
		source: "official"
	},
	{
		id: "off-032",
		name: "Lancaster City Official Zoning Map",
		kind: "PDF",
		size: "PDF",
		municipality: "Lancaster City",
		county: "Lancaster",
		category: "Zoning",
		updated: "Aug 1, 2013",
		url: "https://www.cityoflancasterpa.gov/wp-content/uploads/2020/05/Zoning-Districts-Map.pdf",
		source: "official"
	},
	{
		id: "off-033",
		name: "Lancaster City Planning Maps & Resources",
		kind: "WEB",
		size: "Online",
		municipality: "Lancaster City",
		county: "Lancaster",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.cityoflancasterpa.gov/planning-maps-resources/",
		source: "official"
	},
	{
		id: "off-031",
		name: "Lancaster City Planning Ordinances",
		kind: "WEB",
		size: "Online",
		municipality: "Lancaster City",
		county: "Lancaster",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.cityoflancasterpa.gov/planning-ordinances/",
		source: "official"
	},
	{
		id: "off-030",
		name: "Lancaster City Zoning",
		kind: "WEB",
		size: "Online",
		municipality: "Lancaster City",
		county: "Lancaster",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.cityoflancasterpa.gov/zoning-info/",
		source: "official"
	},
	{
		id: "off-084",
		name: "Lancaster City Zoning Ordinance, Section 300",
		kind: "WEB",
		size: "Online",
		municipality: "Lancaster City",
		county: "Lancaster",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://ecode360.com/8122408",
		source: "official"
	},
	{
		id: "off-153",
		name: "Lancaster City SALDO Amendment (Nov 10, 2020)",
		kind: "PDF",
		size: "PDF",
		municipality: "Lancaster City",
		county: "Lancaster",
		category: "SALDO",
		updated: "Nov 10, 2020",
		url: "https://ecode360.com/LA1674/laws/LF1242607.pdf",
		source: "official"
	},
	{
		id: "off-152",
		name: "Lancaster City SALDO, Chapter 265",
		kind: "WEB",
		size: "Online",
		municipality: "Lancaster City",
		county: "Lancaster",
		category: "SALDO",
		updated: "Nov 10, 2020",
		url: "https://ecode360.com/8120437",
		source: "official"
	},
	{
		id: "off-154",
		name: "Lancaster City Subdivision / Land Development Plan Application",
		kind: "PDF",
		size: "PDF",
		municipality: "Lancaster City",
		county: "Lancaster",
		category: "Builder",
		updated: "Dec 1, 2019",
		url: "https://www.cityoflancasterpa.gov/wp-content/uploads/2019/12/Application-for-Subdivision-and-or-Land-Development-Plan-Review.pdf",
		source: "official"
	},
	{
		id: "off-035",
		name: "Lancaster County Planning Department",
		kind: "WEB",
		size: "Online",
		municipality: "Lancaster County",
		county: "Lancaster",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://lancastercountyplanning.org/",
		source: "official"
	},
	{
		id: "off-034",
		name: "Lancaster County Simplified Zoning",
		kind: "WEB",
		size: "Online",
		municipality: "Lancaster County",
		county: "Lancaster",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://lancastercountyplanning.org/241/Simplified-Zoning",
		source: "official"
	},
	{
		id: "drv-11Aie0UIIvCW7VRg",
		name: "Lancaster County - SALDO Coverage Map",
		kind: "PDF",
		size: "771 KB",
		municipality: "Lancaster County",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/11Aie0UIIvCW7VRgJ7U9fKd9xWnNSWBT7/view",
		source: "drive"
	},
	{
		id: "off-097",
		name: "Lancaster Township Zoning Map (Ord. 2024-01)",
		kind: "WEB",
		size: "Online",
		municipality: "Lancaster Township",
		county: "Lancaster",
		category: "Zoning",
		updated: "Apr 8, 2024",
		url: "https://www.twp.lancaster.pa.us/departments/planning___zoning/zoning_map.php",
		source: "official"
	},
	{
		id: "off-085",
		name: "Lancaster Township Zoning Ordinance (eCode360)",
		kind: "WEB",
		size: "Online",
		municipality: "Lancaster Township",
		county: "Lancaster",
		category: "Zoning",
		updated: "Aug 20, 2012",
		url: "https://ecode360.com/13005392",
		source: "official"
	},
	{
		id: "off-155",
		name: "Lancaster Township SALDO (eCode360 LA3847)",
		kind: "WEB",
		size: "Online",
		municipality: "Lancaster Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Aug 20, 2012",
		url: "https://ecode360.com/LA3847",
		source: "official"
	},
	{
		id: "off-072",
		name: "Manheim Township (Lancaster) Planning & Zoning",
		kind: "WEB",
		size: "Online",
		municipality: "Manheim Township",
		county: "Lancaster",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.manheimtownship.org/",
		source: "official"
	},
	{
		id: "off-107",
		name: "Manheim Township (Lancaster) Planning & Zoning",
		kind: "WEB",
		size: "Online",
		municipality: "Manheim Township",
		county: "Lancaster",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.manheimtownship.org/478/Planning-Zoning",
		source: "official"
	},
	{
		id: "off-087",
		name: "Manheim Township (Lancaster) Zoning, Chapter 500",
		kind: "WEB",
		size: "Online",
		municipality: "Manheim Township",
		county: "Lancaster",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://ecode360.com/44797427",
		source: "official"
	},
	{
		id: "off-106",
		name: "Manheim Township (Lancaster) SALDO, Chapter 440",
		kind: "WEB",
		size: "Online",
		municipality: "Manheim Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jan 1, 2026",
		url: "https://ecode360.com/14972684",
		source: "official"
	},
	{
		id: "drv-1AxS-ezNf6vTtCAj",
		name: "Manor Township - SALDO Modification_Waiver Request Application",
		kind: "PDF",
		size: "67 KB",
		municipality: "Manor Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1AxS-ezNf6vTtCAjW437UTjshIvH2BXn6/view",
		source: "drive"
	},
	{
		id: "drv-1kxsVXfg1MtV6lhS",
		name: "Manor Township - SALDO Application",
		kind: "PDF",
		size: "75 KB",
		municipality: "Manor Township",
		county: "Lancaster",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1kxsVXfg1MtV6lhSNecRFrBoXDCiIdDny/view",
		source: "drive"
	},
	{
		id: "drv-1FeJ5FviB4SGlNJ7",
		name: "Mount Joy Township - SALDO-Waiver-Request-Form-Combined",
		kind: "PDF",
		size: "325 KB",
		municipality: "Mount Joy Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1FeJ5FviB4SGlNJ7kQQYJMYtfIWr1p7-H/view",
		source: "drive"
	},
	{
		id: "drv-1AzQlyn3IfmLYSCB",
		name: "Paradise Township - SALDO-Appendices_Combined",
		kind: "PDF",
		size: "960 KB",
		municipality: "Paradise Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1AzQlyn3IfmLYSCBOYOgfMeDgzbOargmz/view",
		source: "drive"
	},
	{
		id: "drv-1dWCqcmrUE7FVJKX",
		name: "Paradise Township - SALDO-Ordinance-Combined-PDF",
		kind: "PDF",
		size: "938 KB",
		municipality: "Paradise Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1dWCqcmrUE7FVJKXRAatLstcrPtEeuzSN/view",
		source: "drive"
	},
	{
		id: "off-086",
		name: "Penn Township (Lancaster) Code of Ordinances (eCode360 PE3692)",
		kind: "WEB",
		size: "Online",
		municipality: "Penn Township",
		county: "Lancaster",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://ecode360.com/PE3692",
		source: "official"
	},
	{
		id: "off-098",
		name: "Penn Township (Lancaster) Land Use Ordinances",
		kind: "WEB",
		size: "Online",
		municipality: "Penn Township",
		county: "Lancaster",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://penntwplanco.org/government/departments-information/community-development/land-use-ordinances/",
		source: "official"
	},
	{
		id: "off-164",
		name: "Penn Township (Lancaster) SALDO Chapter 22 (PDF)",
		kind: "PDF",
		size: "PDF",
		municipality: "Penn Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/attachment/PE3692/Chapter%2022%20Subdivision%20and%20Land%20Development.pdf",
		source: "official"
	},
	{
		id: "off-163",
		name: "Penn Township (Lancaster) SALDO, Chapter 22",
		kind: "WEB",
		size: "Online",
		municipality: "Penn Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/30832282",
		source: "official"
	},
	{
		id: "drv-1iWJ2t-HwK0tBnKK",
		name: "Sadsbury Township - SALDO Ordinance",
		kind: "PDF",
		size: "7.8 MB",
		municipality: "Sadsbury Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1iWJ2t-HwK0tBnKKMqjPfFm4t1mUetez4/view",
		source: "drive"
	},
	{
		id: "drv-113STvIN_ZpMR8Yx",
		name: "Strasburg Township - #105 – Amending the SALDO",
		kind: "PDF",
		size: "231 KB",
		municipality: "Strasburg Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/113STvIN_ZpMR8YxkawQ2keuEueIBbefA/view",
		source: "drive"
	},
	{
		id: "drv-1MKDz8x4HJsnhkZf",
		name: "Strasburg Township - #97 – Subdivision and Land Development (SALDO)",
		kind: "PDF",
		size: "1.5 MB",
		municipality: "Strasburg Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1MKDz8x4HJsnhkZfYI9ls4Kg_mhdaxfqK/view",
		source: "drive"
	},
	{
		id: "drv-11GFCSg2-CPMlTTe",
		name: "Strasburg Township - SALDO – Appendices",
		kind: "PDF",
		size: "349 KB",
		municipality: "Strasburg Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/11GFCSg2-CPMlTTegnkDKi50Hyw39w8Pg/view",
		source: "drive"
	},
	{
		id: "drv-1GPncjFtBuEh67Mt",
		name: "Strasburg Township - SALDO – Cover",
		kind: "PDF",
		size: "11 KB",
		municipality: "Strasburg Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1GPncjFtBuEh67MtqHQSGftpAIb1lFo3A/view",
		source: "drive"
	},
	{
		id: "drv-11kyybB7yhF3XFiL",
		name: "Strasburg Township - SALDO – Table of Contents",
		kind: "PDF",
		size: "45 KB",
		municipality: "Strasburg Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/11kyybB7yhF3XFiLUS7VrBum974HhUAq1/view",
		source: "drive"
	},
	{
		id: "drv-1PAqM42DvmRoqAfg",
		name: "Strasburg Township - SALDO – Text",
		kind: "PDF",
		size: "847 KB",
		municipality: "Strasburg Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1PAqM42DvmRoqAfghyv3WTBMqhLcpagLE/view",
		source: "drive"
	},
	{
		id: "off-075",
		name: "Warwick Township (Lancaster)",
		kind: "WEB",
		size: "Online",
		municipality: "Warwick Township",
		county: "Lancaster",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.warwicktownship.org/",
		source: "official"
	},
	{
		id: "off-159",
		name: "Warwick Township Zoning Ordinance, Chapter 340",
		kind: "WEB",
		size: "Online",
		municipality: "Warwick Township",
		county: "Lancaster",
		category: "Zoning",
		updated: "Sep 19, 2024",
		url: "https://ecode360.com/11671452",
		source: "official"
	},
	{
		id: "off-158",
		name: "Warwick Township SALDO, Chapter 285",
		kind: "WEB",
		size: "Online",
		municipality: "Warwick Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/11669903",
		source: "official"
	},
	{
		id: "off-160",
		name: "Warwick Township Stormwater Management Ordinance, Chapter 270",
		kind: "WEB",
		size: "Online",
		municipality: "Warwick Township",
		county: "Lancaster",
		category: "Codes",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/11669240",
		source: "official"
	},
	{
		id: "off-089",
		name: "West Hempfield Township Code of Ordinances",
		kind: "WEB",
		size: "Online",
		municipality: "West Hempfield Township",
		county: "Lancaster",
		category: "Zoning",
		updated: "Nov 6, 2025",
		url: "https://ecode360.com/34201932",
		source: "official"
	},
	{
		id: "off-165",
		name: "West Hempfield Township Code of Ordinances (SALDO chapters)",
		kind: "WEB",
		size: "Online",
		municipality: "West Hempfield Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Nov 6, 2025",
		url: "https://ecode360.com/34201932",
		source: "official"
	},
	{
		id: "off-074",
		name: "West Lampeter Township",
		kind: "WEB",
		size: "Online",
		municipality: "West Lampeter Township",
		county: "Lancaster",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.westlampeter.com/",
		source: "official"
	},
	{
		id: "off-157",
		name: "West Lampeter Township Zoning Ordinance, Chapter 285",
		kind: "WEB",
		size: "Online",
		municipality: "West Lampeter Township",
		county: "Lancaster",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "http://ecode360.com/11694778",
		source: "official"
	},
	{
		id: "off-156",
		name: "West Lampeter Township SALDO",
		kind: "WEB",
		size: "Online",
		municipality: "West Lampeter Township",
		county: "Lancaster",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/11693695",
		source: "official"
	},
	{
		id: "drv-1MFLZ_Yw-v1JzRV7",
		name: "Carroll Township - Zoning Map",
		kind: "PDF",
		size: "2.9 MB",
		municipality: "Carroll Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1MFLZ_Yw-v1JzRV76QhtRZeyVhJDjmJRt/view",
		source: "drive"
	},
	{
		id: "off-123",
		name: "Carroll Township Zoning Ordinance",
		kind: "WEB",
		size: "Online",
		municipality: "Carroll Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://www.carrolltownship.com/zoning-ordinance/",
		source: "official"
	},
	{
		id: "off-122",
		name: "Carroll Township SALDO (December 2018)",
		kind: "PDF",
		size: "PDF",
		municipality: "Carroll Township",
		county: "York",
		category: "SALDO",
		updated: "Dec 10, 2018",
		url: "https://www.carrolltownship.com/wp-content/uploads/Carroll-Twp-SALDO-December-2018-ID-1645789.pdf",
		source: "official"
	},
	{
		id: "drv-1Cwi5HxpupYMKDXB",
		name: "Carroll Township - building permit",
		kind: "PDF",
		size: "413 KB",
		municipality: "Carroll Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1Cwi5HxpupYMKDXBpxYOMVCEacjGiWZOT/view",
		source: "drive"
	},
	{
		id: "drv-1zPldCPQchBL5ePF",
		name: "Carroll Township - driveway permit",
		kind: "PDF",
		size: "29 KB",
		municipality: "Carroll Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1zPldCPQchBL5ePFMfi5c06wR7mh0603E/view",
		source: "drive"
	},
	{
		id: "drv-1T1oJ2EIQad7hlOv",
		name: "Carroll Township - stormwater permit",
		kind: "PDF",
		size: "465 KB",
		municipality: "Carroll Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1T1oJ2EIQad7hlOvbt2mxcQsR3FlJPa4p/view",
		source: "drive"
	},
	{
		id: "drv-17culM2MPRpbrmzN",
		name: "Carroll Township - zoning permit",
		kind: "PDF",
		size: "327 KB",
		municipality: "Carroll Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/17culM2MPRpbrmzNbyCxRDw15PCmrA6ks/view",
		source: "drive"
	},
	{
		id: "drv-1ScVmck2alg6WkNa",
		name: "Carroll Township - Homeowners Guide to Stormwater BMP Maintenance",
		kind: "PDF",
		size: "5.8 MB",
		municipality: "Carroll Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1ScVmck2alg6WkNaH06x4uExG4Rm5sbMO/view",
		source: "drive"
	},
	{
		id: "drv-1TMKeYHCXMcmoCxM",
		name: "Carroll Township - MS4 Annual Presentation 2019",
		kind: "PDF",
		size: "1.4 MB",
		municipality: "Carroll Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1TMKeYHCXMcmoCxMpQume0CjzblUwhL3O/view",
		source: "drive"
	},
	{
		id: "drv-1OGoQmUGkl5GqNwx",
		name: "Dover Borough - Zoning Map",
		kind: "PDF",
		size: "478 KB",
		municipality: "Dover Borough",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1OGoQmUGkl5GqNwxMX1LX3ayZroMyI5Bo/view",
		source: "drive"
	},
	{
		id: "drv-1ugc5Y0buci5iGAI",
		name: "Dover Borough - Building Permit",
		kind: "PDF",
		size: "347 KB",
		municipality: "Dover Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1ugc5Y0buci5iGAIpf3HR8vTiqCu1z6_S/view",
		source: "drive"
	},
	{
		id: "drv-1T8FyYyUSbjDDgry",
		name: "Dover Borough - Stormwater Permit",
		kind: "PDF",
		size: "276 KB",
		municipality: "Dover Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1T8FyYyUSbjDDgrykVcUy0Y60K8pp3vay/view",
		source: "drive"
	},
	{
		id: "drv-1tMcZ1wpebBTMjpV",
		name: "Dover Borough - USE Certification Application",
		kind: "PDF",
		size: "503 KB",
		municipality: "Dover Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1tMcZ1wpebBTMjpVC2SPwsw0XBXac90AU/view",
		source: "drive"
	},
	{
		id: "off-048",
		name: "Dover Township Code of Ordinances (AmLegal)",
		kind: "WEB",
		size: "Online",
		municipality: "Dover Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://codelibrary.amlegal.com/codes/dovertwp/latest/overview",
		source: "official"
	},
	{
		id: "off-050",
		name: "Dover Township Ordinances & Regulations",
		kind: "WEB",
		size: "Online",
		municipality: "Dover Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.dovertownship.org/home/business/ordinances/",
		source: "official"
	},
	{
		id: "off-099",
		name: "Dover Township Zoning & Land Use",
		kind: "WEB",
		size: "Online",
		municipality: "Dover Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.dovertownship.org/home/departments/planning-development/zoning-land-use/",
		source: "official"
	},
	{
		id: "off-049",
		name: "Dover Township Zoning Amendment Ord. 2026-02",
		kind: "PDF",
		size: "PDF",
		municipality: "Dover Township",
		county: "York",
		category: "Zoning",
		updated: "Jun 22, 2026",
		url: "https://www.dovertownship.org/wp-content/uploads/2026/07/Ordinance-2026-02.pdf",
		source: "official"
	},
	{
		id: "off-081",
		name: "Dover Township Zoning Ordinance (AmLegal)",
		kind: "WEB",
		size: "Online",
		municipality: "Dover Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://codelibrary.amlegal.com/codes/dovertwp/latest/dovertwp_pa/0-0-0-6363",
		source: "official"
	},
	{
		id: "off-125",
		name: "Dover Township SALDO, Chapter 22 (AmLegal)",
		kind: "WEB",
		size: "Online",
		municipality: "Dover Township",
		county: "York",
		category: "SALDO",
		updated: "Mar 14, 2011",
		url: "https://codelibrary.amlegal.com/codes/dovertwp/latest/dovertwp_pa/0-0-0-3031",
		source: "official"
	},
	{
		id: "drv-1mrsWX9YluUW58tB",
		name: "Fairview Township - Comprehensive Plan Update 2024",
		kind: "PDF",
		size: "18 MB",
		municipality: "Fairview Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1mrsWX9YluUW58tBFE_T6Y56fB0OpCh2h/view",
		source: "drive"
	},
	{
		id: "drv-1td6c2qgjCEg1DOg",
		name: "Fairview Township - Ord. 2025-02 Township Zoning Map",
		kind: "PDF",
		size: "685 KB",
		municipality: "Fairview Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1td6c2qgjCEg1DOgqvxt6l-IyYCyMxhG5/view",
		source: "drive"
	},
	{
		id: "drv-1wfOZBV5wwrRjUQJ",
		name: "Fairview Township - Ord. 2025-1 Zoning Map Amendment – LOXAS LLC",
		kind: "PDF",
		size: "3.5 MB",
		municipality: "Fairview Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1wfOZBV5wwrRjUQJOSi8qMMagyXAoE-JE/view",
		source: "drive"
	},
	{
		id: "drv-1VwnRTRxit8G3qQB",
		name: "Fairview Township - Ord. 2025-2 Zoning Map Amendment – NIMA Partnership LLC",
		kind: "PDF",
		size: "810 KB",
		municipality: "Fairview Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1VwnRTRxit8G3qQB0xX2tWWCu9U78rbkI/view",
		source: "drive"
	},
	{
		id: "drv-11N1EGj8duB-7VEZ",
		name: "Fairview Township - Ord. 2025-3 Zoning Text Amendment – Data Centers",
		kind: "PDF",
		size: "1.8 MB",
		municipality: "Fairview Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/11N1EGj8duB-7VEZ4Xc9sJ_vote6IjD84/view",
		source: "drive"
	},
	{
		id: "off-128",
		name: "Fairview Township Data Center Zoning Text Amendment Ord. 2025-03",
		kind: "PDF",
		size: "PDF",
		municipality: "Fairview Township",
		county: "York",
		category: "Zoning",
		updated: "Dec 1, 2025",
		url: "https://twp.fairview.pa.us/wp-content/uploads/2025/12/Ord_-2025-03-Zoning-Text-Amendment-Data-Centers.pdf",
		source: "official"
	},
	{
		id: "off-127",
		name: "Fairview Township Zoning Map Amendment Ord. 2025-01 / 2025-02",
		kind: "PDF",
		size: "PDF",
		municipality: "Fairview Township",
		county: "York",
		category: "Zoning",
		updated: "Oct 1, 2025",
		url: "https://twp.fairview.pa.us/wp-content/uploads/2025/10/Revised-Zoning-Map-Ord-2025-01-and-2025-02.pdf",
		source: "official"
	},
	{
		id: "off-126",
		name: "Fairview Township Code of Ordinances (eCode360 FA2330)",
		kind: "WEB",
		size: "Online",
		municipality: "Fairview Township",
		county: "York",
		category: "SALDO",
		updated: "Jan 1, 2025",
		url: "https://ecode360.com/FA2330",
		source: "official"
	},
	{
		id: "drv-1WZP8o0GIGlovHka",
		name: "Fairview Township - Application to appear before the Zoning Hearing Board",
		kind: "PDF",
		size: "139 KB",
		municipality: "Fairview Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1WZP8o0GIGlovHka3lGhTXKpFmEPxFNKt/view",
		source: "drive"
	},
	{
		id: "drv-1-thpTJvEeVHEtQ8",
		name: "Fairview Township - Building Permit Application",
		kind: "PDF",
		size: "1.6 MB",
		municipality: "Fairview Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1-thpTJvEeVHEtQ8lT9Wsqec1nojQPxDL/view",
		source: "drive"
	},
	{
		id: "drv-1fq6UPvV6KPKNoLD",
		name: "Fairview Township - Electrical Permit Guide",
		kind: "PDF",
		size: "47 KB",
		municipality: "Fairview Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1fq6UPvV6KPKNoLDB8V43039Zg-n7K_Sx/view",
		source: "drive"
	},
	{
		id: "drv-14RnDxhH5JoWg4id",
		name: "Fairview Township - Instructions for Zoning Hearing Board Applicants",
		kind: "PDF",
		size: "226 KB",
		municipality: "Fairview Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/14RnDxhH5JoWg4idkd6d14Grwr7uw1JZx/view",
		source: "drive"
	},
	{
		id: "drv-1OVTla893iCZG4yp",
		name: "Fairview Township - Residential Construction Building Permit Guide",
		kind: "PDF",
		size: "172 KB",
		municipality: "Fairview Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1OVTla893iCZG4ypY4v8sGI_QNJR0057B/view",
		source: "drive"
	},
	{
		id: "drv-1ORqxs89mXKZRx-9",
		name: "Fairview Township - Subdivision and Land Development Plan Information Sheet",
		kind: "PDF",
		size: "46 KB",
		municipality: "Fairview Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1ORqxs89mXKZRx-9gffRepBWfzodAUOkv/view",
		source: "drive"
	},
	{
		id: "drv-1q3ERlqjy6QyWLjL",
		name: "Fairview Township - Workmen’s Compensation Insurance Form",
		kind: "PDF",
		size: "42 KB",
		municipality: "Fairview Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1q3ERlqjy6QyWLjL-MGTD53BhBIrES8RK/view",
		source: "drive"
	},
	{
		id: "drv-1SUFQfquJxhEC26K",
		name: "Fairview Township - Zoning Permit Application",
		kind: "PDF",
		size: "1.7 MB",
		municipality: "Fairview Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1SUFQfquJxhEC26K3YXZqtOW5ioL3k7xg/view",
		source: "drive"
	},
	{
		id: "drv-1n6c6slhaY83q9yW",
		name: "Fairview Township - Homeowners Guide to Stormwater",
		kind: "PDF",
		size: "3.5 MB",
		municipality: "Fairview Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1n6c6slhaY83q9yWEtTFKZkVAt9v-IXui/view",
		source: "drive"
	},
	{
		id: "drv-1GjYrc28RtlfqCAP",
		name: "Fairview Township - Key Lock Box Ordinance",
		kind: "PDF",
		size: "133 KB",
		municipality: "Fairview Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1GjYrc28RtlfqCAPtiEtCBeNtJBv5nJXT/view",
		source: "drive"
	},
	{
		id: "drv-1tpPr24PvRxZTFun",
		name: "Fairview Township - PCSM BMP Inspection Form",
		kind: "PDF",
		size: "149 KB",
		municipality: "Fairview Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1tpPr24PvRxZTFun4NZjz1PHjiSK4ZmTa/view",
		source: "drive"
	},
	{
		id: "drv-1s_pPBiAFCgRVzwx",
		name: "Fairview Township - Traffic Impact Fee Ordinance",
		kind: "PDF",
		size: "679 KB",
		municipality: "Fairview Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1s_pPBiAFCgRVzwx9znW8oLLCvvxv6LDw/view",
		source: "drive"
	},
	{
		id: "drv-17CgK419_mEej6Jf",
		name: "Franklin Township - Township Zoning Map",
		kind: "PDF",
		size: "4.2 MB",
		municipality: "Franklin Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/17CgK419_mEej6JfaTQwmcCp3FxVgA1ek/view",
		source: "drive"
	},
	{
		id: "drv-1Z0j2lWQllkKqmGJ",
		name: "Franklin Township - Zoning Ordinance Amendment 1-2008",
		kind: "PDF",
		size: "640 KB",
		municipality: "Franklin Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1Z0j2lWQllkKqmGJl6NBDQhFNcDjm9kvT/view",
		source: "drive"
	},
	{
		id: "drv-1tEA5TAvbaCCW7Nt",
		name: "Franklin Township - Zoning Ordinance Amendment 2-2007",
		kind: "PDF",
		size: "396 KB",
		municipality: "Franklin Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1tEA5TAvbaCCW7Nt4s0QTfpxMvs5WcOE5/view",
		source: "drive"
	},
	{
		id: "drv-1fj12uPhrsJmkm7d",
		name: "Franklin Township - Zoning Ordinance Amendment 2-2009",
		kind: "PDF",
		size: "2.3 MB",
		municipality: "Franklin Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1fj12uPhrsJmkm7d5HgCvZKfkPDr_d-gC/view",
		source: "drive"
	},
	{
		id: "drv-14zRwZhjyezes1qZ",
		name: "Franklin Township - Zoning Ordinance Amendment 5-2007",
		kind: "PDF",
		size: "152 KB",
		municipality: "Franklin Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/14zRwZhjyezes1qZ6FM6ABWxNjjs6ocLB/view",
		source: "drive"
	},
	{
		id: "drv-1dv7HuU6qM4EAuXc",
		name: "Franklin Township - Zoning Ordinance Amendment 7-2009",
		kind: "PDF",
		size: "140 KB",
		municipality: "Franklin Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1dv7HuU6qM4EAuXcb2cWHb-jUrZdQ4ikw/view",
		source: "drive"
	},
	{
		id: "drv-1ClrvM9ZrtAJG__3",
		name: "Franklin Township - Exhibit A Subdivision & Land Development Plan Procedure Chart",
		kind: "PDF",
		size: "486 KB",
		municipality: "Franklin Township",
		county: "York",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1ClrvM9ZrtAJG__3KpwW76DRuB3KD92hL/view",
		source: "drive"
	},
	{
		id: "drv-1uVW0BnX6FOTi8vx",
		name: "Franklin Township - Subdivision and Land Development Ordinance Amendment",
		kind: "PDF",
		size: "29 MB",
		municipality: "Franklin Township",
		county: "York",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1uVW0BnX6FOTi8vx50UM6CfpjzKi-LmAS/view",
		source: "drive"
	},
	{
		id: "drv-1ngCHMylQBTEWYA8",
		name: "Franklin Township - Subdivision and Land Development Procedures",
		kind: "PDF",
		size: "267 KB",
		municipality: "Franklin Township",
		county: "York",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1ngCHMylQBTEWYA8-g0gIGy1bP4mNPioO/view",
		source: "drive"
	},
	{
		id: "drv-19_nFLK3zntZFBng",
		name: "Franklin Township - Application for Zoning Board Hearing",
		kind: "PDF",
		size: "120 KB",
		municipality: "Franklin Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/19_nFLK3zntZFBngX4UGvU7WOJB8OvkGP/view",
		source: "drive"
	},
	{
		id: "drv-1wy2stdSlRd1VVjx",
		name: "Franklin Township - Application for Zoning Permit",
		kind: "PDF",
		size: "48 KB",
		municipality: "Franklin Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1wy2stdSlRd1VVjxfmtl8Mv00tu3lPVUT/view",
		source: "drive"
	},
	{
		id: "drv-1zg_D8dyLabUm_gE",
		name: "Franklin Township - Building Permit Application",
		kind: "PDF",
		size: "232 KB",
		municipality: "Franklin Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1zg_D8dyLabUm_gE6yaQbElMcc0H1l3dB/view",
		source: "drive"
	},
	{
		id: "drv-1Ne2Yhdg6de_HH9X",
		name: "Franklin Township - Conditional Use Application",
		kind: "PDF",
		size: "107 KB",
		municipality: "Franklin Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1Ne2Yhdg6de_HH9X2WxpLlZ0yU0icOKdP/view",
		source: "drive"
	},
	{
		id: "drv-1Hc1BjYoN-ZMV4jj",
		name: "Franklin Township - Driveway-Road Occupancy Permit May 2024",
		kind: "PDF",
		size: "659 KB",
		municipality: "Franklin Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1Hc1BjYoN-ZMV4jjbZ84nM06YE0Ao3TAA/view",
		source: "drive"
	},
	{
		id: "drv-1DLZ1mtSH1xEnc6n",
		name: "Franklin Township - Exhibit B Application for Subdivision & Land Development Plans",
		kind: "PDF",
		size: "450 KB",
		municipality: "Franklin Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1DLZ1mtSH1xEnc6nAplACAfQaQ0ctf_l9/view",
		source: "drive"
	},
	{
		id: "drv-1Sy6BDFkA0FTo-8_",
		name: "Franklin Township - Exhibit G Application for Consideration of a Modification or Waiver Request",
		kind: "PDF",
		size: "288 KB",
		municipality: "Franklin Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1Sy6BDFkA0FTo-8_aMyHAKy_bKRC0cNyh/view",
		source: "drive"
	},
	{
		id: "drv-1YvS16FhvixEwxPV",
		name: "Franklin Township - Storm Water Management Application",
		kind: "PDF",
		size: "60 KB",
		municipality: "Franklin Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1YvS16FhvixEwxPVzXi-yGaLjsvjlsEGc/view",
		source: "drive"
	},
	{
		id: "drv-18-75YcVJ9ajHfA0",
		name: "Franklin Township - Stormwater Management Permit and Schedule of Inspections",
		kind: "PDF",
		size: "545 KB",
		municipality: "Franklin Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/18-75YcVJ9ajHfA0vBhVATdY48IVdF43g/view",
		source: "drive"
	},
	{
		id: "drv-1mpH4fubzbniHq-a",
		name: "Franklin Township - Subdivision and Land Development Application",
		kind: "PDF",
		size: "450 KB",
		municipality: "Franklin Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1mpH4fubzbniHq-aqYrIRR7LcZx76AnYi/view",
		source: "drive"
	},
	{
		id: "drv-1zMvBBOS9ZHc796i",
		name: "Franklin Township - Zoning Hearing Application",
		kind: "PDF",
		size: "353 KB",
		municipality: "Franklin Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1zMvBBOS9ZHc796iSgy_Yp-TSVC5kzbP8/view",
		source: "drive"
	},
	{
		id: "drv-18eKOpArFD26RaeQ",
		name: "Franklin Township - Zoning Permit Application",
		kind: "DOCX",
		size: "19 KB",
		municipality: "Franklin Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/18eKOpArFD26RaeQzaCdmacc1XWME-zqA/view",
		source: "drive"
	},
	{
		id: "drv-1nBy2aHFh2dOMk2t",
		name: "Franklin Township - Stormwater Management Assistance Manual & Agreement",
		kind: "PDF",
		size: "3.7 MB",
		municipality: "Franklin Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1nBy2aHFh2dOMk2tIYaplFeFhph5szl5A/view",
		source: "drive"
	},
	{
		id: "drv-1eM36e9jOxINlO5J",
		name: "Hallam Borough - Zoning Map",
		kind: "PDF",
		size: "773 KB",
		municipality: "Hallam Borough",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1eM36e9jOxINlO5JFg-rYZpLOrABiaR3a/view",
		source: "drive"
	},
	{
		id: "off-010",
		name: "Hanover Borough Code of Ordinances",
		kind: "WEB",
		size: "Online",
		municipality: "Hanover Borough",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/14396460",
		source: "official"
	},
	{
		id: "off-114",
		name: "Hanover Borough Subdivision regulations (eCode360)",
		kind: "WEB",
		size: "Online",
		municipality: "Hanover Borough",
		county: "York",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/14396460",
		source: "official"
	},
	{
		id: "off-005",
		name: "Hellam Township Official Map, Chapter 58",
		kind: "WEB",
		size: "Online",
		municipality: "Hellam Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/9865349",
		source: "official"
	},
	{
		id: "off-017",
		name: "Hellam Township Zoning Ordinance Amendment 2025-01",
		kind: "PDF",
		size: "PDF",
		municipality: "Hellam Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2025",
		url: "https://ecode360.com/HE2351/laws/LF2674518.pdf",
		source: "official"
	},
	{
		id: "off-004",
		name: "Hellam Township Zoning Ordinance, Chapter 490",
		kind: "WEB",
		size: "Online",
		municipality: "Hellam Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2025",
		url: "https://ecode360.com/9980133",
		source: "official"
	},
	{
		id: "off-113",
		name: "Hellam Township Code — Subdivision chapters (eCode360 HE2351)",
		kind: "WEB",
		size: "Online",
		municipality: "Hellam Township",
		county: "York",
		category: "SALDO",
		updated: "Jan 1, 2025",
		url: "https://ecode360.com/HE2351",
		source: "official"
	},
	{
		id: "drv-1LoWDKgBDA-ojy1M",
		name: "Hopewell Township - DCCS – Zoning & Codes",
		kind: "PDF",
		size: "185 KB",
		municipality: "Hopewell Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1LoWDKgBDA-ojy1MiuExjTi-NB19HfMal/view",
		source: "drive"
	},
	{
		id: "drv-1ep2cufBWv1o_t6P",
		name: "Hopewell Township - Download Zoning Map",
		kind: "PDF",
		size: "1.4 MB",
		municipality: "Hopewell Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1ep2cufBWv1o_t6PVjzqj9khxmyoth3ph/view",
		source: "drive"
	},
	{
		id: "drv-1K93STpgNDF77SMh",
		name: "Hopewell Township - Construction and Materials Specifications for Subdivision and Land Development Manual",
		kind: "PDF",
		size: "1.2 MB",
		municipality: "Hopewell Township",
		county: "York",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1K93STpgNDF77SMhq7VN6hAK9_d6oOCJS/view",
		source: "drive"
	},
	{
		id: "drv-17aw2tPiC6YyYHlJ",
		name: "Hopewell Township - Subdivision and Land Development Ordinance Amendments",
		kind: "PDF",
		size: "262 KB",
		municipality: "Hopewell Township",
		county: "York",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/17aw2tPiC6YyYHlJ--tkX_Noiq29vcOVJ/view",
		source: "drive"
	},
	{
		id: "drv-1tWBpbA4s-ccUsdY",
		name: "Hopewell Township - Road Cut Permit Application",
		kind: "PDF",
		size: "5.3 MB",
		municipality: "Hopewell Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1tWBpbA4s-ccUsdYsvZkPngaWBNT5xsOj/view",
		source: "drive"
	},
	{
		id: "drv-1yAUEvsVinckJpG0",
		name: "Hopewell Township - Subdivision and Land Development Application",
		kind: "PDF",
		size: "2.0 MB",
		municipality: "Hopewell Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1yAUEvsVinckJpG00T_3b3s35Sah8YhmD/view",
		source: "drive"
	},
	{
		id: "drv-1lNofKxyrj7LKr44",
		name: "Hopewell Township - Subdivision and Land Development Plan Submission Procedures",
		kind: "PDF",
		size: "177 KB",
		municipality: "Hopewell Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1lNofKxyrj7LKr44DlKR6ii8rjV1Sho2I/view",
		source: "drive"
	},
	{
		id: "drv-1OC5I4xwGwRcc5Ox",
		name: "Hopewell Township - York County Planning Fees",
		kind: "PDF",
		size: "180 KB",
		municipality: "Hopewell Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1OC5I4xwGwRcc5Ox1u0MRAMt4uokQvIG3/view",
		source: "drive"
	},
	{
		id: "drv-1qvfr17H53Uivx2g",
		name: "Hopewell Township - Zoning Hearing Application",
		kind: "PDF",
		size: "286 KB",
		municipality: "Hopewell Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1qvfr17H53Uivx2gqIJQVORmG2oEL0rCQ/view",
		source: "drive"
	},
	{
		id: "drv-1E6dYHPFFUWJCmHo",
		name: "Hopewell Township - Ordinance #3-2013 On-Lot Sewage Inspection",
		kind: "PDF",
		size: "529 KB",
		municipality: "Hopewell Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1E6dYHPFFUWJCmHopiDCVEdWu4NhGvuAR/view",
		source: "drive"
	},
	{
		id: "off-011",
		name: "Jackson Township Code of Ordinances",
		kind: "WEB",
		size: "Online",
		municipality: "Jackson Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/JA1508",
		source: "official"
	},
	{
		id: "off-055",
		name: "Jackson Township Ordinances Portal",
		kind: "WEB",
		size: "Online",
		municipality: "Jackson Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://jacksontwpyork.org/ordinances",
		source: "official"
	},
	{
		id: "off-115",
		name: "Jackson Township SALDO (eCode360 JA1508)",
		kind: "WEB",
		size: "Online",
		municipality: "Jackson Township",
		county: "York",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/JA1508",
		source: "official"
	},
	{
		id: "drv-1s8xZ3CQ80O2Hx00",
		name: "Jacobus Borough - Building Permit Application – Commercial",
		kind: "PDF",
		size: "2.2 MB",
		municipality: "Jacobus Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1s8xZ3CQ80O2Hx00_rW5f_ayAHglBtIdy/view",
		source: "drive"
	},
	{
		id: "drv-15ClIsBKT3JNgT37",
		name: "Jacobus Borough - Building Permit Application – Residential",
		kind: "PDF",
		size: "66 KB",
		municipality: "Jacobus Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/15ClIsBKT3JNgT37Iey4HSr4Iri5mLXrO/view",
		source: "drive"
	},
	{
		id: "drv-11PW1Z58xTo5v6fc",
		name: "Jacobus Borough - Stormwater Permit Application - Commercial",
		kind: "PDF",
		size: "273 KB",
		municipality: "Jacobus Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/11PW1Z58xTo5v6fcl6U-LwHiMCTUtStUA/view",
		source: "drive"
	},
	{
		id: "drv-1JgHQU6g8o8EJA1K",
		name: "Jacobus Borough - Street Opening Permit Application Form",
		kind: "PDF",
		size: "262 KB",
		municipality: "Jacobus Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1JgHQU6g8o8EJA1Klfk9xRDh-tuo08nIU/view",
		source: "drive"
	},
	{
		id: "drv-1bZCvsh-ZvttyS4I",
		name: "Jacobus Borough - Use Permit Application",
		kind: "PDF",
		size: "50 KB",
		municipality: "Jacobus Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1bZCvsh-ZvttyS4IIxvc2TB49g0OqSUcQ/view",
		source: "drive"
	},
	{
		id: "drv-1BwD17HFrdjHSN_O",
		name: "Jacobus Borough - zoning hearing application",
		kind: "PDF",
		size: "470 KB",
		municipality: "Jacobus Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1BwD17HFrdjHSN_ONGoOHuZ3qg8OMx2tt/view",
		source: "drive"
	},
	{
		id: "drv-1OwqDy8oJrEpmVrt",
		name: "Jacobus Borough - zoning permit application",
		kind: "PDF",
		size: "357 KB",
		municipality: "Jacobus Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1OwqDy8oJrEpmVrtkNznvSwHo7i_A7G03/view",
		source: "drive"
	},
	{
		id: "drv-1k1q8BCgu0H8evH_",
		name: "Jefferson Borough - Zoning Map",
		kind: "PDF",
		size: "43 KB",
		municipality: "Jefferson Borough",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1k1q8BCgu0H8evH_3UHXM7vkKV1K9Q-Ej/view",
		source: "drive"
	},
	{
		id: "drv-1O-v6Dyzgi1XHunc",
		name: "Lewisberry Borough - Chapter 27 Zoning",
		kind: "PDF",
		size: "351 KB",
		municipality: "Lewisberry Borough",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1O-v6Dyzgi1XHunc7bus3ErCVMZb58Wp8/view",
		source: "drive"
	},
	{
		id: "drv-1XTBkjO1gY-BKUd9",
		name: "Lewisberry Borough - Zoning Map",
		kind: "PDF",
		size: "960 KB",
		municipality: "Lewisberry Borough",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1XTBkjO1gY-BKUd9pnrqqg8d2Fy9NLYkh/view",
		source: "drive"
	},
	{
		id: "drv-1_bNbpvHxhTN6ojF",
		name: "Lewisberry Borough - Chapter 22 Subdivision and Land Development",
		kind: "PDF",
		size: "88 KB",
		municipality: "Lewisberry Borough",
		county: "York",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1_bNbpvHxhTN6ojFiZ1_cD6tgGsO8eHAS/view",
		source: "drive"
	},
	{
		id: "drv-1goxENr6bQHnnKce",
		name: "Lewisberry Borough - Chapter 23 Stormwater Management",
		kind: "PDF",
		size: "780 KB",
		municipality: "Lewisberry Borough",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1goxENr6bQHnnKce9VtCsqrq44BIK576Z/view",
		source: "drive"
	},
	{
		id: "drv-1LNUMeOhRwXz7qTz",
		name: "Lewisberry Borough - Chapter 5 Code Enforcement",
		kind: "PDF",
		size: "77 KB",
		municipality: "Lewisberry Borough",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1LNUMeOhRwXz7qTz581HclTwJ-TLxajYw/view",
		source: "drive"
	},
	{
		id: "drv-1XPEpX7vl8iP5RMZ",
		name: "Lewisberry Borough - Chapter 8 Floodplains",
		kind: "PDF",
		size: "132 KB",
		municipality: "Lewisberry Borough",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1XPEpX7vl8iP5RMZKVQaFL3NPoierANWu/view",
		source: "drive"
	},
	{
		id: "drv-1y3AK8eqy4vDd7cP",
		name: "Lewisberry Borough - Ordinance 2020-02 International Property Maintenance Code 2018",
		kind: "PDF",
		size: "1.6 MB",
		municipality: "Lewisberry Borough",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1y3AK8eqy4vDd7cP4sjLbyYUa418A8LT1/view",
		source: "drive"
	},
	{
		id: "off-119",
		name: "Loganville Borough Zoning Ordinance",
		kind: "PDF",
		size: "PDF",
		municipality: "Loganville Borough",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://www.loganvillepa.us/pdfs/Zoning.pdf",
		source: "official"
	},
	{
		id: "off-118",
		name: "Loganville Borough Subdivision and Land Development Ordinance",
		kind: "PDF",
		size: "PDF",
		municipality: "Loganville Borough",
		county: "York",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://www.loganvillepa.us/pdfs/Sub_Divisions.pdf",
		source: "official"
	},
	{
		id: "off-121",
		name: "Loganville Borough Residential Zoning / Building Permit Application",
		kind: "PDF",
		size: "PDF",
		municipality: "Loganville Borough",
		county: "York",
		category: "Builder",
		updated: "Jan 1, 2024",
		url: "https://www.loganvillepa.us/pdfs/Zoning_App.pdf",
		source: "official"
	},
	{
		id: "off-120",
		name: "Loganville Borough Stormwater Management Ordinance",
		kind: "PDF",
		size: "PDF",
		municipality: "Loganville Borough",
		county: "York",
		category: "Codes",
		updated: "Jan 1, 2024",
		url: "https://www.loganvillepa.us/pdfs/Stormwater.pdf",
		source: "official"
	},
	{
		id: "drv-163LlufAbiSUP0HN",
		name: "Lower Chanceford Township - Data Center Ordinance Revisions 6_16_26",
		kind: "PDF",
		size: "13 MB",
		municipality: "Lower Chanceford Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/163LlufAbiSUP0HNFRrXN3N9UKnMyjKOf/view",
		source: "drive"
	},
	{
		id: "drv-1TvoWi7XmrwRIrdz",
		name: "Lower Chanceford Township - Zoning Ordinance",
		kind: "PDF",
		size: "461 KB",
		municipality: "Lower Chanceford Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1TvoWi7XmrwRIrdzN5aX_RZPMkIj3Sxo-/view",
		source: "drive"
	},
	{
		id: "drv-1CbHFsEyleLZgHjc",
		name: "Lower Chanceford Township - Zoning Ordinance Amendment",
		kind: "PDF",
		size: "60 KB",
		municipality: "Lower Chanceford Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1CbHFsEyleLZgHjc19IlA4SUQukPqM8bB/view",
		source: "drive"
	},
	{
		id: "drv-1aw1LoiAgxNNSC91",
		name: "Lower Chanceford Township - Zoning Ordinance Amendment - Fences and Walls",
		kind: "PDF",
		size: "44 KB",
		municipality: "Lower Chanceford Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1aw1LoiAgxNNSC91bhb3nE5pgkPDBVJVj/view",
		source: "drive"
	},
	{
		id: "drv-1xYanEuQJJRx-SPj",
		name: "Lower Chanceford Township - Building Permit",
		kind: "PDF",
		size: "1.6 MB",
		municipality: "Lower Chanceford Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1xYanEuQJJRx-SPjkXTgz4cd_KLP2pSQ5/view",
		source: "drive"
	},
	{
		id: "drv-1G09ohGcEzsClmD1",
		name: "Lower Chanceford Township - Building Permit Amendment 2022",
		kind: "PDF",
		size: "40 KB",
		municipality: "Lower Chanceford Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1G09ohGcEzsClmD1Vof-IeDOKTUNT-gwL/view",
		source: "drive"
	},
	{
		id: "drv-1qX5H7dkejfpyiHQ",
		name: "Lower Chanceford Township - Driveway Construction",
		kind: "PDF",
		size: "136 KB",
		municipality: "Lower Chanceford Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1qX5H7dkejfpyiHQkiqP19DnjQhiSaxHA/view",
		source: "drive"
	},
	{
		id: "drv-1_JIXv7O00qy44OU",
		name: "Lower Chanceford Township - Driveway Installation Permit",
		kind: "PDF",
		size: "48 KB",
		municipality: "Lower Chanceford Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1_JIXv7O00qy44OURJdujVAQ7cGbqpJr-/view",
		source: "drive"
	},
	{
		id: "drv-1KhiiM7u6ynyv1sg",
		name: "Lower Chanceford Township - Electrical Exemption for UCC Permit",
		kind: "PDF",
		size: "42 KB",
		municipality: "Lower Chanceford Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1KhiiM7u6ynyv1sgUZQSdau5-aBY07HFD/view",
		source: "drive"
	},
	{
		id: "drv-1iPCH8hONxc2Hw6P",
		name: "Lower Chanceford Township - General Building Permit",
		kind: "PDF",
		size: "902 KB",
		municipality: "Lower Chanceford Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1iPCH8hONxc2Hw6PAlvd9e8WHIPbEg_DL/view",
		source: "drive"
	},
	{
		id: "drv-1wJgFRgnNiUqiVTv",
		name: "Lower Chanceford Township - Uniform Construction Code Building Permit",
		kind: "PDF",
		size: "2.5 MB",
		municipality: "Lower Chanceford Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1wJgFRgnNiUqiVTvRPPOdP6ONSGyfbCC2/view",
		source: "drive"
	},
	{
		id: "drv-1cMB1U57muJ-pC60",
		name: "Lower Chanceford Township - Stormwater Management",
		kind: "PDF",
		size: "1.9 MB",
		municipality: "Lower Chanceford Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1cMB1U57muJ-pC60O42DsKgROzUvs3OEd/view",
		source: "drive"
	},
	{
		id: "drv-1Z8WhV_PjF83cPQq",
		name: "Lower Chanceford Township - Stormwater Management Amendment",
		kind: "PDF",
		size: "116 KB",
		municipality: "Lower Chanceford Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1Z8WhV_PjF83cPQqWEykpb4eamErxtOAv/view",
		source: "drive"
	},
	{
		id: "drv-1eJ0YO9sQtZcXefv",
		name: "Lower Windsor Township - 2023 Comprehensive Plan",
		kind: "PDF",
		size: "32 MB",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1eJ0YO9sQtZcXefvPnjBrKOFIC_sZopxR/view",
		source: "drive"
	},
	{
		id: "drv-1eUfdUz6HyYGXtMr",
		name: "Lower Windsor Township - Official Map",
		kind: "PDF",
		size: "2.3 MB",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1eUfdUz6HyYGXtMrRhiAOqB2FVLPuHeiv/view",
		source: "drive"
	},
	{
		id: "drv-1SKZtpBIp7xgAyIz",
		name: "Lower Windsor Township - Zoning Map",
		kind: "PDF",
		size: "3.2 MB",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1SKZtpBIp7xgAyIzJ655XqVnEXV6qt62C/view",
		source: "drive"
	},
	{
		id: "off-134",
		name: "Lower Windsor Township Code of Ordinances (eCode360 LO4166)",
		kind: "WEB",
		size: "Online",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/LO4166",
		source: "official"
	},
	{
		id: "drv-1eUZ2BOkexQ0Hids",
		name: "Lower Windsor Township - Commercial Building Permit Application and Plan Review",
		kind: "PDF",
		size: "95 KB",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1eUZ2BOkexQ0Hids2FLNLKjzQ41LTzayt/view",
		source: "drive"
	},
	{
		id: "drv-1FTuhTWofenpf7FQ",
		name: "Lower Windsor Township - Demolition Permit Application",
		kind: "PDF",
		size: "67 KB",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1FTuhTWofenpf7FQU25tvrYGfIGLvCLiD/view",
		source: "drive"
	},
	{
		id: "drv-1t1hMkm6qrfpkcSu",
		name: "Lower Windsor Township - Development Permit Application",
		kind: "PDF",
		size: "356 KB",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1t1hMkm6qrfpkcSufFO7pwx-jT1A-l95K/view",
		source: "drive"
	},
	{
		id: "drv-1T8ffuvw2Yv96Y3P",
		name: "Lower Windsor Township - Driveway Permit Application",
		kind: "PDF",
		size: "18 KB",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1T8ffuvw2Yv96Y3PVvlcrwTVemdL1TMlG/view",
		source: "drive"
	},
	{
		id: "drv-1vsfrTBQzZ44cT8_",
		name: "Lower Windsor Township - Driveway permit procedure",
		kind: "PDF",
		size: "63 KB",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1vsfrTBQzZ44cT8_0ybWLyjNCyP--CPkW/view",
		source: "drive"
	},
	{
		id: "drv-1u0k4mXe4W_KdXPb",
		name: "Lower Windsor Township - Floodplain Development Permit Application",
		kind: "PDF",
		size: "317 KB",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1u0k4mXe4W_KdXPbPRE_rxXQenJvSqJ9m/view",
		source: "drive"
	},
	{
		id: "drv-1shoivg1a-5a4LQ2",
		name: "Lower Windsor Township - Residential Building Permit Application",
		kind: "PDF",
		size: "357 KB",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1shoivg1a-5a4LQ2KwmSij67whKsh_ew2/view",
		source: "drive"
	},
	{
		id: "drv-1h889_yjQ4cVJRaI",
		name: "Lower Windsor Township - Subdivision and Land Development Application",
		kind: "PDF",
		size: "251 KB",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1h889_yjQ4cVJRaIw5brR6pvwZcARHmq-/view",
		source: "drive"
	},
	{
		id: "drv-15iHZcvnHHEctw5W",
		name: "Lower Windsor Township - Subdivision and Land Development Plan Time Extension Request",
		kind: "PDF",
		size: "16 KB",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/15iHZcvnHHEctw5WbZs-z27zsDWQd_5rP/view",
		source: "drive"
	},
	{
		id: "drv-1uwmHSIaHGFxCLfn",
		name: "Lower Windsor Township - Subdivision_Land Development Fee Schedule",
		kind: "PDF",
		size: "182 KB",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1uwmHSIaHGFxCLfne8pB6oab1QaLZjyIY/view",
		source: "drive"
	},
	{
		id: "drv-1xNneOIEnNuKLbhF",
		name: "Lower Windsor Township - Zoning Hearing Application",
		kind: "PDF",
		size: "34 KB",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1xNneOIEnNuKLbhFU9kSmt0pM3s9Zl9PQ/view",
		source: "drive"
	},
	{
		id: "drv-17ggG7vVll99SOth",
		name: "Lower Windsor Township - Zoning Hearing Application Instructions",
		kind: "PDF",
		size: "21 KB",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/17ggG7vVll99SOthExqe5cWNCsiNq80VF/view",
		source: "drive"
	},
	{
		id: "drv-139bw96Qla9piYif",
		name: "Lower Windsor Township - Zoning Permit Package",
		kind: "PDF",
		size: "447 KB",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/139bw96Qla9piYifCSS4KT1zoPCrzuAxe/view",
		source: "drive"
	},
	{
		id: "drv-1HDSBV_lT_oxNgXp",
		name: "Lower Windsor Township - Floodplain",
		kind: "PDF",
		size: "358 KB",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1HDSBV_lT_oxNgXpZ9qnCWSvrSen8fkE4/view",
		source: "drive"
	},
	{
		id: "drv-17A_ipxAQNcXB2NO",
		name: "Lower Windsor Township - Illicit Discharge Ordinance",
		kind: "PDF",
		size: "404 KB",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/17A_ipxAQNcXB2NOILpuiDlEfrA0PUUJI/view",
		source: "drive"
	},
	{
		id: "drv-1ePain7h0xokII1A",
		name: "Lower Windsor Township - Stormwater Management Small Projects Guide",
		kind: "PDF",
		size: "2.5 MB",
		municipality: "Lower Windsor Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1ePain7h0xokII1Aerqz2ec7vvBv1EICR/view",
		source: "drive"
	},
	{
		id: "drv-1xhG3HZO5ece3UdK",
		name: "Manchester Borough - Chapter 149 Zoning",
		kind: "PDF",
		size: "2.9 MB",
		municipality: "Manchester Borough",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1xhG3HZO5ece3UdK6g61bYeKtavFWcW-L/view",
		source: "drive"
	},
	{
		id: "drv-1exf0zCA0qlIuHgH",
		name: "Manchester Borough - Zoning Map",
		kind: "PDF",
		size: "1.5 MB",
		municipality: "Manchester Borough",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1exf0zCA0qlIuHgHUZ0Gzq_YkB1lyQf-O/view",
		source: "drive"
	},
	{
		id: "drv-1WCZNw63j7uMvpaM",
		name: "Manchester Borough - Code Chapter 125 Stormwater Mgmt",
		kind: "PDF",
		size: "5.0 MB",
		municipality: "Manchester Borough",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1WCZNw63j7uMvpaMgcslz26XJYLsO7_Tk/view",
		source: "drive"
	},
	{
		id: "off-042",
		name: "Manchester Township Code of Ordinances (eCode360 MA2383)",
		kind: "WEB",
		size: "Online",
		municipality: "Manchester Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/MA2383",
		source: "official"
	},
	{
		id: "off-045",
		name: "Manchester Township Planning / Zoning",
		kind: "WEB",
		size: "Online",
		municipality: "Manchester Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.mantwp.com/departments/planning-zoning/",
		source: "official"
	},
	{
		id: "off-044",
		name: "Manchester Township Zoning Map (2023)",
		kind: "PDF",
		size: "PDF",
		municipality: "Manchester Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2023",
		url: "https://www.mantwp.com/wp-content/uploads/2023-Zoning-Map.pdf",
		source: "official"
	},
	{
		id: "off-112",
		name: "Manchester Township SALDO (eCode360 MA2383)",
		kind: "WEB",
		size: "Online",
		municipality: "Manchester Township",
		county: "York",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/MA2383",
		source: "official"
	},
	{
		id: "off-083",
		name: "Manchester Township Zoning Hearing Application",
		kind: "PDF",
		size: "PDF",
		municipality: "Manchester Township",
		county: "York",
		category: "Builder",
		updated: "Jan 1, 2024",
		url: "https://www.mantwp.com/wp-content/uploads/ZHB-Application-2-11-1.pdf",
		source: "official"
	},
	{
		id: "off-043",
		name: "Manchester Township Stormwater Management Ordinance",
		kind: "WEB",
		size: "Online",
		municipality: "Manchester Township",
		county: "York",
		category: "Codes",
		updated: "Jan 1, 2012",
		url: "https://ecode360.com/30842774",
		source: "official"
	},
	{
		id: "drv-1c0f13XOdlPECgh1",
		name: "Manheim Township - Zoning Map",
		kind: "PDF",
		size: "1.0 MB",
		municipality: "Manheim Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1c0f13XOdlPECgh1UtqRAw_dghFs3ZMbP/view",
		source: "drive"
	},
	{
		id: "off-136",
		name: "Manheim Township (York) Code of Ordinances (eCode360 MA2385)",
		kind: "WEB",
		size: "Online",
		municipality: "Manheim Township",
		county: "York",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/MA2385",
		source: "official"
	},
	{
		id: "drv-1g9ntpNqUzEF577A",
		name: "Manheim Township - Construction Permit Instructions & Application",
		kind: "PDF",
		size: "780 KB",
		municipality: "Manheim Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1g9ntpNqUzEF577AGxTo2C58b1DFb6lzu/view",
		source: "drive"
	},
	{
		id: "drv-15s1-06pI_REn-7m",
		name: "Manheim Township - Requirements for a Construction Permit",
		kind: "PDF",
		size: "36 KB",
		municipality: "Manheim Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/15s1-06pI_REn-7mdYvul2fYud9HTstay/view",
		source: "drive"
	},
	{
		id: "drv-17NdFwDsm1ICq7Ih",
		name: "Manheim Township - Special Exception Application",
		kind: "PDF",
		size: "2.1 MB",
		municipality: "Manheim Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/17NdFwDsm1ICq7IhAQkWBVDIH805Xt2Ju/view",
		source: "drive"
	},
	{
		id: "drv-12JJoy0xSr8ry_Fd",
		name: "Manheim Township - Subdivision Land Development Application",
		kind: "PDF",
		size: "16 MB",
		municipality: "Manheim Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/12JJoy0xSr8ry_FdxddaSiB65p3T85V89/view",
		source: "drive"
	},
	{
		id: "drv-1KLHOpiecOkO7-Py",
		name: "Manheim Township - UCC Permit Exempt Residential Work",
		kind: "PDF",
		size: "82 KB",
		municipality: "Manheim Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1KLHOpiecOkO7-Py0aRwSTl2Io82fJ7uh/view",
		source: "drive"
	},
	{
		id: "drv-1hKdEzs8C7V8aTge",
		name: "Manheim Township - Variance Application",
		kind: "PDF",
		size: "2.1 MB",
		municipality: "Manheim Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1hKdEzs8C7V8aTgepGcvSiDQftuOFZToz/view",
		source: "drive"
	},
	{
		id: "drv-1FD3X1Kkxb84Z64W",
		name: "Manheim Township - Zoning & Construction Permit Instructions",
		kind: "PDF",
		size: "911 KB",
		municipality: "Manheim Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1FD3X1Kkxb84Z64WzhBaz49J64BGFfgi1/view",
		source: "drive"
	},
	{
		id: "drv-1vxfTA4o024Nx4nf",
		name: "Manheim Township - Zoning Permit Application",
		kind: "PDF",
		size: "308 KB",
		municipality: "Manheim Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1vxfTA4o024Nx4nfubJNa5BRDRMU_n3xF/view",
		source: "drive"
	},
	{
		id: "drv-18j6fnsa05fIIs92",
		name: "Manheim Township - Construction Code Information",
		kind: "PDF",
		size: "49 KB",
		municipality: "Manheim Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/18j6fnsa05fIIs92neFm9_UMarzAzIjKs/view",
		source: "drive"
	},
	{
		id: "drv-1aBPqFY6hF4qk_hL",
		name: "Monaghan Township - MS4 Stormwater",
		kind: "PDF",
		size: "1.4 MB",
		municipality: "Monaghan Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1aBPqFY6hF4qk_hLJfyRzAMuFC6VxbjMB/view",
		source: "drive"
	},
	{
		id: "drv-1x-U7IvwQARhvwV2",
		name: "Mount Wolf Borough - Zoning Map",
		kind: "PDF",
		size: "352 KB",
		municipality: "Mount Wolf Borough",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1x-U7IvwQARhvwV2mP3bCBTsSmrGg6qg0/view",
		source: "drive"
	},
	{
		id: "off-008",
		name: "New Freedom Borough Zoning, Chapter 225",
		kind: "WEB",
		size: "Online",
		municipality: "New Freedom Borough",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/14026810",
		source: "official"
	},
	{
		id: "off-009",
		name: "New Freedom Borough Subdivision and Land Development",
		kind: "WEB",
		size: "Online",
		municipality: "New Freedom Borough",
		county: "York",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/27253687",
		source: "official"
	},
	{
		id: "drv-1O6yGpQi-_5H-G5a",
		name: "New Freedom Borough - Commercial Building Permit Application",
		kind: "PDF",
		size: "54 KB",
		municipality: "New Freedom Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1O6yGpQi-_5H-G5a_GEB0zdkK9dbGOC7V/view",
		source: "drive"
	},
	{
		id: "drv-1--OIlmdzsIbLYYb",
		name: "New Freedom Borough - Driveway Permit",
		kind: "PDF",
		size: "25 KB",
		municipality: "New Freedom Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1--OIlmdzsIbLYYb1dUVNEJ4EERIfSxSG/view",
		source: "drive"
	},
	{
		id: "drv-1WvbNmOjaiBsbAzG",
		name: "New Freedom Borough - Fence Permit",
		kind: "PDF",
		size: "137 KB",
		municipality: "New Freedom Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1WvbNmOjaiBsbAzGW-58-XEMGweAArM03/view",
		source: "drive"
	},
	{
		id: "drv-1PMxFqSNIol9Advg",
		name: "New Freedom Borough - Permit Application Procedure",
		kind: "PDF",
		size: "21 KB",
		municipality: "New Freedom Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1PMxFqSNIol9AdvgpIyQa6rSBo_Ii8W21/view",
		source: "drive"
	},
	{
		id: "drv-12eaefQKbJpw1gk0",
		name: "New Freedom Borough - Residential Building Permit Application",
		kind: "PDF",
		size: "282 KB",
		municipality: "New Freedom Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/12eaefQKbJpw1gk0TU3NjQemDk-PQvxuH/view",
		source: "drive"
	},
	{
		id: "drv-1-0VLu9b8c5VeyYc",
		name: "New Freedom Borough - Zoning Permit",
		kind: "PDF",
		size: "252 KB",
		municipality: "New Freedom Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1-0VLu9b8c5VeyYcX-rsqyDlqSy3X6Zk6/view",
		source: "drive"
	},
	{
		id: "off-013",
		name: "New Salem Borough Planning Commission, Chapter 27",
		kind: "WEB",
		size: "Online",
		municipality: "New Salem Borough",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/7264772",
		source: "official"
	},
	{
		id: "off-046",
		name: "Newberry Township Code of Ordinances (eCode360 NE2598)",
		kind: "WEB",
		size: "Online",
		municipality: "Newberry Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/NE2598",
		source: "official"
	},
	{
		id: "off-047",
		name: "Newberry Township Ordinances",
		kind: "WEB",
		size: "Online",
		municipality: "Newberry Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://newberrytwp.com/ordinances",
		source: "official"
	},
	{
		id: "off-116",
		name: "Newberry Township SALDO (eCode360 NE2598)",
		kind: "WEB",
		size: "Online",
		municipality: "Newberry Township",
		county: "York",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/NE2598",
		source: "official"
	},
	{
		id: "drv-1-bOd54Tz6qxwJnf",
		name: "North Codorus Township - Official Map",
		kind: "PDF",
		size: "766 KB",
		municipality: "North Codorus Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1-bOd54Tz6qxwJnfiXErJkl5bUm_C9f86/view",
		source: "drive"
	},
	{
		id: "drv-170vZJqI-3pEXYRI",
		name: "North Codorus Township - Zoning Map 07-05-2022",
		kind: "PDF",
		size: "1.1 MB",
		municipality: "North Codorus Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/170vZJqI-3pEXYRIcFtbb91kFbF72EFtZ/view",
		source: "drive"
	},
	{
		id: "off-012",
		name: "North Codorus Township Code of Ordinances",
		kind: "WEB",
		size: "Online",
		municipality: "North Codorus Township",
		county: "York",
		category: "Zoning",
		updated: "Aug 21, 2012",
		url: "https://ecode360.com/27138634",
		source: "official"
	},
	{
		id: "off-137",
		name: "North Codorus Township Code of Ordinances (eCode360 NO1256)",
		kind: "WEB",
		size: "Online",
		municipality: "North Codorus Township",
		county: "York",
		category: "SALDO",
		updated: "Aug 21, 2012",
		url: "https://ecode360.com/NO1256",
		source: "official"
	},
	{
		id: "drv-1KlfSs_IiE7Mexzw",
		name: "Peach Bottom Township - Data Center Ordinance DRAFT",
		kind: "PDF",
		size: "209 KB",
		municipality: "Peach Bottom Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1KlfSs_IiE7MexzwXoYsGUtaQQAoSQ1aJ/view",
		source: "drive"
	},
	{
		id: "off-139",
		name: "Peach Bottom Township Zoning Map",
		kind: "PDF",
		size: "PDF",
		municipality: "Peach Bottom Township",
		county: "York",
		category: "Zoning",
		updated: "May 1, 2017",
		url: "https://peachbottomtownship.org/wp-content/uploads/2017/05/pbottz.pdf",
		source: "official"
	},
	{
		id: "off-138",
		name: "Peach Bottom Township Zoning Ordinance (2024)",
		kind: "PDF",
		size: "PDF",
		municipality: "Peach Bottom Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://www.peachbottomtownship.org/wp-content/uploads/2025/02/Peach-Bottom-Township-Zoning-Ordinance-2024.pdf",
		source: "official"
	},
	{
		id: "drv-1d62XbVWl5BBibSh",
		name: "Peach Bottom Township - What Type of work Requires What Permit",
		kind: "PDF",
		size: "84 KB",
		municipality: "Peach Bottom Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1d62XbVWl5BBibSheepkAxjzCk50MpQhO/view",
		source: "drive"
	},
	{
		id: "off-140",
		name: "Peach Bottom Township Zoning Permit / Use Certificate Application",
		kind: "PDF",
		size: "PDF",
		municipality: "Peach Bottom Township",
		county: "York",
		category: "Builder",
		updated: "Jul 1, 2025",
		url: "https://www.peachbottomtownship.org/wp-content/uploads/2025/07/PBTwp-Zoning-Permit-Application-2025.pdf",
		source: "official"
	},
	{
		id: "drv-1GVaJs6gj5P9h0rq",
		name: "Penn Township - Ord 562 Amended Township Zoning Map",
		kind: "PDF",
		size: "29 KB",
		municipality: "Penn Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1GVaJs6gj5P9h0rqwSlwvSsG8KrhdfBnZ/view",
		source: "drive"
	},
	{
		id: "drv-1cvjFMdTs6Ce-Qrp",
		name: "Penn Township - Zoning Map",
		kind: "PDF",
		size: "2.7 MB",
		municipality: "Penn Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1cvjFMdTs6Ce-QrpG4l0f5tmj12au2__v/view",
		source: "drive"
	},
	{
		id: "drv-1cQeC8gd3OIpR0Bq",
		name: "Penn Township - Zoning Ordinance",
		kind: "PDF",
		size: "1.4 MB",
		municipality: "Penn Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1cQeC8gd3OIpR0BqaLOqaBc_nobjzHMQf/view",
		source: "drive"
	},
	{
		id: "drv-16qxcG4AR1vBLYg6",
		name: "Penn Township - Subdivision & Land Development Ordinance",
		kind: "PDF",
		size: "3.9 MB",
		municipality: "Penn Township",
		county: "York",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/16qxcG4AR1vBLYg6X5W6G5tgSip1UPDcS/view",
		source: "drive"
	},
	{
		id: "drv-1XxHc-Nu67TV0d3z",
		name: "Penn Township - Building Permit",
		kind: "PDF",
		size: "849 KB",
		municipality: "Penn Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1XxHc-Nu67TV0d3zwDIDXsxD3ijxw3Etf/view",
		source: "drive"
	},
	{
		id: "drv-15pccDkfZdejuw3l",
		name: "Penn Township - NPDES Stormwater General Permit",
		kind: "PDF",
		size: "2.0 MB",
		municipality: "Penn Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/15pccDkfZdejuw3l85iUi8fKXmupCk8Ps/view",
		source: "drive"
	},
	{
		id: "drv-1Z1zk2U6xpdhEhGp",
		name: "Penn Township - Sign Permit",
		kind: "PDF",
		size: "89 KB",
		municipality: "Penn Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1Z1zk2U6xpdhEhGpKSeTzWTd1eJTusG8W/view",
		source: "drive"
	},
	{
		id: "drv-1ZzytYWxl5bME3_6",
		name: "Penn Township - Stormwater Permit",
		kind: "PDF",
		size: "1.8 MB",
		municipality: "Penn Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1ZzytYWxl5bME3_6cbxcBpdSaYO7iky6C/view",
		source: "drive"
	},
	{
		id: "drv-1H-31wn3DvUnMHGZ",
		name: "Penn Township - Street Opening Permit",
		kind: "PDF",
		size: "25 KB",
		municipality: "Penn Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1H-31wn3DvUnMHGZuUCDc9OXrvDRWSOul/view",
		source: "drive"
	},
	{
		id: "drv-10nxmywKEgTo4utp",
		name: "Penn Township - Subdivision and Land Development Plan Application",
		kind: "PDF",
		size: "9.8 KB",
		municipality: "Penn Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/10nxmywKEgTo4utpSwvSnj3KgtjvC_Jn1/view",
		source: "drive"
	},
	{
		id: "drv-1n3DJKaPv6tbl_33",
		name: "Penn Township - Zoning Hearing Application",
		kind: "PDF",
		size: "20 KB",
		municipality: "Penn Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1n3DJKaPv6tbl_33Ff3NrrB22jFD8yEva/view",
		source: "drive"
	},
	{
		id: "drv-1xoUQd4VDNQabAnb",
		name: "Penn Township - Post Constr. Stormwater Mgmt. Requirements",
		kind: "PDF",
		size: "332 KB",
		municipality: "Penn Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1xoUQd4VDNQabAnb4vadpQEQEzOpdE7hg/view",
		source: "drive"
	},
	{
		id: "drv-1g2C9H4J2KMTkt4M",
		name: "Penn Township - Stormwater Operations & Maintenance Agreement",
		kind: "PDF",
		size: "1.6 MB",
		municipality: "Penn Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1g2C9H4J2KMTkt4MrtLfnA6vf7dSpLRmo/view",
		source: "drive"
	},
	{
		id: "drv-1XPDosDSTAEp9T_u",
		name: "Penn Township - Stormwater Ordinance",
		kind: "PDF",
		size: "202 KB",
		municipality: "Penn Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1XPDosDSTAEp9T_ubQ7oht6Jr0HeGnZ7/view",
		source: "drive"
	},
	{
		id: "drv-1bzd1dQu_zlOqzT9",
		name: "Penn Township - Township Sign Ordinance",
		kind: "PDF",
		size: "19 MB",
		municipality: "Penn Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1bzd1dQu_zlOqzT9y0b5o6z8iVFxdj9L1/view",
		source: "drive"
	},
	{
		id: "off-078",
		name: "Pennsylvania Municipalities Planning Code (Act 247)",
		kind: "WEB",
		size: "Online",
		municipality: "Pennsylvania",
		county: "York",
		category: "SALDO",
		updated: "Jan 1, 2022",
		url: "https://dced.pa.gov/download/pennsylvania-municipalities-planning-code-act-247-of-1968/?wpdmdl=56205",
		source: "official"
	},
	{
		id: "off-077",
		name: "Pennsylvania Uniform Construction Code (UCC)",
		kind: "WEB",
		size: "Online",
		municipality: "Pennsylvania",
		county: "York",
		category: "Codes",
		updated: "Jan 1, 2026",
		url: "https://www.dli.pa.gov/Individuals/Labor-Management-Relations/ucc/Pages/default.aspx",
		source: "official"
	},
	{
		id: "drv-1LkW2vphL3aUfmZW",
		name: "Red Lion Borough - Homeowners Guide to Stormwater BMP Maintenance",
		kind: "PDF",
		size: "58 KB",
		municipality: "Red Lion Borough",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1LkW2vphL3aUfmZWSiWXAO6ebIh1pGO4e/view",
		source: "drive"
	},
	{
		id: "drv-1DPy9m49vAIvbdzq",
		name: "Red Lion Borough - Stormwater Ordinance",
		kind: "PDF",
		size: "408 KB",
		municipality: "Red Lion Borough",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1DPy9m49vAIvbdzqHEAn4Vj_POeKOZYy7/view",
		source: "drive"
	},
	{
		id: "drv-1eySfXqVg2lFl-S4",
		name: "Seven Valleys Borough - Chapter 130 - Zoning",
		kind: "PDF",
		size: "3.2 MB",
		municipality: "Seven Valleys Borough",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1eySfXqVg2lFl-S4yhxfaK8IJl31EmzdL/view",
		source: "drive"
	},
	{
		id: "drv-1t6Mg0hUQAqwa7yb",
		name: "Seven Valleys Borough - Zoning Map",
		kind: "PDF",
		size: "1.4 MB",
		municipality: "Seven Valleys Borough",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1t6Mg0hUQAqwa7ybwp884_m1nMf1yVcST/view",
		source: "drive"
	},
	{
		id: "drv-1nSRc_FF7Eciq8z8",
		name: "Seven Valleys Borough - zoning ordinance",
		kind: "PDF",
		size: "3.6 MB",
		municipality: "Seven Valleys Borough",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1nSRc_FF7Eciq8z8brSHqbVHJ3325YrV6/view",
		source: "drive"
	},
	{
		id: "drv-1yhvL-r0CCz-FFpE",
		name: "Seven Valleys Borough - Chapter 108 - Subdivision and Land Development",
		kind: "PDF",
		size: "4.1 MB",
		municipality: "Seven Valleys Borough",
		county: "York",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1yhvL-r0CCz-FFpE1LIhb-8vMlmx7OGEP/view",
		source: "drive"
	},
	{
		id: "drv-1BiBVB_fXOxEx_Fr",
		name: "Seven Valleys Borough - Building Permit Application - Commercial",
		kind: "PDF",
		size: "203 KB",
		municipality: "Seven Valleys Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1BiBVB_fXOxEx_Fryh_A_KBPV3SI-2ys5/view",
		source: "drive"
	},
	{
		id: "drv-1XR1cXgIvDTljptw",
		name: "Seven Valleys Borough - Building Permit Application - Residential",
		kind: "PDF",
		size: "784 KB",
		municipality: "Seven Valleys Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1XR1cXgIvDTljptw0Wtw1awL6kP91LOpX/view",
		source: "drive"
	},
	{
		id: "drv-1_W_2bi7p440W6WT",
		name: "Seven Valleys Borough - Chapter 48 - Building Permits and Floodplain Mgmt",
		kind: "PDF",
		size: "1.0 MB",
		municipality: "Seven Valleys Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1_W_2bi7p440W6WTHGc4NdX7Et5Dp8G_7/view",
		source: "drive"
	},
	{
		id: "drv-1f3T7fNPmviq4oGy",
		name: "Seven Valleys Borough - Land Subdivision Application",
		kind: "PDF",
		size: "450 KB",
		municipality: "Seven Valleys Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1f3T7fNPmviq4oGyGhockafFPGcegWP-Q/view",
		source: "drive"
	},
	{
		id: "drv-1SSXIYE7v_w_0V1f",
		name: "Seven Valleys Borough - Residential Construction Permit Fees",
		kind: "PDF",
		size: "2.2 MB",
		municipality: "Seven Valleys Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1SSXIYE7v_w_0V1fQOyWso8N3ljlhu1NG/view",
		source: "drive"
	},
	{
		id: "drv-1cyTA6HoAbYDU1jk",
		name: "Seven Valleys Borough - Sign Permit Application",
		kind: "PDF",
		size: "524 KB",
		municipality: "Seven Valleys Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1cyTA6HoAbYDU1jkMyutBnrAkSWENorY3/view",
		source: "drive"
	},
	{
		id: "drv-1iKqX7CZ11ncMF7u",
		name: "Seven Valleys Borough - Subdivision & Land Development Application",
		kind: "PDF",
		size: "508 KB",
		municipality: "Seven Valleys Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1iKqX7CZ11ncMF7uQgGrD0Q_5Q9dBanCs/view",
		source: "drive"
	},
	{
		id: "drv-1hEKaRiTef74poD9",
		name: "Seven Valleys Borough - Swimming Pool Permit Application",
		kind: "PDF",
		size: "617 KB",
		municipality: "Seven Valleys Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1hEKaRiTef74poD90sFq90IBDVXJBvxOl/view",
		source: "drive"
	},
	{
		id: "drv-1z2tnh96kZx2J-rd",
		name: "Seven Valleys Borough - Zoning Hearing Application",
		kind: "PDF",
		size: "330 KB",
		municipality: "Seven Valleys Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1z2tnh96kZx2J-rdEBM6-27px6TFJg34n/view",
		source: "drive"
	},
	{
		id: "drv-1m2N4Fn0NrygPK11",
		name: "Seven Valleys Borough - Zoning Hearing Application - Instructions",
		kind: "PDF",
		size: "449 KB",
		municipality: "Seven Valleys Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1m2N4Fn0NrygPK11ghC3ytkW3knzdgmr-/view",
		source: "drive"
	},
	{
		id: "drv-1cqOj6Ov9hO6HhCC",
		name: "Seven Valleys Borough - Zoning Permit Application",
		kind: "PDF",
		size: "26 KB",
		municipality: "Seven Valleys Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1cqOj6Ov9hO6HhCC8hJmYuQ9bZlEkyfJR/view",
		source: "drive"
	},
	{
		id: "drv-1Njtw54hFJhaUqCq",
		name: "Seven Valleys Borough - Borough Ordinances",
		kind: "PDF",
		size: "333 KB",
		municipality: "Seven Valleys Borough",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1Njtw54hFJhaUqCqzq4yAuMku7wCEoekO/view",
		source: "drive"
	},
	{
		id: "drv-1XYdwhljvEueUsUY",
		name: "Seven Valleys Borough - Chapter 101 - Stormwater Management",
		kind: "PDF",
		size: "2.1 MB",
		municipality: "Seven Valleys Borough",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1XYdwhljvEueUsUYUVMghqG0ttdEQ2dNJ/view",
		source: "drive"
	},
	{
		id: "drv-1zEtuzFCGbUFxeS6",
		name: "Seven Valleys Borough - Chapter 65 - Flood-Prone Areas Construction",
		kind: "PDF",
		size: "1.3 MB",
		municipality: "Seven Valleys Borough",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1zEtuzFCGbUFxeS6O9S3IhaIhn8b8oQF5/view",
		source: "drive"
	},
	{
		id: "drv-1srBVr0ta0g1i6sB",
		name: "Seven Valleys Borough - Pennsylvania Uniform Construction Code",
		kind: "PDF",
		size: "790 KB",
		municipality: "Seven Valleys Borough",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1srBVr0ta0g1i6sBSZfWZodt9Ctmvd3KK/view",
		source: "drive"
	},
	{
		id: "drv-1gA2iQtiRiD4pjBJ",
		name: "Shrewsbury Borough - 2023 Zoning Map",
		kind: "PDF",
		size: "671 KB",
		municipality: "Shrewsbury Borough",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1gA2iQtiRiD4pjBJUSrNlAF7sfZ0MEQy0/view",
		source: "drive"
	},
	{
		id: "drv-1wMG1_GGcGPUoNn_",
		name: "Shrewsbury Borough - Comprehensive Plan",
		kind: "PDF",
		size: "7.2 MB",
		municipality: "Shrewsbury Borough",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1wMG1_GGcGPUoNn_PQMZf___YISXPg8wv/view",
		source: "drive"
	},
	{
		id: "drv-1cmsWJima4a72vSV",
		name: "Shrewsbury Borough - Subdivision and Land Development Ordinance",
		kind: "PDF",
		size: "138 KB",
		municipality: "Shrewsbury Borough",
		county: "York",
		category: "SALDO",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1cmsWJima4a72vSVZp5tWwMrhs9nXF4FG/view",
		source: "drive"
	},
	{
		id: "drv-1iHj-Pmrut1RZYoD",
		name: "Shrewsbury Borough - APPLICATION FOR PLAN REVIEW – Commercial",
		kind: "PDF",
		size: "97 KB",
		municipality: "Shrewsbury Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1iHj-Pmrut1RZYoDGBWEsWGuDf6b40Fys/view",
		source: "drive"
	},
	{
		id: "drv-1x_cz_Vh8VdRP0Yd",
		name: "Shrewsbury Borough - Use Permit Form",
		kind: "PDF",
		size: "30 KB",
		municipality: "Shrewsbury Borough",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1x_cz_Vh8VdRP0YdUEDESaHx1lO2FFV5o/view",
		source: "drive"
	},
	{
		id: "drv-10aVeWp_eNSqHu-_",
		name: "Shrewsbury Township - Zoning Map",
		kind: "PDF",
		size: "1.3 MB",
		municipality: "Shrewsbury Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/10aVeWp_eNSqHu-_1twhnZhYamUfIz4Oq/view",
		source: "drive"
	},
	{
		id: "off-002",
		name: "Shrewsbury Township Zoning Ordinance, Chapter 27",
		kind: "WEB",
		size: "Online",
		municipality: "Shrewsbury Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/28606689",
		source: "official"
	},
	{
		id: "off-003",
		name: "Shrewsbury Township SALDO — Plan Requirements",
		kind: "WEB",
		size: "Online",
		municipality: "Shrewsbury Township",
		county: "York",
		category: "SALDO",
		updated: "Aug 4, 2010",
		url: "https://ecode360.com/33406657",
		source: "official"
	},
	{
		id: "drv-1_vvmJTb83NM46rd",
		name: "Shrewsbury Township - Application",
		kind: "PDF",
		size: "455 KB",
		municipality: "Shrewsbury Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1_vvmJTb83NM46rdUFRtYlmqcllpNnD3_/view",
		source: "drive"
	},
	{
		id: "drv-1Bzq7iXSzylg-AUF",
		name: "Shrewsbury Township - Commercial Application",
		kind: "PDF",
		size: "191 KB",
		municipality: "Shrewsbury Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1Bzq7iXSzylg-AUF2dYHG5bam3zyzrvYE/view",
		source: "drive"
	},
	{
		id: "drv-1sNC6nJNWrSZW0qD",
		name: "Shrewsbury Township - Residential Application",
		kind: "PDF",
		size: "203 KB",
		municipality: "Shrewsbury Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1sNC6nJNWrSZW0qDqGmzZTcroJ03BxG8U/view",
		source: "drive"
	},
	{
		id: "drv-11lbdt5VDv7J3hUy",
		name: "Shrewsbury Township - Zoning Hearing Board",
		kind: "PDF",
		size: "98 KB",
		municipality: "Shrewsbury Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/11lbdt5VDv7J3hUyOqWudlMVzYr05aJZD/view",
		source: "drive"
	},
	{
		id: "off-133",
		name: "Spring Garden / York City Joint Comprehensive Plan (Fall 2025)",
		kind: "PDF",
		size: "PDF",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Zoning",
		updated: "Oct 1, 2025",
		url: "https://www.springgardentwp.org/wp-content/uploads/Y-SG-Comp-Plan_Adopted-Fall-2025.pdf",
		source: "official"
	},
	{
		id: "drv-1cr2oDGa-aSXTUTD",
		name: "Spring Garden Township - 2025 Intermunicipal Comprehensive Plan",
		kind: "PDF",
		size: "12 MB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1cr2oDGa-aSXTUTDFlfL6dkME-w-AzX37/view",
		source: "drive"
	},
	{
		id: "drv-17xeZzoQr1Wgh7fa",
		name: "Spring Garden Township - Zoning Amendment – Rezoning or Text",
		kind: "PDF",
		size: "158 KB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/17xeZzoQr1Wgh7fa3H9pwdLE2-jclOi70/view",
		source: "drive"
	},
	{
		id: "drv-1ETh3dZLRaxZPrX9",
		name: "Spring Garden Township - Zoning Map",
		kind: "PDF",
		size: "1.2 MB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1ETh3dZLRaxZPrX93uRrKk600lmF87SR_/view",
		source: "drive"
	},
	{
		id: "off-132",
		name: "Spring Garden Township Zoning Ordinance (eCode360)",
		kind: "WEB",
		size: "Online",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/14756391",
		source: "official"
	},
	{
		id: "off-131",
		name: "Spring Garden Township Code of Ordinances (eCode360 SP2461)",
		kind: "WEB",
		size: "Online",
		municipality: "Spring Garden Township",
		county: "York",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/SP2461",
		source: "official"
	},
	{
		id: "drv-1OAwvdVNKQpyjTcc",
		name: "Spring Garden Township - Application for Hearing and Instructions",
		kind: "PDF",
		size: "251 KB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1OAwvdVNKQpyjTcc56jlq1khzcNje65UY/view",
		source: "drive"
	},
	{
		id: "drv-1UpIESLGU3tmhKv4",
		name: "Spring Garden Township - Application Submission Guidance",
		kind: "PDF",
		size: "111 KB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1UpIESLGU3tmhKv4LoMdYJwUQKpuDbHV_/view",
		source: "drive"
	},
	{
		id: "drv-1toJVwD3m4ju3ZX3",
		name: "Spring Garden Township - Building Permit Application",
		kind: "PDF",
		size: "821 KB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1toJVwD3m4ju3ZX3dV6QCrL95Z5zYbVPS/view",
		source: "drive"
	},
	{
		id: "drv-1iYzsFZRVRSXrcL5",
		name: "Spring Garden Township - Certificate of Use and Occupancy",
		kind: "PDF",
		size: "198 KB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1iYzsFZRVRSXrcL5X7UvakIMM9Tp5yuQa/view",
		source: "drive"
	},
	{
		id: "drv-1os3dSX25dWYhoPr",
		name: "Spring Garden Township - Plumbing Permit Application",
		kind: "PDF",
		size: "167 KB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1os3dSX25dWYhoPrZnRwuZyOczYbMv9K7/view",
		source: "drive"
	},
	{
		id: "drv-1rMFltOHA8bt7gs4",
		name: "Spring Garden Township - Residential Inspection Checklist",
		kind: "PDF",
		size: "1.1 MB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1rMFltOHA8bt7gs4mKbNe3ei_Gne8x3Mj/view",
		source: "drive"
	},
	{
		id: "drv-1CVEBBkJ7drM9KWC",
		name: "Spring Garden Township - Sewer Connection Permit Application",
		kind: "PDF",
		size: "514 KB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1CVEBBkJ7drM9KWCtV-XohEoOC7GAvtyO/view",
		source: "drive"
	},
	{
		id: "drv-1UIJQjOSqU1ZLGdY",
		name: "Spring Garden Township - Stormwater Management Application",
		kind: "PDF",
		size: "576 KB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1UIJQjOSqU1ZLGdYl7REcthhDcFWB5VI0/view",
		source: "drive"
	},
	{
		id: "drv-1Wo8OM9okIk8nb4Y",
		name: "Spring Garden Township - Stormwater Management Permit Application",
		kind: "PDF",
		size: "567 KB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1Wo8OM9okIk8nb4Y08C64XVQuDU6P07Rh/view",
		source: "drive"
	},
	{
		id: "drv-16MnasqG1R0Yj8hJ",
		name: "Spring Garden Township - Street Opening Permit Application",
		kind: "PDF",
		size: "259 KB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/16MnasqG1R0Yj8hJPLBeXJ0FTLP2T1UxH/view",
		source: "drive"
	},
	{
		id: "drv-1UR1jsqAgf--Tr6l",
		name: "Spring Garden Township - Subdivision and Land Development Application & Checklist",
		kind: "PDF",
		size: "365 KB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1UR1jsqAgf--Tr6leqBs47WTl7FaslmlH/view",
		source: "drive"
	},
	{
		id: "drv-1wRIwPQyNTTVcsio",
		name: "Spring Garden Township - Subdivision and Land Development Application Submission Guidelines",
		kind: "PDF",
		size: "133 KB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1wRIwPQyNTTVcsioOhvhqraDRNHLv1X83/view",
		source: "drive"
	},
	{
		id: "drv-1Ae3ddAGET_oBRYm",
		name: "Spring Garden Township - Use and Occupancy Certificate",
		kind: "PDF",
		size: "194 KB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1Ae3ddAGET_oBRYmVtK6otp772tu44Rdl/view",
		source: "drive"
	},
	{
		id: "drv-1K7cqO9l03DMpW0t",
		name: "Spring Garden Township - Zoning Hearing Application",
		kind: "PDF",
		size: "251 KB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1K7cqO9l03DMpW0tv--kSbl17Q8ZKAccR/view",
		source: "drive"
	},
	{
		id: "drv-1Utx1hFJwnqpgxe3",
		name: "Spring Garden Township - ZONING PERMIT APPLICATION",
		kind: "PDF",
		size: "812 KB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1Utx1hFJwnqpgxe3PMfTX7RBig49QxdBz/view",
		source: "drive"
	},
	{
		id: "drv-11RldMok272vPYq7",
		name: "Spring Garden Township - Soil Erosion and Sediment Pollution Control Measures",
		kind: "PDF",
		size: "284 KB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/11RldMok272vPYq7k--R7REi3GdpiHdXD/view",
		source: "drive"
	},
	{
		id: "drv-1_vxatudw_0mSnwj",
		name: "Spring Garden Township - Stormwater Homeowner’s Guide",
		kind: "PDF",
		size: "3.5 MB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1_vxatudw_0mSnwjZqaHdaE25Sg90sDCj/view",
		source: "drive"
	},
	{
		id: "drv-1T_Q2mYlDnBUiQXX",
		name: "Spring Garden Township - Stormwater Management Ordinance",
		kind: "PDF",
		size: "3.8 MB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1T_Q2mYlDnBUiQXXoKJkd5_r7LB8lBAi1/view",
		source: "drive"
	},
	{
		id: "drv-1fbUVkkHyhvbIXSc",
		name: "Spring Garden Township - Stormwater Operations and Maintenance Right of Way Agreement",
		kind: "PDF",
		size: "132 KB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1fbUVkkHyhvbIXScImHKbu5CaBDOdAD2A/view",
		source: "drive"
	},
	{
		id: "drv-1VA6Nh21BneX_rGs",
		name: "Spring Garden Township - Stormwater Small Projects Guide",
		kind: "PDF",
		size: "1.2 MB",
		municipality: "Spring Garden Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1VA6Nh21BneX_rGslHpiNuVabV7ram2Zq/view",
		source: "drive"
	},
	{
		id: "drv-1h2qiE2MnNnRnp4o",
		name: "Spring Grove Borough - ZONING MAP",
		kind: "PDF",
		size: "1.2 MB",
		municipality: "Spring Grove Borough",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1h2qiE2MnNnRnp4oVu8V1xqzVHdK5r9NK/view",
		source: "drive"
	},
	{
		id: "off-080",
		name: "Springettsbury Township Code of Ordinances (eCode360 SP2128)",
		kind: "WEB",
		size: "Online",
		municipality: "Springettsbury Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://ecode360.com/SP2128",
		source: "official"
	},
	{
		id: "off-100",
		name: "Springettsbury Township Zoning Administration",
		kind: "WEB",
		size: "Online",
		municipality: "Springettsbury Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://springettsbury.com/construction/community-development/zoning/",
		source: "official"
	},
	{
		id: "off-006",
		name: "Springettsbury Township Zoning, Chapter 325",
		kind: "WEB",
		size: "Online",
		municipality: "Springettsbury Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/5176819",
		source: "official"
	},
	{
		id: "off-007",
		name: "Springettsbury Township SALDO, Chapter 289",
		kind: "WEB",
		size: "Online",
		municipality: "Springettsbury Township",
		county: "York",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/5175442",
		source: "official"
	},
	{
		id: "drv-1T-DFAuJt98_QylJ",
		name: "Springfield Township - Zoning Map",
		kind: "PDF",
		size: "1.1 MB",
		municipality: "Springfield Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1T-DFAuJt98_QylJU3Aq5FfvobAGpTdI_/view",
		source: "drive"
	},
	{
		id: "drv-1uUpJUNwr8emfj7j",
		name: "Springfield Township - Interpretation Appeal Hearing",
		kind: "PDF",
		size: "24 KB",
		municipality: "Springfield Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1uUpJUNwr8emfj7jSmBHgLpvKxquUC5Db/view",
		source: "drive"
	},
	{
		id: "drv-1Im12xfEREw855Li",
		name: "Springfield Township - Land Use Permit Checklist",
		kind: "PDF",
		size: "198 KB",
		municipality: "Springfield Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1Im12xfEREw855LioLNM16yH5FDArJ6r2/view",
		source: "drive"
	},
	{
		id: "drv-102JYypLYmv8ShJh",
		name: "Springfield Township - PMCA Commercial Building Permit Application",
		kind: "PDF",
		size: "405 KB",
		municipality: "Springfield Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/102JYypLYmv8ShJhQHCu7l8pQAV7Kivjn/view",
		source: "drive"
	},
	{
		id: "drv-1jZOhRDAFl2i0HON",
		name: "Springfield Township - PMCA Demolition Permit Application",
		kind: "PDF",
		size: "1.2 MB",
		municipality: "Springfield Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1jZOhRDAFl2i0HON1a4z637nsHm6R1CWb/view",
		source: "drive"
	},
	{
		id: "drv-18quFMVokm4T5boK",
		name: "Springfield Township - PMCA New Manufactured Dwelling Permit Application",
		kind: "PDF",
		size: "2.8 MB",
		municipality: "Springfield Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/18quFMVokm4T5boKUDf5uIxcCgHKHNsYY/view",
		source: "drive"
	},
	{
		id: "drv-1_w5VepzPgQkv4D_",
		name: "Springfield Township - PMCA Pole Building Permit Application",
		kind: "PDF",
		size: "1.7 MB",
		municipality: "Springfield Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1_w5VepzPgQkv4D_a6pgjnww9kOWGeFOg/view",
		source: "drive"
	},
	{
		id: "drv-12hvlJ4HNQboXBtN",
		name: "Springfield Township - PMCA Request for Determination for Change of Occupancy",
		kind: "PDF",
		size: "2.0 MB",
		municipality: "Springfield Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/12hvlJ4HNQboXBtNWwdLe8av-lN-tBwzC/view",
		source: "drive"
	},
	{
		id: "drv-1BQBuh2z32L5lj6V",
		name: "Springfield Township - PMCA Residential Deck Permit Application",
		kind: "PDF",
		size: "3.8 MB",
		municipality: "Springfield Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1BQBuh2z32L5lj6Vq1Ra12qjtBbmOuYgL/view",
		source: "drive"
	},
	{
		id: "drv-1-Y7Wo942n_AR5Ng",
		name: "Springfield Township - PMCA Residential Permit Application – New Build",
		kind: "PDF",
		size: "3.7 MB",
		municipality: "Springfield Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1-Y7Wo942n_AR5Ng8hjTvylRd6Bm5_7qJ/view",
		source: "drive"
	},
	{
		id: "drv-1ukd2o_a5Gx7KYQQ",
		name: "Springfield Township - PMCA Residential Porch Roof Permit Application",
		kind: "PDF",
		size: "3.7 MB",
		municipality: "Springfield Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1ukd2o_a5Gx7KYQQd92IIBGX1hxYBIihi/view",
		source: "drive"
	},
	{
		id: "drv-1TDxfNG80i-2f0EB",
		name: "Springfield Township - PMCA Residential Re-Roof Permit Application",
		kind: "PDF",
		size: "3.7 MB",
		municipality: "Springfield Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1TDxfNG80i-2f0EBCEr7QvN_k2eTVO2hY/view",
		source: "drive"
	},
	{
		id: "drv-19k0vqZxx8JGXkBB",
		name: "Springfield Township - PMCA Residential Solar Panel Permit Application",
		kind: "PDF",
		size: "3.8 MB",
		municipality: "Springfield Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/19k0vqZxx8JGXkBB-xQuAUmLHzX9J4tB2/view",
		source: "drive"
	},
	{
		id: "drv-1XrDuAbKzZfVev2m",
		name: "Springfield Township - PMCA Residential Swimming Pool_Spa Permit Application",
		kind: "PDF",
		size: "3.8 MB",
		municipality: "Springfield Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1XrDuAbKzZfVev2mX6DAhLrNjU8H3Yv-O/view",
		source: "drive"
	},
	{
		id: "drv-1T6C_yHgkJDiujs-",
		name: "Springfield Township - PMCA Sign Permit Application",
		kind: "PDF",
		size: "1.4 MB",
		municipality: "Springfield Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1T6C_yHgkJDiujs-vWMefLD9XprMubc4t/view",
		source: "drive"
	},
	{
		id: "drv-1LGEYqo2bUj54hRu",
		name: "Springfield Township - Prior to Applying for a Building Permit",
		kind: "PDF",
		size: "63 KB",
		municipality: "Springfield Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1LGEYqo2bUj54hRucabKsuCwMabvBjtpu/view",
		source: "drive"
	},
	{
		id: "drv-1DKnOSWhAwm7jNHe",
		name: "Springfield Township - Special Exception Hearing",
		kind: "PDF",
		size: "33 KB",
		municipality: "Springfield Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1DKnOSWhAwm7jNHe9FYO7bDR3PIFlUTtv/view",
		source: "drive"
	},
	{
		id: "drv-103_RcYdZkfenx-x",
		name: "Springfield Township - Springfield Permit Application",
		kind: "PDF",
		size: "104 KB",
		municipality: "Springfield Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/103_RcYdZkfenx-xoaFyh2-ijPdFsSQDQ/view",
		source: "drive"
	},
	{
		id: "drv-1bX1Yf8sU4YP4bPK",
		name: "Springfield Township - Variance Appeal Hearing",
		kind: "PDF",
		size: "35 KB",
		municipality: "Springfield Township",
		county: "York",
		category: "Builder",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1bX1Yf8sU4YP4bPKK4CPQi3W23lomQ-dj/view",
		source: "drive"
	},
	{
		id: "drv-1ffb_1Bf2tQpExOf",
		name: "Springfield Township - The Homeowners Guide to Stormwater Management",
		kind: "PDF",
		size: "3.5 MB",
		municipality: "Springfield Township",
		county: "York",
		category: "Codes",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1ffb_1Bf2tQpExOfgzcEX6T51ZZE6y_og/view",
		source: "drive"
	},
	{
		id: "drv-1PVOrWpK8x502mcA",
		name: "Stewartstown Borough - AMENDING THE ZONING ORDINANCE FOR MULTI-FAMILY CONVERSION, 2024-01",
		kind: "PDF",
		size: "4.0 MB",
		municipality: "Stewartstown Borough",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1PVOrWpK8x502mcABplDxjp7zOsa6gbdm/view",
		source: "drive"
	},
	{
		id: "drv-1D4Z6LhQND5xUEPM",
		name: "Stewartstown Borough - AMENDMENT TO THE ZONING ORDINANCE, 2010-02",
		kind: "PDF",
		size: "1.9 MB",
		municipality: "Stewartstown Borough",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1D4Z6LhQND5xUEPMHsu4hreyL7gFM6hgv/view",
		source: "drive"
	},
	{
		id: "drv-1URU9slCqCU369Ib",
		name: "Stewartstown Borough - ZONING ORDINANCE",
		kind: "PDF",
		size: "26 MB",
		municipality: "Stewartstown Borough",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1URU9slCqCU369IbRA2UdANbaHBFRibrL/view",
		source: "drive"
	},
	{
		id: "off-141",
		name: "Stewartstown Borough Codes, Enforcement & Zoning",
		kind: "WEB",
		size: "Online",
		municipality: "Stewartstown Borough",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.stewartstown.org/codes-enforcement-zoning/",
		source: "official"
	},
	{
		id: "off-142",
		name: "Stewartstown Borough Zoning Ordinance Amendment 2024-01",
		kind: "PDF",
		size: "PDF",
		municipality: "Stewartstown Borough",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://www.stewartstown.org/pdf/docs/Ordinance_2024-01_Amending_the_Zoning_Ordinance_for_Multi-Family_Conversion_.pdf",
		source: "official"
	},
	{
		id: "drv-1DolZw6Z8gLOMgcY",
		name: "Warrington Township - Warrington Zoning Ordinance (2-13-25 Amendment)",
		kind: "PDF",
		size: "751 KB",
		municipality: "Warrington Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1DolZw6Z8gLOMgcYDJApxOjoVdjUVbNXO/view",
		source: "drive"
	},
	{
		id: "drv-1NSf2iCFhuFb8iUW",
		name: "Warrington Township - Warrington Zoning Ordinance (4-11-24 Amendment)",
		kind: "PDF",
		size: "817 KB",
		municipality: "Warrington Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1NSf2iCFhuFb8iUW6ELPOZAsRNRS0oyd_/view",
		source: "drive"
	},
	{
		id: "drv-1rJ0-BppYfa9owrb",
		name: "Warrington Township - Warrington Zoning Ordinance (7-10-25 Amendment)",
		kind: "PDF",
		size: "811 KB",
		municipality: "Warrington Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1rJ0-BppYfa9owrbQa1IAWaPdpB-opoLt/view",
		source: "drive"
	},
	{
		id: "drv-1vZxqsMi2TBkj377",
		name: "Warrington Township - Warrington Zoning Ordinance (Amended 3-16-22) Redline",
		kind: "PDF",
		size: "3.1 MB",
		municipality: "Warrington Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1vZxqsMi2TBkj377ctZZWsrjAfhWid4h6/view",
		source: "drive"
	},
	{
		id: "drv-1104cl6eF9aw4Ue5",
		name: "Warrington Township - ZONING MAP",
		kind: "PDF",
		size: "633 KB",
		municipality: "Warrington Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1104cl6eF9aw4Ue5t2FFb13Z8D99gJTZX/view",
		source: "drive"
	},
	{
		id: "drv-13dWqJPdf9OAFU-P",
		name: "Warrington Township - Warrington SALDO (4-11-24 Amendment) Final Signed",
		kind: "PDF",
		size: "129 KB",
		municipality: "Warrington Township",
		county: "York",
		category: "SALDO",
		updated: "Aug 4, 2026",
		url: "https://drive.google.com/file/d/13dWqJPdf9OAFU-PVooaElFIvhBd5GAq-/view",
		source: "drive"
	},
	{
		id: "drv-10kFUnBEFgbRAOBm",
		name: "Warrington Township - Warrington Township SALDO (Amended 9-21-22) Redline",
		kind: "PDF",
		size: "2.2 MB",
		municipality: "Warrington Township",
		county: "York",
		category: "SALDO",
		updated: "Aug 4, 2026",
		url: "https://drive.google.com/file/d/10kFUnBEFgbRAOBmkcWn0HiJKgue8vxxa/view",
		source: "drive"
	},
	{
		id: "drv-1F3POtBNougFpgkI",
		name: "Washington Township - Zoning Ordinance",
		kind: "PDF",
		size: "8.5 MB",
		municipality: "Washington Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1F3POtBNougFpgkIrTPfJCXAwectYLtnQ/view",
		source: "drive"
	},
	{
		id: "drv-14wFTgtA0kO6C0ZA",
		name: "Washington Township - SALDO",
		kind: "PDF",
		size: "4.7 MB",
		municipality: "Washington Township",
		county: "York",
		category: "SALDO",
		updated: "Aug 4, 2026",
		url: "https://drive.google.com/file/d/14wFTgtA0kO6C0ZAf2cDNHtKEaL0zdLfE/view",
		source: "drive"
	},
	{
		id: "off-016",
		name: "West Manchester Township Zoning Map Amendment Ord. 2024-06",
		kind: "PDF",
		size: "PDF",
		municipality: "West Manchester Township",
		county: "York",
		category: "Zoning",
		updated: "Jun 1, 2024",
		url: "https://ecode360.com/WE1311/laws/LF2160651.pdf",
		source: "official"
	},
	{
		id: "off-001",
		name: "West Manchester Township Zoning Ordinance (eCode360)",
		kind: "WEB",
		size: "Online",
		municipality: "West Manchester Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/WE1311",
		source: "official"
	},
	{
		id: "off-082",
		name: "West Manchester Township Zoning Ordinance (eCode360)",
		kind: "WEB",
		size: "Online",
		municipality: "West Manchester Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/15443121",
		source: "official"
	},
	{
		id: "off-052",
		name: "West Manchester Township SALDO (eCode360)",
		kind: "WEB",
		size: "Online",
		municipality: "West Manchester Township",
		county: "York",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/WE1311",
		source: "official"
	},
	{
		id: "off-051",
		name: "West Manchester Township Zoning & Codes Department",
		kind: "WEB",
		size: "Online",
		municipality: "West Manchester Township",
		county: "York",
		category: "Codes",
		updated: "Jan 1, 2026",
		url: "https://www.westmanchestertownship.com/departments/zoning-codes/",
		source: "official"
	},
	{
		id: "drv-1KUhQy9i4a4Ywvj4",
		name: "West Manheim Township - Zoning Map 2023-03-31",
		kind: "PDF",
		size: "930 KB",
		municipality: "West Manheim Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1KUhQy9i4a4Ywvj4iaZUUtb59dsWJb8sN/view",
		source: "drive"
	},
	{
		id: "off-135",
		name: "West Manheim Township Code of Ordinances (eCode360 WE3200)",
		kind: "WEB",
		size: "Online",
		municipality: "West Manheim Township",
		county: "York",
		category: "SALDO",
		updated: "Jan 1, 2024",
		url: "https://ecode360.com/WE3200",
		source: "official"
	},
	{
		id: "drv-13BVPzmo6wrG5iqq",
		name: "Windsor Township - Windsor Township Zoning Ordinance",
		kind: "PDF",
		size: "8.6 MB",
		municipality: "Windsor Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/13BVPzmo6wrG5iqq4bZoC1MVQe_QWadX0/view",
		source: "drive"
	},
	{
		id: "drv-1FDtqZ8TuKO_HuEo",
		name: "Windsor Township - Zoning Map",
		kind: "PDF",
		size: "1.2 MB",
		municipality: "Windsor Township",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1FDtqZ8TuKO_HuEoT5iFwu8x-PKppoP15/view",
		source: "drive"
	},
	{
		id: "off-129",
		name: "Windsor Township SALDO (September 21, 2015)",
		kind: "PDF",
		size: "PDF",
		municipality: "Windsor Township",
		county: "York",
		category: "SALDO",
		updated: "Sep 21, 2015",
		url: "https://www.windsortwp.com/wp-content/uploads/Subdivision-and-Land-Development-Ordinance-9212015.pdf",
		source: "official"
	},
	{
		id: "off-130",
		name: "Windsor Township Stormwater Management Ordinance",
		kind: "PDF",
		size: "PDF",
		municipality: "Windsor Township",
		county: "York",
		category: "Codes",
		updated: "Jan 1, 2024",
		url: "https://windsortwp.com/wp-content/uploads/StormwaterManagementOrdinance-2B.pdf",
		source: "official"
	},
	{
		id: "drv-1oU8UREzU-t-72Zs",
		name: "York City - Planning & Zoning Code",
		kind: "PDF",
		size: "2.5 MB",
		municipality: "York City",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1oU8UREzU-t-72Zs5jgiwWihiW5bZz6bI/view",
		source: "drive"
	},
	{
		id: "drv-1XPyO1yiFm2VLRBv",
		name: "York City - Zoning Map",
		kind: "PDF",
		size: "1.3 MB",
		municipality: "York City",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1XPyO1yiFm2VLRBvF-0LYOoiUomOxiB3r/view",
		source: "drive"
	},
	{
		id: "off-053",
		name: "York City Codified Ordinances — Planning & Zoning",
		kind: "WEB",
		size: "Online",
		municipality: "York City",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.yorkcity.org/government/authorities-boards-and-commissions/codified-ordinances/",
		source: "official"
	},
	{
		id: "off-054",
		name: "York City Zoning Hearing Board, Article 191",
		kind: "PDF",
		size: "PDF",
		municipality: "York City",
		county: "York",
		category: "Zoning",
		updated: "Apr 1, 2017",
		url: "https://www.yorkcity.org/wp-content/uploads/2017/04/Article-191-Zoning-Hearing-Board.pdf",
		source: "official"
	},
	{
		id: "off-079",
		name: "York City Zoning Ordinance (Feb 2026)",
		kind: "PDF",
		size: "PDF",
		municipality: "York City",
		county: "York",
		category: "Zoning",
		updated: "Feb 1, 2026",
		url: "https://www.yorkcity.org/wp-content/uploads/2026/02/H-Zoning.doc.pdf",
		source: "official"
	},
	{
		id: "off-111",
		name: "York City Subdivision and Land Development Ordinance (Part 13)",
		kind: "PDF",
		size: "PDF",
		municipality: "York City",
		county: "York",
		category: "SALDO",
		updated: "Jan 1, 2017",
		url: "http://www.yorkcity.org/user-files/file/City%20Council/Codified%20Ordinances/CO-Part%2013%20-%20Planning%20%26%20Zoning%20(1331-1379).pdf",
		source: "official"
	},
	{
		id: "off-104",
		name: "YCPC Data Centers Model Ordinance",
		kind: "WEB",
		size: "Online",
		municipality: "York County",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.ycpc.org/700/Data-Centers-Model-Ordinance-PDF",
		source: "official"
	},
	{
		id: "off-105",
		name: "YCPC Solar Energy Systems Model Ordinance",
		kind: "WEB",
		size: "Online",
		municipality: "York County",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.ycpc.org/296/Solar-Energy-Systems-Model-Ordinance-PDF",
		source: "official"
	},
	{
		id: "off-103",
		name: "YCPC Zoning Ordinance Content Guide",
		kind: "WEB",
		size: "Online",
		municipality: "York County",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.ycpc.org/301/Zoning-Ordinance-Content-Guide-PDF",
		source: "official"
	},
	{
		id: "off-014",
		name: "York County Planning Commission — Resources",
		kind: "WEB",
		size: "Online",
		municipality: "York County",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://www.ycpc.org/",
		source: "official"
	},
	{
		id: "off-056",
		name: "YCPC County Subdivision & Land Development",
		kind: "WEB",
		size: "Online",
		municipality: "York County",
		county: "York",
		category: "SALDO",
		updated: "Jan 1, 2026",
		url: "https://www.ycpc.org/308/County-Subdivisions",
		source: "official"
	},
	{
		id: "off-110",
		name: "YCPC County Subdivision & Land Development Approval",
		kind: "WEB",
		size: "Online",
		municipality: "York County",
		county: "York",
		category: "SALDO",
		updated: "Jan 1, 2026",
		url: "https://www.ycpc.org/323/Mandated-Reviews",
		source: "official"
	},
	{
		id: "off-015",
		name: "YCPC Model Ordinances (Zoning / SALDO)",
		kind: "WEB",
		size: "Online",
		municipality: "York County",
		county: "York",
		category: "SALDO",
		updated: "Jan 1, 2026",
		url: "https://www.ycpc.org/293/Model-Ordinance",
		source: "official"
	},
	{
		id: "off-124",
		name: "York County Subdivision and Land Development Ordinance (2012 PDF)",
		kind: "WEB",
		size: "Online",
		municipality: "York County",
		county: "York",
		category: "SALDO",
		updated: "Jan 18, 2012",
		url: "https://www.ycpc.org/DocumentCenter/View/283/County-Subdivision-and-Land-Development-Ordinance-2012-PDF",
		source: "official"
	},
	{
		id: "off-057",
		name: "YCPC 2026 Fee Schedule",
		kind: "WEB",
		size: "Online",
		municipality: "York County",
		county: "York",
		category: "Builder",
		updated: "Jan 1, 2026",
		url: "https://www.ycpc.org/",
		source: "official"
	},
	{
		id: "drv-1yGnsMkkTE0_ctJk",
		name: "York County Zoning Ordinance Content Guide",
		kind: "PDF",
		size: "66 KB",
		municipality: "York County Zoning Ordinance Content Guide",
		county: "York",
		category: "Zoning",
		updated: "Jul 29, 2026",
		url: "https://drive.google.com/file/d/1yGnsMkkTE0_ctJkQqz-DTbjrAFbTC5BE/view",
		source: "drive"
	},
	{
		id: "off-102",
		name: "York Township Official Map Ordinance",
		kind: "WEB",
		size: "Online",
		municipality: "York Township",
		county: "York",
		category: "Zoning",
		updated: "Aug 13, 2012",
		url: "https://yorktownshippa.gov/ordinances-and-studies-4/",
		source: "official"
	},
	{
		id: "off-041",
		name: "York Township Ordinances & Studies",
		kind: "WEB",
		size: "Online",
		municipality: "York Township",
		county: "York",
		category: "Zoning",
		updated: "Jan 1, 2026",
		url: "https://yorktownshippa.gov/os/",
		source: "official"
	},
	{
		id: "off-037",
		name: "York Township Zoning Map (amended 5-22-2026)",
		kind: "PDF",
		size: "PDF",
		municipality: "York Township",
		county: "York",
		category: "Zoning",
		updated: "May 22, 2026",
		url: "https://yorktownshippa.gov/wp-content/uploads/Zoning-Map-last-amendment-05-22-2026.pdf",
		source: "official"
	},
	{
		id: "off-036",
		name: "York Township Zoning Ordinance (amended 3-14-23)",
		kind: "PDF",
		size: "PDF",
		municipality: "York Township",
		county: "York",
		category: "Zoning",
		updated: "Mar 14, 2023",
		url: "https://yorktownshippa.gov/wp-content/uploads/Zoning-Ordinance-last-amendment-3-14-23.pdf",
		source: "official"
	},
	{
		id: "drv-1aVDIJaw-qsN2Lfd",
		name: "York Township - YORK TOWNSHIP SALDO",
		kind: "PDF",
		size: "1.1 MB",
		municipality: "York Township",
		county: "York",
		category: "SALDO",
		updated: "Aug 4, 2026",
		url: "https://drive.google.com/file/d/1aVDIJaw-qsN2LfdiLIZXCXmafze-fwx0/view",
		source: "drive"
	},
	{
		id: "off-038",
		name: "York Township SALDO (amended 10-28-13)",
		kind: "PDF",
		size: "PDF",
		municipality: "York Township",
		county: "York",
		category: "SALDO",
		updated: "Oct 28, 2013",
		url: "https://yorktownshippa.gov/wp-content/uploads/SALDO-as-amended-10-28-13-.pdf",
		source: "official"
	},
	{
		id: "off-040",
		name: "York Township Code of Ordinances (June 2020)",
		kind: "PDF",
		size: "PDF",
		municipality: "York Township",
		county: "York",
		category: "Codes",
		updated: "Jun 1, 2020",
		url: "https://yorktownshippa.gov/wp-content/uploads/CODE-OF-THE-TOWNSHIP-OF-YORK-UPDATE-2020.pdf",
		source: "official"
	},
	{
		id: "off-101",
		name: "York Township Floodplain Management Ordinance (2015)",
		kind: "WEB",
		size: "Online",
		municipality: "York Township",
		county: "York",
		category: "Codes",
		updated: "Nov 10, 2015",
		url: "https://yorktownshippa.gov/ordinances-and-studies-4/",
		source: "official"
	},
	{
		id: "off-039",
		name: "York Township Stormwater Management Ordinance (2022)",
		kind: "PDF",
		size: "PDF",
		municipality: "York Township",
		county: "York",
		category: "Codes",
		updated: "Jan 1, 2022",
		url: "https://yorktownshippa.gov/wp-content/uploads/York-Township-2022-Stormwater-Management-Ordinance.pdf",
		source: "official"
	}
];
var SEED_PROJECTS = [
	{
		id: "prj-market",
		name: "Market St Development",
		county: "Cumberland",
		municipality: "Camp Hill Borough",
		status: "Lead",
		parcelIds: [
			"p-1042",
			"p-1048",
			"p-1102"
		],
		acres: 2.04,
		modified: "Oct 24",
		constraints: []
	},
	{
		id: "prj-camphill",
		name: "Camp Hill Mixed-Use",
		county: "Cumberland",
		municipality: "Camp Hill Borough",
		status: "Permitting",
		parcelIds: ["p-1042"],
		acres: 1.24,
		modified: "Sep 15",
		constraints: []
	},
	{
		id: "prj-york",
		name: "York Logistics Hub",
		county: "York",
		municipality: "West Manchester Township",
		status: "Due Diligence",
		parcelIds: ["p-york-log-1", "p-york-log-2"],
		acres: 50.5,
		modified: "Aug 02",
		constraints: ["Flood Zone"]
	},
	{
		id: "prj-hershey",
		name: "Chocolate Ave Infill",
		county: "Dauphin",
		municipality: "Derry Township",
		status: "Lead",
		parcelIds: ["p-hershey"],
		acres: 2.1,
		modified: "Oct 08",
		constraints: []
	},
	{
		id: "prj-queen",
		name: "Queen Street TOD",
		county: "Lancaster",
		municipality: "Lancaster City",
		status: "Approved",
		parcelIds: ["p-lanc-city"],
		acres: .12,
		modified: "Jul 22",
		constraints: ["Historic District"]
	}
];
var MEETINGS = [
	{
		id: "m1",
		date: "2024-10-12",
		municipality: "Harrisburg City",
		county: "Dauphin",
		body: "City Council",
		status: "Approved",
		summary: "Council approved Resolution 42-2023 amending the commercial zoning overlay in the downtown corridor. Preliminary discussions held regarding the upcoming Market St. infrastructure improvement bond.",
		tags: ["Zoning Amendment", "Infrastructure"]
	},
	{
		id: "m2",
		date: "2024-10-10",
		municipality: "Camp Hill Borough",
		county: "Cumberland",
		body: "Planning Commission",
		status: "Approved",
		summary: "Review of land development plan for the proposed mixed-use facility on Market Street. Commissioners requested revised traffic impact studies before final approval recommendation.",
		tags: ["Land Development", "Study Required"]
	},
	{
		id: "m3",
		date: "2024-10-08",
		municipality: "West Manchester Township",
		county: "York",
		body: "Zoning Hearing Board",
		status: "Approved",
		summary: "Granted variance for setback requirements on the industrial park expansion project (Case #23-014). Scheduled next month's public hearing for the agricultural preservation ordinance.",
		tags: ["Variance Granted", "Public Hearing Set"]
	},
	{
		id: "m4",
		date: "2024-09-28",
		municipality: "Harrisburg City",
		county: "Dauphin",
		body: "City Council",
		status: "Approved",
		summary: "Adopted FY2025 capital budget including riverfront trail connections.",
		tags: ["Budget"]
	},
	{
		id: "m5",
		date: "2024-09-25",
		municipality: "York City",
		county: "York",
		body: "Planning Commission",
		status: "Draft",
		summary: "Sketch plan for 340 N George Street mixed-use infill. Parking reduction discussed.",
		tags: ["Sketch Plan"]
	},
	{
		id: "m6",
		date: "2024-09-21",
		municipality: "Derry Township",
		county: "Dauphin",
		body: "Zoning Hearing Board",
		status: "Approved",
		summary: "Special exception for hotel use on Chocolate Avenue corridor granted with conditions.",
		tags: ["Special Exception"]
	},
	{
		id: "m7",
		date: "2024-09-14",
		municipality: "Camp Hill Borough",
		county: "Cumberland",
		body: "City Council",
		status: "Approved",
		summary: "Authorized SALDO amendment for mixed-use lot coverage in the C-2 district.",
		tags: ["SALDO"]
	},
	{
		id: "m8",
		date: "2024-09-10",
		municipality: "Lancaster City",
		county: "Lancaster",
		body: "Planning Commission",
		status: "Approved",
		summary: "TOD overlay design standards forwarded to Council with a recommendation of approval.",
		tags: ["TOD"]
	}
];
var TEAM = [
	{
		id: "t1",
		name: "Sarah Jenkins",
		email: "s.jenkins@county.gov",
		role: "Admin",
		status: "Active"
	},
	{
		id: "t2",
		name: "Marcus Reed",
		email: "m.reed@county.gov",
		role: "Editor",
		status: "Active"
	},
	{
		id: "t3",
		name: "Elena Patel",
		email: "e.patel@state.pa.us",
		role: "Viewer",
		status: "Pending"
	}
];
var SEED_COMMENTS = [
	{
		id: "c1",
		parcelId: "p-1042",
		author: "Sarah Jenkins",
		initials: "SJ",
		body: "Verified the setback requirements with the borough planner. The 25 ft front setback is correct for this C-2 sub-district.",
		at: "2h ago"
	},
	{
		id: "c2",
		parcelId: "p-1042",
		author: "Marcus Chen",
		initials: "MC",
		body: "Does the environmental buffer account for the small stream on the eastern boundary?",
		at: "5h ago"
	},
	{
		id: "c3",
		parcelId: "p-york-log-1",
		author: "Marcus Reed",
		initials: "MR",
		body: "Setback requirements here look inconsistent with the 2021 municipal variance. Flagging for ZHB file #23-014.",
		at: "2 hrs ago"
	}
];
var SEED_ALERTS = [
	{
		id: "a1",
		kind: "zoning",
		title: "Parcel 44-A3 Rezoned to C-2",
		body: "York County has approved a rezoning request for parcel 44-A3 from R-1 (Residential) to C-2 (Commercial). Effective immediately.",
		at: "2 hours ago",
		unread: true
	},
	{
		id: "a2",
		kind: "document",
		title: "2024 Regional Transportation Plan",
		body: "The final draft of the 2024 regional transportation plan for Cumberland County is now available in the document library.",
		at: "Yesterday, 4:30 PM",
		unread: true
	},
	{
		id: "a3",
		kind: "ordinance",
		title: "Industrial Setback Requirements Adjusted",
		body: "Dauphin County has updated setback requirements for all newly zoned industrial areas abutting residential zones.",
		at: "Oct 12, 2024",
		unread: false
	},
	{
		id: "a4",
		kind: "system",
		title: "GIS Layer Sync Completed",
		body: "Monthly synchronization of Lancaster County municipal parcel boundaries has been completed successfully.",
		at: "Oct 10, 2024",
		unread: false
	}
];
var PRICE_SERIES = [
	{
		month: "Jan",
		York: 78,
		Cumberland: 82,
		Dauphin: 74,
		Lancaster: 88
	},
	{
		month: "Feb",
		York: 79,
		Cumberland: 83,
		Dauphin: 75,
		Lancaster: 89
	},
	{
		month: "Mar",
		York: 80,
		Cumberland: 84,
		Dauphin: 76,
		Lancaster: 90
	},
	{
		month: "Apr",
		York: 81,
		Cumberland: 85,
		Dauphin: 78,
		Lancaster: 91
	},
	{
		month: "May",
		York: 82,
		Cumberland: 86,
		Dauphin: 79,
		Lancaster: 92
	},
	{
		month: "Jun",
		York: 83,
		Cumberland: 87,
		Dauphin: 80,
		Lancaster: 93
	},
	{
		month: "Jul",
		York: 84,
		Cumberland: 86,
		Dauphin: 81,
		Lancaster: 94
	},
	{
		month: "Aug",
		York: 85,
		Cumberland: 88,
		Dauphin: 82,
		Lancaster: 95
	},
	{
		month: "Sep",
		York: 84,
		Cumberland: 89,
		Dauphin: 83,
		Lancaster: 96
	},
	{
		month: "Oct",
		York: 86,
		Cumberland: 90,
		Dauphin: 84,
		Lancaster: 97
	},
	{
		month: "Nov",
		York: 87,
		Cumberland: 91,
		Dauphin: 85,
		Lancaster: 98
	},
	{
		month: "Dec",
		York: 88,
		Cumberland: 92,
		Dauphin: 86,
		Lancaster: 99
	}
];
var PERMIT_VOLUME = [
	{
		county: "York",
		issued: 425,
		pending: 225
	},
	{
		county: "Cumberland",
		issued: 325,
		pending: 140
	},
	{
		county: "Dauphin",
		issued: 280,
		pending: 160
	},
	{
		county: "Lancaster",
		issued: 218,
		pending: 95
	}
];
var RENO_2026 = [
	{
		item: "Interior demolition",
		unit: "sf",
		low: 4.5,
		high: 8.25
	},
	{
		item: "New residential construction (stick)",
		unit: "sf",
		low: 185,
		high: 245
	},
	{
		item: "Commercial shell (tilt / masonry)",
		unit: "sf",
		low: 155,
		high: 210
	},
	{
		item: "Site work & grading",
		unit: "acre",
		low: 18e3,
		high: 42e3
	},
	{
		item: "Public water/sewer lateral",
		unit: "lf",
		low: 95,
		high: 160
	},
	{
		item: "Asphalt parking",
		unit: "sf",
		low: 6.5,
		high: 11
	},
	{
		item: "Stormwater BMP (surface)",
		unit: "sf treatment",
		low: 8,
		high: 18
	},
	{
		item: "Townhouse vertical (finished)",
		unit: "sf",
		low: 155,
		high: 205
	}
];
var COUNTIES = [
	"York",
	"Cumberland",
	"Dauphin",
	"Lancaster"
];
function box(lat, lng, dLat = .0012, dLng = .0016) {
	return [
		[lat - dLat, lng - dLng],
		[lat - dLat, lng + dLng],
		[lat + dLat, lng + dLng],
		[lat + dLat, lng - dLng]
	];
}
var PARCELS = [
	{
		id: "p-1042",
		apn: "21-14-1234-567",
		address: "1042 Market Street",
		municipality: "Camp Hill Borough",
		county: "Cumberland",
		lat: 40.2399,
		lng: -76.9204,
		polygon: box(40.2399, -76.9204, .0011, .0015),
		acres: 1.24,
		sqft: 54014,
		zoning: "C-2",
		zoningName: "General Commercial District",
		zoningSummary: "Intended for retail, service, and office uses serving the broader community. Mixed-use development permitted by conditional use.",
		assessed: 145e4,
		taxYear: 2024,
		owner: "Market St Holdings LLC",
		setbacks: {
			front: 25,
			side: 10,
			rear: 20
		},
		maxHeight: 45,
		maxCoverage: 60,
		permittedUses: [
			"Retail Sales & Service",
			"Professional Offices",
			"Restaurants (inc. Drive-thru)",
			"Mixed-Use Residential (Upper fl.)"
		],
		footprintSf: 2150,
		lotCoveragePct: 18,
		buildableSf: 12450,
		rowDedicationSf: 1200,
		envBufferSf: 3450,
		setbackSf: 8364,
		flood: {
			0: "X",
			1: "X",
			3: "X500",
			5: "AE"
		},
		slopePct: 3,
		historic: false,
		utilities: {
			water: "8\" main on Market St. Cap: Available",
			sewer: "12\" line at rear alley. Cap: Review Req.",
			electric: "Overhead along frontage. Provider: PPL",
			gas: "4\" medium pressure line. Provider: UGI"
		},
		aadt: 18400,
		roiPct: 15.2,
		densityUa: 24,
		potential: "High",
		constraints: [],
		transfers: [
			{
				date: "Dec 12, 2018",
				party: "Market St Holdings LLC",
				price: 125e4
			},
			{
				date: "Aug 05, 2004",
				party: "Smith & Associates Inc.",
				price: 85e4
			},
			{
				date: "Mar 22, 1992",
				party: "Borough of Camp Hill",
				price: 0
			}
		],
		docs: [{
			title: "Borough Zoning Ordinance",
			kind: "PDF · Article IV (Commercial)"
		}, {
			title: "SALDO Requirements",
			kind: "PDF · Subdivision & Land Dev"
		}]
	},
	{
		id: "p-1048",
		apn: "21-14-1234-571",
		address: "1048 Market Street",
		municipality: "Camp Hill Borough",
		county: "Cumberland",
		lat: 40.2406,
		lng: -76.9186,
		polygon: box(40.2406, -76.9186, 7e-4, 9e-4),
		acres: .42,
		sqft: 18295,
		zoning: "R-1",
		zoningName: "Low-Density Residential",
		zoningSummary: "Single-family detached. ADU by special exception.",
		assessed: 385e3,
		taxYear: 2024,
		owner: "Henderson Family Trust",
		setbacks: {
			front: 30,
			side: 15,
			rear: 25
		},
		maxHeight: 35,
		maxCoverage: 35,
		permittedUses: [
			"Single-family dwelling",
			"Home occupation",
			"ADU (SE)"
		],
		footprintSf: 1680,
		lotCoveragePct: 22,
		buildableSf: 6400,
		rowDedicationSf: 400,
		envBufferSf: 0,
		setbackSf: 5100,
		flood: {
			0: "X",
			1: "X",
			3: "X",
			5: "X500"
		},
		slopePct: 4,
		historic: false,
		utilities: {
			water: "6\" main. Cap: Available",
			sewer: "8\" lateral. Cap: Available",
			electric: "Overhead. PPL",
			gas: "2\" service. UGI"
		},
		aadt: 18400,
		roiPct: 8.4,
		densityUa: 8,
		potential: "Med",
		constraints: [],
		transfers: [{
			date: "Jun 18, 2011",
			party: "Henderson Family Trust",
			price: 242e3
		}],
		docs: [{
			title: "Borough Zoning Ordinance",
			kind: "PDF · Article III"
		}]
	},
	{
		id: "p-1102",
		apn: "21-14-1235-012",
		address: "1102 Market Street",
		municipality: "Camp Hill Borough",
		county: "Cumberland",
		lat: 40.2414,
		lng: -76.9168,
		polygon: box(40.2414, -76.9168, 6e-4, 8e-4),
		acres: .38,
		sqft: 16553,
		zoning: "R-1",
		zoningName: "Low-Density Residential",
		zoningSummary: "Single-family detached on a corner lot.",
		assessed: 352e3,
		taxYear: 2024,
		owner: "Patel, Anika",
		setbacks: {
			front: 30,
			side: 15,
			rear: 25
		},
		maxHeight: 35,
		maxCoverage: 35,
		permittedUses: ["Single-family dwelling", "Home occupation"],
		footprintSf: 1420,
		lotCoveragePct: 20,
		buildableSf: 5800,
		rowDedicationSf: 380,
		envBufferSf: 0,
		setbackSf: 4900,
		flood: {
			0: "X",
			1: "X",
			3: "X",
			5: "X500"
		},
		slopePct: 5,
		historic: false,
		utilities: {
			water: "6\" main. Cap: Available",
			sewer: "8\" lateral. Cap: Available",
			electric: "Overhead. PPL",
			gas: "2\" service. UGI"
		},
		aadt: 16200,
		roiPct: 7.9,
		densityUa: 8,
		potential: "Med",
		constraints: [],
		transfers: [{
			date: "Apr 02, 2019",
			party: "Patel, Anika",
			price: 31e4
		}],
		docs: [{
			title: "Borough Zoning Ordinance",
			kind: "PDF · Article III"
		}]
	},
	{
		id: "p-hbg-mkt",
		apn: "45-002-194.00",
		address: "123 N 2nd Street",
		municipality: "Harrisburg City",
		county: "Dauphin",
		lat: 40.2614,
		lng: -76.8821,
		polygon: box(40.2614, -76.8821, 9e-4, .0011),
		acres: .86,
		sqft: 37462,
		zoning: "C-2",
		zoningName: "Downtown Commercial",
		zoningSummary: "Intensive CBD commercial with upper-floor residential.",
		assessed: 218e4,
		taxYear: 2024,
		owner: "Capitol View Partners LP",
		setbacks: {
			front: 15,
			side: 10,
			rear: 25
		},
		maxHeight: 65,
		maxCoverage: 75,
		permittedUses: [
			"Retail",
			"Office",
			"Restaurant",
			"Mixed-use residential"
		],
		footprintSf: 11200,
		lotCoveragePct: 48,
		buildableSf: 21e3,
		rowDedicationSf: 800,
		envBufferSf: 0,
		setbackSf: 6200,
		flood: {
			0: "X500",
			1: "AE",
			3: "AE",
			5: "AE"
		},
		slopePct: 2,
		historic: true,
		utilities: {
			water: "12\" downtown loop. Cap: Available",
			sewer: "Combined sewer. Cap: Review Req. (CSO)",
			electric: "Underground. PPL",
			gas: "UGI downtown grid"
		},
		aadt: 22100,
		roiPct: 11.4,
		densityUa: 48,
		potential: "High",
		constraints: ["Historic District", "Combined sewer"],
		transfers: [{
			date: "Nov 03, 2021",
			party: "Capitol View Partners LP",
			price: 195e4
		}],
		docs: [{
			title: "Harrisburg Zoning Ordinance",
			kind: "PDF · Art. IV"
		}]
	},
	{
		id: "p-york-log-1",
		apn: "36-000-18-0042",
		address: "2800 Loucks Road",
		municipality: "West Manchester Township",
		county: "York",
		lat: 39.9782,
		lng: -76.7754,
		polygon: box(39.9782, -76.7754, .0038, .0052),
		acres: 28.4,
		sqft: 1237104,
		zoning: "I-2",
		zoningName: "General Industrial",
		zoningSummary: "Logistics and warehousing near I-83 / US-30 interchange.",
		assessed: 642e4,
		taxYear: 2024,
		owner: "Susquehanna Logistics REIT",
		setbacks: {
			front: 40,
			side: 25,
			rear: 30
		},
		maxHeight: 50,
		maxCoverage: 70,
		permittedUses: [
			"Warehousing",
			"Distribution",
			"Light manufacturing",
			"Fleet parking"
		],
		footprintSf: 186e3,
		lotCoveragePct: 15,
		buildableSf: 72e4,
		rowDedicationSf: 18e3,
		envBufferSf: 42e3,
		setbackSf: 96e3,
		flood: {
			0: "AE",
			1: "AE",
			3: "AE",
			5: "AE"
		},
		slopePct: 6,
		historic: false,
		utilities: {
			water: "12\" public. Cap: Available",
			sewer: "Public, pump station 1,200 ft. Cap: Available",
			electric: "3-phase. Met-Ed",
			gas: "6\" high-pressure. Columbia Gas"
		},
		aadt: 31200,
		roiPct: 9.8,
		densityUa: 0,
		potential: "High",
		constraints: ["Flood Zone", "Wetlands fringe"],
		transfers: [{
			date: "Jan 14, 2020",
			party: "Susquehanna Logistics REIT",
			price: 51e5
		}],
		docs: [{
			title: "West Manchester Zoning",
			kind: "PDF · § 508 I-2"
		}]
	},
	{
		id: "p-york-log-2",
		apn: "36-000-18-0048",
		address: "2950 Loucks Road",
		municipality: "West Manchester Township",
		county: "York",
		lat: 39.981,
		lng: -76.768,
		polygon: box(39.981, -76.768, .0032, .0044),
		acres: 22.1,
		sqft: 962676,
		zoning: "I-2",
		zoningName: "General Industrial",
		zoningSummary: "Vacant industrial pad adjacent to existing warehouse.",
		assessed: 188e4,
		taxYear: 2024,
		owner: "York County IDA",
		setbacks: {
			front: 40,
			side: 25,
			rear: 30
		},
		maxHeight: 50,
		maxCoverage: 70,
		permittedUses: [
			"Warehousing",
			"Distribution",
			"Manufacturing"
		],
		footprintSf: 0,
		lotCoveragePct: 0,
		buildableSf: 58e4,
		rowDedicationSf: 12e3,
		envBufferSf: 64e3,
		setbackSf: 88e3,
		flood: {
			0: "X500",
			1: "AE",
			3: "AE",
			5: "AE"
		},
		slopePct: 8,
		historic: false,
		utilities: {
			water: "Stub at Loucks. Cap: Available",
			sewer: "Needs 400 ft extension",
			electric: "3-phase at street",
			gas: "Available at Loucks"
		},
		aadt: 31200,
		roiPct: 12.1,
		densityUa: 0,
		potential: "High",
		constraints: ["Flood Zone", "Sewer extension"],
		transfers: [{
			date: "Sep 09, 2016",
			party: "York County IDA",
			price: 0
		}],
		docs: [{
			title: "West Manchester Zoning",
			kind: "PDF · § 508 I-2"
		}]
	},
	{
		id: "p-lanc-farm",
		apn: "390-12345-0-0000",
		address: "840 Lititz Pike",
		municipality: "Manheim Township",
		county: "Lancaster",
		lat: 40.0784,
		lng: -76.3062,
		polygon: box(40.0784, -76.3062, .0046, .006),
		acres: 41.6,
		sqft: 1812096,
		zoning: "A-1",
		zoningName: "Agricultural Preservation",
		zoningSummary: "Prime farmland. Sliding-scale subdivision. Clean & Green enrolled.",
		assessed: 98e4,
		taxYear: 2024,
		owner: "Stoltzfus Brothers",
		setbacks: {
			front: 50,
			side: 30,
			rear: 50
		},
		maxHeight: 35,
		maxCoverage: 10,
		permittedUses: [
			"Agriculture",
			"Farm dwelling",
			"Agri-tourism (SE)",
			"Roadside stand"
		],
		footprintSf: 8400,
		lotCoveragePct: 2,
		buildableSf: 12e4,
		rowDedicationSf: 8e3,
		envBufferSf: 22e3,
		setbackSf: 14e4,
		flood: {
			0: "X",
			1: "X",
			3: "X",
			5: "X"
		},
		slopePct: 4,
		historic: false,
		utilities: {
			water: "On-site well",
			sewer: "On-lot septic",
			electric: "PPL rural",
			gas: "None"
		},
		aadt: 19400,
		roiPct: 4.2,
		densityUa: .1,
		potential: "Low",
		constraints: ["Ag preservation", "Clean & Green recapture"],
		transfers: [{
			date: "May 22, 1988",
			party: "Stoltzfus Brothers",
			price: 41e4
		}],
		docs: [{
			title: "Ag Preservation Amendments (Draft)",
			kind: "PDF"
		}]
	},
	{
		id: "p-carl-sq",
		apn: "04-21-1842-003",
		address: "18 W High Street",
		municipality: "Carlisle Borough",
		county: "Cumberland",
		lat: 40.2015,
		lng: -77.1898,
		polygon: box(40.2015, -77.1898, 5e-4, 7e-4),
		acres: .18,
		sqft: 7841,
		zoning: "MU",
		zoningName: "Mixed-Use Downtown",
		zoningSummary: "Ground-floor commercial required. 24 u/acre above.",
		assessed: 62e4,
		taxYear: 2024,
		owner: "Square Holdings LLC",
		setbacks: {
			front: 0,
			side: 0,
			rear: 15
		},
		maxHeight: 48,
		maxCoverage: 90,
		permittedUses: [
			"Retail",
			"Restaurant",
			"Office",
			"Upper-floor apartments"
		],
		footprintSf: 4200,
		lotCoveragePct: 72,
		buildableSf: 6800,
		rowDedicationSf: 0,
		envBufferSf: 0,
		setbackSf: 900,
		flood: {
			0: "X",
			1: "X",
			3: "X",
			5: "X"
		},
		slopePct: 2,
		historic: true,
		utilities: {
			water: "Downtown 8\"",
			sewer: "Available",
			electric: "PPL",
			gas: "UGI"
		},
		aadt: 8600,
		roiPct: 13.6,
		densityUa: 24,
		potential: "High",
		constraints: ["Historic District"],
		transfers: [{
			date: "Feb 11, 2022",
			party: "Square Holdings LLC",
			price: 575e3
		}],
		docs: [{
			title: "Carlisle Downtown Overlay",
			kind: "PDF"
		}]
	},
	{
		id: "p-hershey",
		apn: "24-055-047",
		address: "120 W Chocolate Avenue",
		municipality: "Derry Township",
		county: "Dauphin",
		lat: 40.2856,
		lng: -76.6508,
		polygon: box(40.2856, -76.6508, .0014, .0018),
		acres: 2.1,
		sqft: 91476,
		zoning: "C-1",
		zoningName: "Neighborhood Commercial",
		zoningSummary: "Tourism-adjacent retail. Hours limited after 10 p.m.",
		assessed: 31e5,
		taxYear: 2024,
		owner: "Cocoa Corridor LLC",
		setbacks: {
			front: 30,
			side: 15,
			rear: 25
		},
		maxHeight: 35,
		maxCoverage: 40,
		permittedUses: [
			"Retail",
			"Restaurant",
			"Hotel (CU)",
			"Office"
		],
		footprintSf: 18600,
		lotCoveragePct: 28,
		buildableSf: 28e3,
		rowDedicationSf: 2200,
		envBufferSf: 0,
		setbackSf: 14e3,
		flood: {
			0: "X",
			1: "X",
			3: "X500",
			5: "AE"
		},
		slopePct: 3,
		historic: false,
		utilities: {
			water: "Derry Township 12\"",
			sewer: "Available",
			electric: "PPL",
			gas: "UGI"
		},
		aadt: 24500,
		roiPct: 10.2,
		densityUa: 18,
		potential: "High",
		constraints: [],
		transfers: [{
			date: "Aug 30, 2017",
			party: "Cocoa Corridor LLC",
			price: 24e5
		}],
		docs: [{
			title: "Derry Township Zoning",
			kind: "PDF · § 225-14"
		}]
	},
	{
		id: "p-york-city",
		apn: "06-146-04-0012",
		address: "340 N George Street",
		municipality: "York City",
		county: "York",
		lat: 39.9658,
		lng: -76.7279,
		polygon: box(39.9658, -76.7279, 8e-4, .001),
		acres: .64,
		sqft: 27878,
		zoning: "MU",
		zoningName: "City Mixed-Use",
		zoningSummary: "Infill mixed-use along the George Street corridor.",
		assessed: 74e4,
		taxYear: 2024,
		owner: "Codorus Redevelopment Co.",
		setbacks: {
			front: 10,
			side: 5,
			rear: 15
		},
		maxHeight: 55,
		maxCoverage: 80,
		permittedUses: [
			"Retail",
			"Office",
			"Multifamily",
			"Live-work"
		],
		footprintSf: 9200,
		lotCoveragePct: 42,
		buildableSf: 16800,
		rowDedicationSf: 600,
		envBufferSf: 1800,
		setbackSf: 4200,
		flood: {
			0: "X500",
			1: "X500",
			3: "AE",
			5: "AE"
		},
		slopePct: 5,
		historic: false,
		utilities: {
			water: "York Water Co.",
			sewer: "York City. Cap: Available",
			electric: "Met-Ed",
			gas: "Columbia Gas"
		},
		aadt: 16800,
		roiPct: 14.1,
		densityUa: 36,
		potential: "High",
		constraints: ["Codorus flood fringe"],
		transfers: [{
			date: "Oct 04, 2023",
			party: "Codorus Redevelopment Co.",
			price: 61e4
		}],
		docs: [{
			title: "York City Zoning",
			kind: "PDF"
		}]
	},
	{
		id: "p-lanc-city",
		apn: "330-67890-1-0001",
		address: "45 N Queen Street",
		municipality: "Lancaster City",
		county: "Lancaster",
		lat: 40.0398,
		lng: -76.3059,
		polygon: box(40.0398, -76.3059, 45e-5, 55e-5),
		acres: .12,
		sqft: 5227,
		zoning: "TOD",
		zoningName: "Transit-Oriented Downtown",
		zoningSummary: "Walkable core. Parking reductions near Amtrak/RRTA.",
		assessed: 89e4,
		taxYear: 2024,
		owner: "Queen Street Collective",
		setbacks: {
			front: 0,
			side: 0,
			rear: 10
		},
		maxHeight: 72,
		maxCoverage: 95,
		permittedUses: [
			"Retail",
			"Restaurant",
			"Office",
			"Multifamily"
		],
		footprintSf: 4800,
		lotCoveragePct: 88,
		buildableSf: 4900,
		rowDedicationSf: 0,
		envBufferSf: 0,
		setbackSf: 320,
		flood: {
			0: "X",
			1: "X",
			3: "X",
			5: "X"
		},
		slopePct: 1,
		historic: true,
		utilities: {
			water: "City 8\"",
			sewer: "City",
			electric: "PPL underground",
			gas: "UGI"
		},
		aadt: 11200,
		roiPct: 12.8,
		densityUa: 60,
		potential: "High",
		constraints: ["Historic District"],
		transfers: [{
			date: "Jul 19, 2015",
			party: "Queen Street Collective",
			price: 64e4
		}],
		docs: [{
			title: "Lancaster City Zoning",
			kind: "PDF"
		}]
	},
	{
		id: "p-epenn",
		apn: "09-14-0881-22",
		address: "55 Shady Lane",
		municipality: "East Pennsboro Township",
		county: "Cumberland",
		lat: 40.2472,
		lng: -76.9395,
		polygon: box(40.2472, -76.9395, .0016, .002),
		acres: 3.4,
		sqft: 148104,
		zoning: "R-2",
		zoningName: "Medium-Density Residential",
		zoningSummary: "Townhouse and twin permitted. Cluster option.",
		assessed: 42e4,
		taxYear: 2024,
		owner: "Valley Homes Group",
		setbacks: {
			front: 25,
			side: 10,
			rear: 25
		},
		maxHeight: 35,
		maxCoverage: 40,
		permittedUses: [
			"Single-family",
			"Twin",
			"Townhouse",
			"Open space"
		],
		footprintSf: 0,
		lotCoveragePct: 0,
		buildableSf: 72e3,
		rowDedicationSf: 6400,
		envBufferSf: 11e3,
		setbackSf: 22e3,
		flood: {
			0: "X",
			1: "X",
			3: "X",
			5: "X500"
		},
		slopePct: 9,
		historic: false,
		utilities: {
			water: "SUEZ/Veolia 8\"",
			sewer: "East Pennsboro. Cap: Available",
			electric: "PPL",
			gas: "UGI at Shady Lane"
		},
		aadt: 4200,
		roiPct: 16.4,
		densityUa: 8,
		potential: "High",
		constraints: ["Steep slopes on west"],
		transfers: [{
			date: "Mar 08, 2024",
			party: "Valley Homes Group",
			price: 395e3
		}],
		docs: [{
			title: "East Pennsboro SALDO",
			kind: "PDF"
		}]
	},
	{
		id: "p-swatara",
		apn: "63-028-085",
		address: "4100 Derry Street",
		municipality: "Swatara Township",
		county: "Dauphin",
		lat: 40.2544,
		lng: -76.8142,
		polygon: box(40.2544, -76.8142, .0022, .0028),
		acres: 6.8,
		sqft: 296208,
		zoning: "I-1",
		zoningName: "Light Industrial",
		zoningSummary: "Flex industrial along the Derry Street corridor.",
		assessed: 154e4,
		taxYear: 2024,
		owner: "Paxton Creek Flex LLC",
		setbacks: {
			front: 30,
			side: 20,
			rear: 25
		},
		maxHeight: 40,
		maxCoverage: 60,
		permittedUses: [
			"Flex warehouse",
			"Contractor yard (CU)",
			"Office/warehouse"
		],
		footprintSf: 42e3,
		lotCoveragePct: 14,
		buildableSf: 128e3,
		rowDedicationSf: 5e3,
		envBufferSf: 16e3,
		setbackSf: 28e3,
		flood: {
			0: "X500",
			1: "AE",
			3: "AE",
			5: "AE"
		},
		slopePct: 4,
		historic: false,
		utilities: {
			water: "Capital Region Water",
			sewer: "Swatara. Cap: Review Req.",
			electric: "PPL 3-phase",
			gas: "UGI"
		},
		aadt: 14800,
		roiPct: 9.1,
		densityUa: 0,
		potential: "Med",
		constraints: ["Flood Zone"],
		transfers: [{
			date: "Dec 01, 2019",
			party: "Paxton Creek Flex LLC",
			price: 132e4
		}],
		docs: [{
			title: "Swatara Zoning",
			kind: "PDF"
		}]
	},
	{
		id: "p-hanover",
		apn: "67-000-02-0144",
		address: "1100 Eisenhower Drive",
		municipality: "Hanover Borough",
		county: "York",
		lat: 39.8112,
		lng: -76.9844,
		polygon: box(39.8112, -76.9844, .0024, .0032),
		acres: 8.9,
		sqft: 387684,
		zoning: "I-1",
		zoningName: "Light Industrial",
		zoningSummary: "Food processing and light manufacturing district.",
		assessed: 275e4,
		taxYear: 2024,
		owner: "Hanover Foods Affiliate",
		setbacks: {
			front: 35,
			side: 20,
			rear: 25
		},
		maxHeight: 45,
		maxCoverage: 65,
		permittedUses: [
			"Food processing",
			"Warehousing",
			"Packaging"
		],
		footprintSf: 98e3,
		lotCoveragePct: 25,
		buildableSf: 16e4,
		rowDedicationSf: 7e3,
		envBufferSf: 9e3,
		setbackSf: 32e3,
		flood: {
			0: "X",
			1: "X",
			3: "X",
			5: "X"
		},
		slopePct: 3,
		historic: false,
		utilities: {
			water: "Hanover Borough",
			sewer: "Available",
			electric: "Met-Ed 3-phase",
			gas: "Columbia Gas"
		},
		aadt: 9800,
		roiPct: 8.6,
		densityUa: 0,
		potential: "Med",
		constraints: [],
		transfers: [{
			date: "May 16, 2009",
			party: "Hanover Foods Affiliate",
			price: 19e5
		}],
		docs: [{
			title: "Hanover Zoning",
			kind: "PDF"
		}]
	},
	{
		id: "p-ephrata",
		apn: "360-55512-0-0000",
		address: "401 W Main Street",
		municipality: "Ephrata Borough",
		county: "Lancaster",
		lat: 40.1796,
		lng: -76.1814,
		polygon: box(40.1796, -76.1814, 9e-4, .0012),
		acres: .95,
		sqft: 41382,
		zoning: "C-1",
		zoningName: "Neighborhood Commercial",
		zoningSummary: "Main Street commercial with residential above.",
		assessed: 51e4,
		taxYear: 2024,
		owner: "Main Street Ephrata LLC",
		setbacks: {
			front: 10,
			side: 8,
			rear: 20
		},
		maxHeight: 40,
		maxCoverage: 70,
		permittedUses: [
			"Retail",
			"Office",
			"Apartment over shop"
		],
		footprintSf: 6200,
		lotCoveragePct: 26,
		buildableSf: 21e3,
		rowDedicationSf: 400,
		envBufferSf: 0,
		setbackSf: 7200,
		flood: {
			0: "X",
			1: "X",
			3: "X",
			5: "X"
		},
		slopePct: 4,
		historic: false,
		utilities: {
			water: "Ephrata Area",
			sewer: "Available",
			electric: "PPL",
			gas: "UGI"
		},
		aadt: 7200,
		roiPct: 11,
		densityUa: 16,
		potential: "Med",
		constraints: [],
		transfers: [{
			date: "Jan 27, 2018",
			party: "Main Street Ephrata LLC",
			price: 43e4
		}],
		docs: [{
			title: "Ephrata Zoning",
			kind: "PDF"
		}]
	},
	{
		id: "p-hampden",
		apn: "10-21-0904-18",
		address: "3400 Sporting Hill Road",
		municipality: "Hampden Township",
		county: "Cumberland",
		lat: 40.2338,
		lng: -76.9586,
		polygon: box(40.2338, -76.9586, .002, .0026),
		acres: 5.2,
		sqft: 226512,
		zoning: "R-1",
		zoningName: "Low-Density Residential",
		zoningSummary: "Suburban single-family. Public water/sewer.",
		assessed: 89e4,
		taxYear: 2024,
		owner: "Sporting Hill Estates LP",
		setbacks: {
			front: 35,
			side: 15,
			rear: 30
		},
		maxHeight: 35,
		maxCoverage: 30,
		permittedUses: ["Single-family", "Open space"],
		footprintSf: 0,
		lotCoveragePct: 0,
		buildableSf: 98e3,
		rowDedicationSf: 9e3,
		envBufferSf: 14e3,
		setbackSf: 36e3,
		flood: {
			0: "X",
			1: "X",
			3: "X",
			5: "X"
		},
		slopePct: 7,
		historic: false,
		utilities: {
			water: "SUEZ/Veolia",
			sewer: "Hampden. Cap: Available",
			electric: "PPL",
			gas: "UGI"
		},
		aadt: 6400,
		roiPct: 14.8,
		densityUa: 3,
		potential: "High",
		constraints: [],
		transfers: [{
			date: "Sep 12, 2022",
			party: "Sporting Hill Estates LP",
			price: 81e4
		}],
		docs: [{
			title: "Hampden Township Zoning",
			kind: "PDF"
		}]
	}
];
var COUNTY_CENTERS = {
	all: {
		lat: 40.12,
		lng: -76.72,
		zoom: 9
	},
	York: {
		lat: 39.96,
		lng: -76.73,
		zoom: 10
	},
	Cumberland: {
		lat: 40.21,
		lng: -77.05,
		zoom: 10
	},
	Dauphin: {
		lat: 40.27,
		lng: -76.82,
		zoom: 10
	},
	Lancaster: {
		lat: 40.04,
		lng: -76.3,
		zoom: 10
	}
};
function getParcel(id) {
	return PARCELS.find((p) => p.id === id);
}
function searchParcels(q) {
	const s = q.trim().toLowerCase();
	if (!s) return PARCELS;
	return PARCELS.filter((p) => p.address.toLowerCase().includes(s) || p.apn.toLowerCase().includes(s) || p.municipality.toLowerCase().includes(s) || p.owner.toLowerCase().includes(s) || p.zoning.toLowerCase().includes(s));
}
var BRIDGES = [
	{
		id: "br-harvey",
		name: "Harvey Taylor Bridge",
		lat: 40.259,
		lng: -76.903,
		vClear: "14' 6\"",
		hClear: "42'",
		risk: 8.2,
		risk3: 9.4
	},
	{
		id: "br-market",
		name: "Market Street Bridge",
		lat: 40.258,
		lng: -76.885,
		vClear: "16' 2\"",
		hClear: "48'",
		risk: 6.1,
		risk3: 7.8
	},
	{
		id: "br-wrights",
		name: "Wright's Ferry Bridge",
		lat: 40.028,
		lng: -76.527,
		vClear: "18' 0\"",
		hClear: "72'",
		risk: 4.4,
		risk3: 5.6
	}
];
var IMPROVEMENTS = [
	{
		id: "imp-83",
		name: "I-83 Exit 41A reconstruction",
		lat: 40.232,
		lng: -76.868,
		complete: "Q4 2027"
	},
	{
		id: "imp-trindle",
		name: "Trindle Road widening",
		lat: 40.226,
		lng: -76.94,
		complete: "Q2 2028"
	},
	{
		id: "imp-322",
		name: "US-322 corridor safety",
		lat: 40.27,
		lng: -76.7,
		complete: "Q3 2026"
	}
];
var PREVIEW_MS = 3e5;
var DEFAULT_LAYERS = {
	zoning: true,
	flood: false,
	slopes: false,
	footprints: true,
	yorkParcels: true,
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
	bridges: false
};
var useHub = create()(persist((set, get) => ({
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
	projects: SEED_PROJECTS,
	comments: SEED_COMMENTS,
	alerts: SEED_ALERTS,
	savedIds: ["p-1042"],
	alertCounties: {
		York: true,
		Cumberland: true,
		Dauphin: false,
		Lancaster: true
	},
	alertFreq: "Daily Digest",
	startPreview: () => set({ previewStartedAt: Date.now() }),
	subscribe: (profile) => set({
		isPro: true,
		profile
	}),
	signOut: () => set({
		isPro: false,
		profile: null
	}),
	setCounty: (county) => set({ county }),
	toggleLayer: (id) => set({ layers: {
		...get().layers,
		[id]: !(get().layers[id] ?? DEFAULT_LAYERS[id])
	} }),
	resetLayers: () => set({
		layers: { ...DEFAULT_LAYERS },
		floodFt: 0
	}),
	setFloodFt: (floodFt) => set({
		floodFt,
		layers: {
			...get().layers,
			inundation: true
		}
	}),
	setSatellite: (satellite) => set({ satellite }),
	selectParcel: (id, additive) => {
		const { selectedIds, batchMode } = get();
		if (!(additive || batchMode)) {
			set({ selectedIds: [id] });
			return;
		}
		set({ selectedIds: selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id] });
	},
	clearSelection: () => set({ selectedIds: [] }),
	setBatchMode: (batchMode) => set({ batchMode }),
	setBatchName: (batchName) => set({ batchName }),
	setQuery: (query) => set({ query }),
	saveBatchAsProject: (name) => {
		const { selectedIds, projects } = get();
		const selected = PARCELS.filter((p) => selectedIds.includes(p.id));
		if (!selected.length) return;
		const acres = selected.reduce((s, p) => s + p.acres, 0);
		const counties = new Set(selected.map((p) => p.county));
		set({ projects: [{
			id: `prj-${Date.now()}`,
			name,
			county: counties.size === 1 ? selected[0].county : "Multi",
			municipality: selected[0].municipality,
			status: "Lead",
			parcelIds: selectedIds,
			acres: Math.round(acres * 100) / 100,
			modified: "Just now",
			constraints: [...new Set(selected.flatMap((p) => p.constraints))]
		}, ...projects] });
	},
	toggleSaved: (id) => {
		const { savedIds } = get();
		set({ savedIds: savedIds.includes(id) ? savedIds.filter((x) => x !== id) : [...savedIds, id] });
	},
	addComment: (parcelId, author, body) => {
		set({ comments: [{
			id: `c-${Date.now()}`,
			parcelId,
			author,
			initials: author.split(" ").map((p) => p[0] ?? "").join("").slice(0, 2).toUpperCase(),
			body,
			at: "Just now"
		}, ...get().comments] });
	},
	markAlertsRead: () => set({ alerts: get().alerts.map((a) => ({
		...a,
		unread: false
	})) }),
	setAlertCounty: (c, on) => set({ alertCounties: {
		...get().alertCounties,
		[c]: on
	} }),
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
	canExport: () => get().isPro || get().previewActive()
}), {
	name: "svph-hub",
	skipHydration: true
}));
var ZONE_META = {
	"C-1": {
		name: "Neighborhood Commercial",
		colorToken: "zone-c",
		fill: "#c62828",
		count: 1680
	},
	"C-2": {
		name: "General Commercial",
		colorToken: "zone-c",
		fill: "#c62828",
		count: 2521
	},
	"R-1": {
		name: "Low-Density Residential",
		colorToken: "zone-r",
		fill: "#1565c0",
		count: 11240
	},
	"R-2": {
		name: "Medium-Density Residential",
		colorToken: "zone-r",
		fill: "#42a5f5",
		count: 7352
	},
	"I-1": {
		name: "Light Industrial",
		colorToken: "zone-i",
		fill: "#6a1b9a",
		count: 640
	},
	"I-2": {
		name: "General Industrial",
		colorToken: "zone-i",
		fill: "#8e24aa",
		count: 465
	},
	"A-1": {
		name: "Agricultural",
		colorToken: "zone-a",
		fill: "#2e7d32",
		count: 8940
	},
	MU: {
		name: "Mixed-Use",
		colorToken: "zone-mu",
		fill: "#ef6c00",
		count: 312
	},
	TOD: {
		name: "Transit-Oriented",
		colorToken: "zone-tod",
		fill: "#00838f",
		count: 542
	}
};
var ZONE_LEGEND = [
	{
		label: "Commercial (C-1, C-2)",
		color: "#c62828",
		count: 4201
	},
	{
		label: "Residential (R-1, R-2)",
		color: "#1565c0",
		count: 18592
	},
	{
		label: "Industrial (I-1, I-2)",
		color: "#6a1b9a",
		count: 1105
	},
	{
		label: "Agricultural (A-1)",
		color: "#2e7d32",
		count: 8940
	},
	{
		label: "Floodplain (100/500-yr)",
		color: "#1565c0",
		count: 2450
	},
	{
		label: "Steep Slopes (>15%)",
		color: "#6d4c41",
		count: 1842
	},
	{
		label: "TOD Zones",
		color: "#00838f",
		count: 542
	}
];
var ZONING_CODES = [
	{
		id: "ch-c2",
		county: "Cumberland",
		municipality: "Camp Hill Borough",
		section: "§ 402.1 — C-2 General Commercial",
		summary: "Retail, service, and office uses serving the broader community. Mixed-use residential on upper floors permitted by conditional use.",
		height: 45,
		minLot: 1e4,
		front: 25,
		side: 10,
		rear: 20,
		coverage: 60
	},
	{
		id: "ch-r1",
		county: "Cumberland",
		municipality: "Camp Hill Borough",
		section: "§ 301.2 — R-1 Low-Density Residential",
		summary: "Single-family detached dwellings. Accessory dwelling units by special exception.",
		height: 35,
		minLot: 1e4,
		front: 30,
		side: 15,
		rear: 25,
		coverage: 35
	},
	{
		id: "hbg-c2",
		county: "Dauphin",
		municipality: "Harrisburg City",
		section: "Art. IV — C-2 Downtown Commercial",
		summary: "Intensive commercial and mixed-use along Market Street and the CBD. Drive-thru restaurants permitted with traffic study.",
		height: 65,
		minLot: 5e3,
		front: 15,
		side: 10,
		rear: 25,
		coverage: 75
	},
	{
		id: "york-i2",
		county: "York",
		municipality: "West Manchester Township",
		section: "§ 508 — I-2 General Industrial",
		summary: "Warehousing, logistics, and manufacturing. Outdoor storage permitted. 100-year floodplain development prohibited without variance.",
		height: 50,
		minLot: 4e4,
		front: 40,
		side: 25,
		rear: 30,
		coverage: 70
	},
	{
		id: "lanc-a1",
		county: "Lancaster",
		municipality: "Manheim Township",
		section: "Art. V — A-1 Agricultural Preservation",
		summary: "Prime farmland protection. Subdivision limited to sliding-scale lots. Clean & Green (Act 319) enrollment common.",
		height: 35,
		minLot: 435600,
		front: 50,
		side: 30,
		rear: 50,
		coverage: 10
	},
	{
		id: "carl-mu",
		county: "Cumberland",
		municipality: "Carlisle Borough",
		section: "§ 220-18 — Mixed-Use Downtown",
		summary: "Ground-floor commercial required. Residential density up to 24 units/acre above.",
		height: 48,
		minLot: 3e3,
		front: 0,
		side: 0,
		rear: 15,
		coverage: 90
	},
	{
		id: "derry-c1",
		county: "Dauphin",
		municipality: "Derry Township",
		section: "§ 225-14 — C-1 Neighborhood Commercial",
		summary: "Small-scale retail serving adjacent residential. Hours of operation limited after 10 p.m.",
		height: 35,
		minLot: 15e3,
		front: 30,
		side: 15,
		rear: 25,
		coverage: 40
	},
	{
		id: "spr-r2",
		county: "York",
		municipality: "Springettsbury Township",
		section: "§ 325-27 — R-2 Medium Density",
		summary: "Single-family, twins, and townhouses. Cluster option with 20% open space.",
		height: 35,
		minLot: 6e3,
		front: 25,
		side: 10,
		rear: 25,
		coverage: 40
	}
];
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function formatAcres(acres) {
	return acres >= 10 ? acres.toFixed(0) : acres.toFixed(2);
}
function formatFullMoney(n) {
	return n.toLocaleString("en-US", {
		style: "currency",
		currency: "USD",
		maximumFractionDigits: 0
	});
}
function initials(name) {
	return name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors duration-150 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0", {
	variants: {
		variant: {
			default: "bg-primary-container text-on-primary hover:bg-primary",
			solid: "bg-primary text-on-primary hover:bg-primary-container",
			secondary: "bg-secondary text-on-secondary hover:bg-on-secondary-container",
			outline: "border border-outline-variant bg-card text-on-surface hover:bg-surface-low",
			ghost: "text-on-surface hover:bg-surface-container",
			nav: "text-on-primary/80 hover:text-on-primary hover:bg-primary-container",
			destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
			link: "text-primary-container underline-offset-4 hover:underline"
		},
		size: {
			default: "h-10 px-4",
			sm: "h-8 rounded-sm px-3 text-xs",
			lg: "h-12 px-6",
			icon: "size-10",
			pill: "h-9 rounded-full px-4"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = import_react.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		ref,
		...props
	});
});
Button.displayName = "Button";
var Sheet = Dialog;
function SheetContent({ className, side = "right", children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, { className: "fixed inset-0 z-50 bg-primary/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
		className: cn("fixed z-50 flex h-full w-[min(100%,20rem)] flex-col bg-card shadow-xl", side === "right" ? "right-0 top-0" : "left-0 top-0", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute right-3 top-3 rounded-sm p-1 text-on-surface-variant hover:bg-surface-container",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
var NAV = [
	{
		to: "/",
		label: "Home"
	},
	{
		to: "/map",
		label: "Map"
	},
	{
		to: "/dashboard",
		label: "Dashboard"
	},
	{
		to: "/documents",
		label: "Documents"
	},
	{
		to: "/zoning",
		label: "Zoning"
	},
	{
		to: "/insights",
		label: "Insights"
	},
	{
		to: "/subscription",
		label: "Pro"
	}
];
var MORE = [
	{
		to: "/minutes",
		label: "Meeting Minutes",
		icon: FileText
	},
	{
		to: "/workspace",
		label: "Team Workspace",
		icon: Users
	},
	{
		to: "/guide",
		label: "Quick Start",
		icon: BookOpen
	}
];
function AppShell({ children, fullBleed = false }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const unread = useHub((s) => s.alerts.filter((a) => a.unread).length);
	const isPro = useHub((s) => s.isPro);
	const profile = useHub((s) => s.profile);
	const previewStartedAt = useHub((s) => s.previewStartedAt);
	const [open, setOpen] = (0, import_react.useState)(false);
	const [q, setQ] = (0, import_react.useState)("");
	const [searchOpen, setSearchOpen] = (0, import_react.useState)(false);
	const [, tick] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		useHub.persist.rehydrate();
		const id = setInterval(() => tick((n) => n + 1), 15e3);
		return () => clearInterval(id);
	}, []);
	const previewActive = !isPro && previewStartedAt != null && Date.now() - previewStartedAt < 3e5;
	const previewExpired = !isPro && previewStartedAt != null && Date.now() - previewStartedAt >= 3e5;
	const hits = (0, import_react.useMemo)(() => {
		if (q.trim().length < 2) return {
			parcels: [],
			docs: [],
			codes: []
		};
		return {
			parcels: searchParcels(q).slice(0, 5),
			docs: DOCUMENTS.filter((d) => d.name.toLowerCase().includes(q.toLowerCase())).slice(0, 3),
			codes: ZONING_CODES.filter((c) => `${c.section} ${c.municipality}`.toLowerCase().includes(q.toLowerCase())).slice(0, 3)
		};
	}, [q]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-dvh bg-surface text-on-surface",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
				className: "fixed inset-x-0 top-0 z-40 h-16 bg-primary text-on-primary shadow-[0_1px_8px_rgb(0_0_0/0.12)] md:h-20",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-full max-w-[1400px] items-center gap-3 px-3 md:px-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "nav",
							size: "icon",
							className: "lg:hidden",
							onClick: () => setOpen(true),
							"aria-label": "Open menu",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/",
							className: "flex min-w-0 items-center gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/favicon.svg",
								alt: "",
								className: "h-9 w-9 rounded-sm md:h-10 md:w-10"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate text-base font-semibold tracking-tight md:text-xl",
								children: "Planning Hub"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "ml-4 hidden items-center gap-1 lg:flex",
							children: NAV.map((n) => {
								const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
								return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: n.to,
									className: cn("rounded-sm px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition-colors", active ? "border-b-2 border-on-primary pb-0.5 text-on-primary" : "text-on-primary/75 hover:text-on-primary"),
									children: n.label
								}, n.to);
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "ml-auto flex items-center gap-1",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative hidden md:block",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-on-primary/60" }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: q,
											onChange: (e) => {
												setQ(e.target.value);
												setSearchOpen(true);
											},
											onFocus: () => setSearchOpen(true),
											placeholder: "Address, APN, owner…",
											autoComplete: "off",
											suppressHydrationWarning: true,
											className: "h-9 w-48 rounded-md border-0 bg-primary-container pl-8 pr-3 text-sm text-on-primary placeholder:text-on-primary/50 focus:w-64 focus:outline-none focus:ring-2 focus:ring-on-primary/30 lg:w-56"
										}),
										searchOpen && q.trim().length >= 2 && hits && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "absolute right-0 top-full z-50 mt-2 w-80 rounded-md border border-outline-variant bg-card p-2 text-on-surface shadow-xl",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SearchResults, {
												hits,
												onPick: () => setSearchOpen(false)
											})
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/guide",
									className: "hidden md:block",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "nav",
										size: "icon",
										"aria-label": "Help",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleHelp, {})
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/notifications",
									className: "relative",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "nav",
										size: "icon",
										"aria-label": "Notifications",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, {})
									}), unread > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/access",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "nav",
										size: "sm",
										className: "hidden sm:inline-flex",
										children: profile ? `${profile.firstName}` : "Sign In"
									})
								})
							]
						})
					]
				})
			}),
			(previewActive || previewExpired) && !isPro && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: cn("fixed inset-x-0 top-16 z-30 flex items-center justify-center gap-3 px-3 py-1.5 text-xs font-semibold md:top-20", previewExpired ? "bg-destructive text-on-primary" : "bg-secondary text-on-secondary"),
				children: previewExpired ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: ["Preview expired", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/subscription",
					className: "underline",
					children: "Upgrade to Pro"
				})] }) : "Preview Mode Active — 5-minute trial"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sheet, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SheetContent, {
					side: "left",
					className: "bg-primary p-0 text-on-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 border-b border-on-primary/10 px-4 py-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/favicon.svg",
							alt: "",
							className: "h-9 w-9 rounded-sm"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold",
							children: "Planning Hub"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
						className: "flex flex-col p-2",
						children: NAV.concat(MORE.map((m) => ({
							to: m.to,
							label: m.label
						}))).map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: n.to,
							onClick: () => setOpen(false),
							className: "rounded-md px-3 py-3 text-sm font-medium hover:bg-primary-container",
							children: n.label
						}, n.to))
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
				className: cn(fullBleed ? "pt-16 md:pt-20" : "mx-auto max-w-[1400px] px-3 pb-16 pt-20 md:px-6 md:pt-24", (previewActive || previewExpired) && !isPro && (fullBleed ? "pt-24 md:pt-28" : "pt-24 md:pt-28")),
				children
			}),
			!fullBleed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteFooter, {})
		]
	});
}
function SearchResults({ hits, onPick }) {
	if (!hits.parcels.length && !hits.docs.length && !hits.codes.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "p-3 text-sm text-muted-foreground",
		children: "No matches."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-h-80 overflow-auto text-sm",
		children: [
			hits.parcels.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/parcels/$id",
				params: { id: p.id },
				onClick: onPick,
				className: "block rounded-sm px-2 py-2 hover:bg-surface-low",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-medium",
					children: p.address
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs text-muted-foreground",
					children: [
						p.municipality,
						" · ",
						p.zoning
					]
				})]
			}, p.id)),
			hits.docs.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/documents",
				onClick: onPick,
				className: "block rounded-sm px-2 py-2 hover:bg-surface-low",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-medium",
					children: d.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "text-xs text-muted-foreground",
					children: ["Document · ", d.county]
				})]
			}, d.id)),
			hits.codes.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
				to: "/zoning",
				onClick: onPick,
				className: "block rounded-sm px-2 py-2 hover:bg-surface-low",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "font-medium",
					children: c.section
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "text-xs text-muted-foreground",
					children: c.municipality
				})]
			}, c.id))
		]
	});
}
function SiteFooter() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
		className: "border-t border-outline-variant bg-surface-low",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto grid max-w-[1400px] gap-8 px-4 py-10 md:grid-cols-4 md:px-6",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant",
					children: "County Resources"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "hover:text-primary-container",
							href: "https://www.ycpc.org/",
							target: "_blank",
							rel: "noreferrer",
							children: "York County"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "hover:text-primary-container",
							href: "https://www.cumberlandcountypa.gov/120/Planning-Department",
							target: "_blank",
							rel: "noreferrer",
							children: "Cumberland County"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "hover:text-primary-container",
							href: "https://www.tcrpc-pa.org/dcpc-about",
							target: "_blank",
							rel: "noreferrer",
							children: "Dauphin County"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "hover:text-primary-container",
							href: "https://lancastercountyplanning.org/",
							target: "_blank",
							rel: "noreferrer",
							children: "Lancaster County"
						}) })
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant",
					children: "Contact Us"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Field Acq Team" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "hover:text-primary-container",
							href: "mailto:admin@fieldacq.com",
							children: "admin@fieldacq.com"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"Visit our Home Page at",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "hover:text-primary-container",
								href: "https://fieldacq.online",
								target: "_blank",
								rel: "noreferrer",
								children: "Fieldacq.online"
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
							"and our GC CRM at",
							" ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
								className: "hover:text-primary-container",
								href: "https://fieldacq.com",
								target: "_blank",
								rel: "noreferrer",
								children: "Fieldacq.com"
							})
						] })
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-xs font-bold uppercase tracking-wider text-on-surface-variant",
					children: "Legal"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "space-y-2 text-sm",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/privacy",
							className: "hover:text-primary-container",
							children: "Privacy Policy"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/terms",
							className: "hover:text-primary-container",
							children: "Terms of Use"
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/guide",
							className: "hover:text-primary-container",
							children: "Help & Support"
						}) })
					]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-end",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/logo.png",
						alt: "",
						className: "h-8 w-8 rounded-sm object-cover opacity-50 grayscale"
					})
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "border-t border-outline-variant py-3 text-center text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant",
			children: "© 2026 Susquehanna Valley Planning Hub. All Rights Reserved."
		})]
	});
}
function StatusBadge({ status }) {
	const variant = status === "Lead" ? "lead" : status === "Permitting" ? "permitting" : status === "Approved" ? "approved" : "diligence";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex"),
		children: status && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StatusInner, {
			v: variant,
			s: status
		})
	});
}
function StatusInner({ v, s }) {
	const cls = {
		lead: "bg-primary-fixed text-on-primary-fixed",
		permitting: "bg-secondary-container text-on-secondary-container",
		approved: "bg-secondary text-on-secondary",
		diligence: "bg-surface-highest text-on-surface"
	}[v];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("rounded-sm px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider", cls),
		children: s
	});
}
//#endregion
export { initials as C, getParcel as S, ZONE_META as _, COUNTY_CENTERS as a, formatAcres as b, MEETINGS as c, PRICE_SERIES as d, RENO_2026 as f, ZONE_LEGEND as g, TEAM as h, COUNTIES as i, PARCELS as l, StatusBadge as m, BRIDGES as n, DOCUMENTS as o, SEED_PROJECTS as p, Button as r, IMPROVEMENTS as s, AppShell as t, PERMIT_VOLUME as u, ZONING_CODES as v, useHub as w, formatFullMoney as x, cn as y };
