import { FBI_API_BASE, FBI_CDE_BASE } from "./config";

const API_KEY = process.env.NEXT_PUBLIC_FBI_CDE_API_KEY || "";

class APIError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "APIError";
  }
}

async function fetchWithRetry(url: string, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url);
    if (res.ok) return res;
    if (res.status === 429 && i < retries - 1) {
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
      continue;
    }
    if (!res.ok) {
      throw new APIError(res.status, `FBI API error: ${res.status} ${res.statusText}`);
    }
  }
  throw new APIError(500, "Max retries exceeded");
}

// ---- USA.gov FBI API (requires API key) ----

export async function fetchCrimeSummary(
  scope: "national" | string,
  crimeType: string = "violent-crime",
  startYear: number = 1985,
  endYear: number = 2023,
) {
  const url = `${FBI_API_BASE}/summarized/${scope}/${crimeType}?from=${startYear}&to=${endYear}&API_KEY=${API_KEY}`;
  const res = await fetchWithRetry(url);
  return res.json();
}

export async function fetchAgenciesByState(stateAbbr: string) {
  const url = `${FBI_API_BASE}/agency/byStateAbbr/${stateAbbr}?API_KEY=${API_KEY}`;
  const res = await fetchWithRetry(url);
  return res.json();
}

// ---- CDE Internal API (no auth for most endpoints) ----

export async function fetchStates() {
  const res = await fetchWithRetry(`${FBI_CDE_BASE}/lookup/states`);
  return res.json();
}

export async function fetchOffenses() {
  const res = await fetchWithRetry(`${FBI_CDE_BASE}/lookup/offenses`);
  return res.json();
}

export async function fetchRefreshDate() {
  const res = await fetchWithRetry(`${FBI_CDE_BASE}/refresh-date`);
  return res.json();
}

// National estimates endpoints
export async function fetchNationalEstimates(
  crimeType: string = "violent-crime",
  startYear: number = 1985,
  endYear: number = 2023,
) {
  const url = `${FBI_CDE_BASE}/estimate/national/${crimeType}?startYear=${startYear}&endYear=${endYear}`;
  const res = await fetchWithRetry(url);
  return res.json();
}

// Arrest trends
export async function fetchArrestTrends(
  scope: "national" | string = "national",
  startYear: number = 2000,
  endYear: number = 2023,
) {
  const url = `${FBI_CDE_BASE}/arrest/${scope}?startYear=${startYear}&endYear=${endYear}`;
  const res = await fetchWithRetry(url);
  return res.json();
}

// Hate crime
export async function fetchHateCrime(
  scope: "national" | string = "national",
  startYear: number = 2000,
  endYear: number = 2023,
) {
  const url = `${FBI_CDE_BASE}/hate-crime/${scope}?startYear=${startYear}&endYear=${endYear}`;
  const res = await fetchWithRetry(url);
  return res.json();
}

// Supplemental homicide (SHR)
export async function fetchHomicideData(
  scope: "national" | string = "national",
  startYear: number = 2000,
  endYear: number = 2023,
) {
  const url = `${FBI_CDE_BASE}/shr/${scope}?startYear=${startYear}&endYear=${endYear}`;
  const res = await fetchWithRetry(url);
  return res.json();
}

// ---- Pre-fetched Data (from /data/generated/) ----

export async function fetchPrecomputedData<T>(filename: string): Promise<T> {
  const res = await fetch(`/data/generated/${filename}`);
  if (!res.ok) throw new Error(`Failed to load ${filename}`);
  return res.json();
}
