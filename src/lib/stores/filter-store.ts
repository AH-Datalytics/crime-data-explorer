import { create } from "zustand";

interface FilterStore {
  stateAbbr: string | null;
  startYear: number;
  endYear: number;
  crimeType: string;
  agencyOri: string | null;
  agencySearch: string;
  setStateAbbr: (v: string | null) => void;
  setStartYear: (v: number) => void;
  setEndYear: (v: number) => void;
  setCrimeType: (v: string) => void;
  setAgencyOri: (v: string | null) => void;
  setAgencySearch: (v: string) => void;
  resetFilters: () => void;
}

const DEFAULTS = {
  stateAbbr: null as string | null,
  startYear: 1985,
  endYear: 2023,
  crimeType: "violent-crime",
  agencyOri: null as string | null,
  agencySearch: "",
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...DEFAULTS,
  setStateAbbr: (v) => set({ stateAbbr: v, agencyOri: null, agencySearch: "" }),
  setStartYear: (v) => set({ startYear: v }),
  setEndYear: (v) => set({ endYear: v }),
  setCrimeType: (v) => set({ crimeType: v }),
  setAgencyOri: (v) => set({ agencyOri: v }),
  setAgencySearch: (v) => set({ agencySearch: v }),
  resetFilters: () => set(DEFAULTS),
}));
