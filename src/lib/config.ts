export const SITE_NAME = "Crime Data Explorer";
export const SITE_DESCRIPTION =
  "Search, visualize, and download FBI crime data across the United States";

export const FBI_API_BASE = "https://api.usa.gov/crime/fbi/cde";
export const FBI_CDE_BASE = "https://cde.ucr.cjis.gov/LATEST";

export const NAV_ITEMS = [
  { label: "Overview", href: "/" },
  { label: "Crime Trends", href: "/crime" },
  { label: "Arrests", href: "/arrests" },
  { label: "Hate Crime", href: "/hate-crime" },
  { label: "Expanded Homicide", href: "/homicide" },
  { label: "Agencies", href: "/agencies" },
  { label: "State Map", href: "/map" },
  { label: "About", href: "/about" },
] as const;

export const COLORS = {
  primary: "#01396C",
  primaryLight: "#1565c0",
  background: "#faf9f6",
  surface: "#ffffff",
  muted: "#f5f5f0",
  border: "#e8e8e8",
  borderStrong: "#d4d4d4",
  textPrimary: "#01396C",
  textBody: "#666666",
  textMuted: "#999999",
  increase: "#c62828",
  decrease: "#1565c0",
  neutral: "#666666",
  chart1: "#01396C",
  chart2: "#1565c0",
  chart3: "#c62828",
  chart4: "#65bc7b",
  chart5: "#7a5c00",
} as const;

export const CHART_COLORS = [
  COLORS.chart1,
  COLORS.chart2,
  COLORS.chart3,
  COLORS.chart4,
  COLORS.chart5,
];

// ---- Crime Type Taxonomy ----

export interface CrimeTypeOption {
  value: string;
  label: string;
}

export interface CrimeTypeGroup {
  label: string;
  types: CrimeTypeOption[];
}

export const CRIME_TYPE_GROUPS: CrimeTypeGroup[] = [
  {
    label: "Violent Crime",
    types: [
      { value: "violent-crime", label: "Violent Crime (Total)" },
      { value: "homicide", label: "Homicide" },
      { value: "rape-legacy", label: "Rape" },
      { value: "robbery", label: "Robbery" },
      { value: "aggravated-assault", label: "Aggravated Assault" },
    ],
  },
  {
    label: "Property Crime",
    types: [
      { value: "property-crime", label: "Property Crime (Total)" },
      { value: "burglary", label: "Burglary" },
      { value: "larceny", label: "Larceny" },
      { value: "motor-vehicle-theft", label: "Motor Vehicle Theft" },
      { value: "arson", label: "Arson" },
    ],
  },
  {
    label: "Individual Offenses",
    types: [
      { value: "human-trafficing", label: "Human Trafficking" },
      { value: "gambling", label: "Gambling" },
      { value: "drug-abuse", label: "Drug Abuse Violations" },
      { value: "weapons", label: "Weapons Violations" },
      { value: "prostitution", label: "Prostitution" },
      { value: "sex-offenses", label: "Sex Offenses" },
      { value: "forgery", label: "Forgery & Counterfeiting" },
      { value: "fraud", label: "Fraud" },
      { value: "embezzlement", label: "Embezzlement" },
      { value: "stolen-property", label: "Stolen Property" },
      { value: "vandalism", label: "Vandalism" },
      { value: "dui", label: "DUI" },
      { value: "liquor-laws", label: "Liquor Law Violations" },
      { value: "drunkenness", label: "Drunkenness" },
      { value: "disorderly-conduct", label: "Disorderly Conduct" },
      { value: "vagrancy", label: "Vagrancy" },
      { value: "suspicion", label: "Suspicion" },
      { value: "curfew", label: "Curfew Violations" },
      { value: "runaway", label: "Runaways" },
    ],
  },
];

// Flat list of all crime types
export const ALL_CRIME_TYPES: CrimeTypeOption[] = CRIME_TYPE_GROUPS.flatMap((g) => g.types);

// Quick label lookup
export function getCrimeTypeLabel(value: string): string {
  const found = ALL_CRIME_TYPES.find((t) => t.value === value);
  return found?.label ?? value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
