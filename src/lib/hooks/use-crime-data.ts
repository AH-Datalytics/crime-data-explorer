import useSWR from "swr";
import { FBI_CDE_BASE } from "../config";

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
