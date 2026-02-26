import useSWR from "swr";
import { FBI_API_BASE, FBI_CDE_BASE } from "../config";
import { STATE_ABBRS } from "../us-states";
import type { AgencyListItem } from "../types";

const API_KEY = process.env.NEXT_PUBLIC_FBI_CDE_API_KEY || "";
const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useNationalEstimates(crimeType: string, startYear: number, endYear: number) {
  return useSWR(
    `${FBI_CDE_BASE}/estimate/national/${crimeType}?startYear=${startYear}&endYear=${endYear}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 900000 },
  );
}

export function useStateEstimates(stateAbbr: string | null, crimeType: string, startYear: number, endYear: number) {
  return useSWR(
    stateAbbr
      ? `${FBI_CDE_BASE}/estimate/state/${stateAbbr}/${crimeType}?startYear=${startYear}&endYear=${endYear}`
      : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 900000 },
  );
}

export function useArrestData(scope: string = "national", startYear: number = 2000, endYear: number = 2023) {
  return useSWR(
    `${FBI_CDE_BASE}/arrest/${scope}?startYear=${startYear}&endYear=${endYear}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 900000 },
  );
}

export function useHateCrimeData(scope: string = "national", startYear: number = 2000, endYear: number = 2023) {
  return useSWR(
    `${FBI_CDE_BASE}/hate-crime/${scope}?startYear=${startYear}&endYear=${endYear}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 900000 },
  );
}

export function useHomicideData(scope: string = "national", startYear: number = 2000, endYear: number = 2023) {
  return useSWR(
    `${FBI_CDE_BASE}/shr/${scope}?startYear=${startYear}&endYear=${endYear}`,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 900000 },
  );
}

export function useStates() {
  return useSWR(`${FBI_CDE_BASE}/lookup/states`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 3600000,
  });
}

export function useRefreshDate() {
  return useSWR(`${FBI_CDE_BASE}/refresh-date`, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 3600000,
  });
}

// ---- Agency hooks (CDE — no auth) ----

// Flatten the CDE agency response { COUNTY: [agencies...] } into a flat array
function flattenCDEAgencies(data: unknown): AgencyListItem[] {
  if (!data || typeof data !== "object") return [];
  const result: AgencyListItem[] = [];
  for (const [county, agencies] of Object.entries(data as Record<string, unknown>)) {
    if (!Array.isArray(agencies)) continue;
    for (const a of agencies) {
      result.push({
        ori: a.ori ?? "",
        agency_name: a.agency_name ?? "",
        agency_type_name: a.agency_type_name ?? "",
        state_abbr: a.state_abbr ?? "",
        state_name: a.state_name ?? "",
        county_name: county,
        division_name: a.division_name ?? "",
        region_name: a.region_name ?? "",
        region_desc: a.region_desc ?? "",
        nibrs: a.is_nibrs ?? false,
        latitude: a.latitude ?? 0,
        longitude: a.longitude ?? 0,
      });
    }
  }
  return result;
}

// Fetch agencies for one state via CDE (no auth)
export function useCDEAgenciesByState(stateAbbr: string | null) {
  const { data, ...rest } = useSWR(
    stateAbbr ? `${FBI_CDE_BASE}/agency/byStateAbbr/${stateAbbr}` : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 3600000 },
  );
  return { data: data ? flattenCDEAgencies(data) : undefined, ...rest };
}

// Multi-state agency fetcher for loading all agencies
const allAgenciesFetcher = async (): Promise<AgencyListItem[]> => {
  const results = await Promise.allSettled(
    STATE_ABBRS.map(async (abbr) => {
      const res = await fetch(`${FBI_CDE_BASE}/agency/byStateAbbr/${abbr}`);
      if (!res.ok) return [];
      const data = await res.json();
      return flattenCDEAgencies(data);
    }),
  );
  return results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
};

// Fetch ALL agencies across all states (cached heavily)
export function useAllAgencies() {
  return useSWR("all-agencies", allAgenciesFetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 3600000,
    revalidateOnReconnect: false,
  });
}

// Agency crime data via CDE (no auth, monthly)
export function useAgencyCrimeCDE(
  ori: string | null,
  crimeType: string = "violent-crime",
  startYear: number = 2015,
  endYear: number = 2023,
) {
  return useSWR(
    ori
      ? `${FBI_CDE_BASE}/summarized/agency/${ori}/${crimeType}?from=01-${startYear}&to=12-${endYear}`
      : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 900000 },
  );
}

// ---- Agency hooks (USA.gov — requires key) ----

export function useAgenciesByState(stateAbbr: string | null) {
  return useSWR(
    stateAbbr
      ? `${FBI_API_BASE}/agency/byStateAbbr/${stateAbbr}?API_KEY=${API_KEY}`
      : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 900000 },
  );
}

export function useAgencyCrime(
  ori: string | null,
  crimeType: string = "violent-crime",
  startYear: number = 1985,
  endYear: number = 2023,
) {
  return useSWR(
    ori
      ? `${FBI_API_BASE}/summarized/${ori}/${crimeType}?from=${startYear}&to=${endYear}&API_KEY=${API_KEY}`
      : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 900000 },
  );
}

export function useAgencyEmployment(
  ori: string | null,
  startYear: number = 2000,
  endYear: number = 2023,
) {
  return useSWR(
    ori
      ? `${FBI_API_BASE}/pe/agency/${ori}/byYearRange?from=${startYear}&to=${endYear}&API_KEY=${API_KEY}`
      : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 900000 },
  );
}
