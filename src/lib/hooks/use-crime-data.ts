import useSWR from "swr";
import { FBI_API_BASE, FBI_CDE_BASE } from "../config";
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

// ---- Agency hooks (via Next.js API proxy to avoid CORS) ----

function agencyListFetcher(url: string): Promise<AgencyListItem[]> {
  return fetch(url).then((r) => r.json()).then((data) => {
    if (!Array.isArray(data)) return [];
    return data.map((a: Record<string, unknown>) => ({
      ori: String(a.ori ?? ""),
      agency_name: String(a.agency_name ?? ""),
      agency_type_name: String(a.agency_type_name ?? ""),
      state_abbr: String(a.state_abbr ?? ""),
      state_name: String(a.state_name ?? ""),
      county_name: String(a.counties ?? a.county_name ?? ""),
      division_name: String(a.division_name ?? ""),
      region_name: String(a.region_name ?? ""),
      region_desc: String(a.region_desc ?? ""),
      nibrs: Boolean(a.is_nibrs ?? a.nibrs ?? false),
      latitude: Number(a.latitude ?? 0),
      longitude: Number(a.longitude ?? 0),
    }));
  });
}

// Fetch agencies for one state (via proxy)
export function useCDEAgenciesByState(stateAbbr: string | null) {
  return useSWR<AgencyListItem[]>(
    stateAbbr ? `/api/agencies?state=${stateAbbr}` : null,
    agencyListFetcher,
    { revalidateOnFocus: false, dedupingInterval: 3600000 },
  );
}

// Fetch ALL agencies across all states (via proxy)
export function useAllAgencies() {
  return useSWR<AgencyListItem[]>(
    `/api/agencies?state=all`,
    agencyListFetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 3600000,
      revalidateOnReconnect: false,
    },
  );
}

// Agency crime data via proxy
export function useAgencyCrimeCDE(
  ori: string | null,
  crimeType: string = "violent-crime",
  startYear: number = 2015,
  endYear: number = 2023,
) {
  return useSWR(
    ori
      ? `/api/agency-crime?ori=${ori}&type=${crimeType}&from=${startYear}&to=${endYear}`
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
