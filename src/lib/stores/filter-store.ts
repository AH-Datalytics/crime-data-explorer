import { create } from "zustand";

interface FilterStore {
  stateAbbr: string | null;
  startYear: number;
  endYear: number;
  crimeType: string;
  setStateAbbr: (v: string | null) => void;
  setStartYear: (v: number) => void;
  setEndYear: (v: number) => void;
  setCrimeType: (v: string) => void;
  resetFilters: () => void;
}

const DEFAULTS = {
  stateAbbr: null,
  startYear: 1985,
  endYear: 2023,
  crimeType: "violent-crime",
};

export const useFilterStore = create<FilterStore>((set) => ({
  ...DEFAULTS,
  setStateAbbr: (v) => set({ stateAbbr: v }),
  setStartYear: (v) => set({ startYear: v }),
  setEndYear: (v) => set({ endYear: v }),
  setCrimeType: (v) => set({ crimeType: v }),
  resetFilters: () => set(DEFAULTS),
}));
