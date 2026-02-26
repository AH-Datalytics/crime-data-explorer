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
