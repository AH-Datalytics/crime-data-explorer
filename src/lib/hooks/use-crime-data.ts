import useSWR from "swr";
import type { AgencyListItem, YearlyAggregate, HateCrimeYearly } from "../types";
import { parseSummarizedResponse, parseHateCrimeResponse } from "../parse-cde";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// ---- Summarized crime data (national/state/agency) via proxy ----

export function useSummarized(
  scope: string,
  crimeType: string,
  startYear: number,
  endYear: number,
) {
  const key = `/api/summarized?scope=${encodeURIComponent(scope)}&crime=${crimeType}&from=${startYear}&to=${endYear}`;
  const { data: raw, error, isLoading } = useSWR(
    scope ? key : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 900000 },
  );

  const parsed: YearlyAggregate[] = raw ? parseSummarizedResponse(raw) : [];

  return { data: parsed, raw, error, isLoading };
}

// ---- Hate crime data via proxy ----

export function useHateCrime(
  scope: string,
  startYear: number,
  endYear: number,
) {
  const key = `/api/hate-crime?scope=${encodeURIComponent(scope)}&from=${startYear}&to=${endYear}`;
  const { data: raw, error, isLoading } = useSWR(
    scope ? key : null,
    fetcher,
    { revalidateOnFocus: false, dedupingInterval: 900000 },
  );

  const result = raw
    ? parseHateCrimeResponse(raw)
    : { yearly: [] as HateCrimeYearly[], biasCategories: [], offenseTypes: [] };

  return { data: result.yearly, biasCategories: result.biasCategories, offenseTypes: result.offenseTypes, raw, error, isLoading };
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
