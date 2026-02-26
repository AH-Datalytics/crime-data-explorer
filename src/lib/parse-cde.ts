// Centralized parser for FBI CDE API responses
// The /summarized/ endpoint returns monthly data in "MM-YYYY" format.
// This module aggregates that into yearly totals.

import type { YearlyAggregate, HateCrimeYearly } from "./types";

/**
 * Parse a CDE /summarized/ response into yearly aggregates.
 *
 * Actual response structure (verified from API):
 * {
 *   offenses: {
 *     rates: {
 *       "United States Offenses": { "01-2020": 29.04, ... },
 *       "United States Clearances": { "01-2020": 12.49, ... }
 *     },
 *     actuals: {
 *       "United States Offenses": { "01-2020": 93386, ... },
 *       "United States Clearances": { "01-2020": 40185, ... }
 *     }
 *   },
 *   populations: {
 *     population: { "United States": { "01-2020": 332726731, ... } },
 *     participated_population: { ... }
 *   }
 * }
 */
export function parseSummarizedResponse(raw: unknown): YearlyAggregate[] {
  if (!raw || typeof raw !== "object") return [];

  const data = raw as Record<string, unknown>;
  const offenses = (data.offenses ?? {}) as Record<string, unknown>;

  // The API uses "actuals" not "counts"
  const actuals = (offenses?.actuals ?? {}) as Record<string, Record<string, number>>;
  const rates = (offenses?.rates ?? {}) as Record<string, Record<string, number>>;

  // Population is nested under populations.population.{scope name}
  const populations = (data.populations ?? {}) as Record<string, unknown>;
  const populationContainer = (populations?.population ?? {}) as Record<string, Record<string, number>>;

  // Find offense keys (not clearances)
  const actualOffenseKey = findKey(actuals, "Offenses", "Clearances");
  const actualClearanceKey = findKey(actuals, "Clearances");
  const rateOffenseKey = findKey(rates, "Offenses", "Clearances");

  // Find population key (first key in the population container)
  const popKey = Object.keys(populationContainer)[0];
  const populationObj = popKey ? populationContainer[popKey] ?? {} : {};

  const monthlyCounts = actualOffenseKey ? actuals[actualOffenseKey] ?? {} : {};
  const monthlyClearances = actualClearanceKey ? actuals[actualClearanceKey] ?? {} : {};
  const monthlyRates = rateOffenseKey ? rates[rateOffenseKey] ?? {} : {};

  // Aggregate monthly into yearly
  const yearMap = new Map<number, {
    count: number;
    rateSum: number;
    rateMonths: number;
    clearances: number;
    popSum: number;
    popMonths: number;
  }>();

  const ensureYear = (year: number) => {
    if (!yearMap.has(year)) {
      yearMap.set(year, { count: 0, rateSum: 0, rateMonths: 0, clearances: 0, popSum: 0, popMonths: 0 });
    }
    return yearMap.get(year)!;
  };

  for (const [key, val] of Object.entries(monthlyCounts)) {
    const year = parseMonthYear(key);
    if (!year) continue;
    ensureYear(year).count += Number(val) || 0;
  }

  for (const [key, val] of Object.entries(monthlyRates)) {
    const year = parseMonthYear(key);
    if (!year) continue;
    const entry = ensureYear(year);
    entry.rateSum += Number(val) || 0;
    entry.rateMonths += 1;
  }

  for (const [key, val] of Object.entries(monthlyClearances)) {
    const year = parseMonthYear(key);
    if (!year) continue;
    ensureYear(year).clearances += Number(val) || 0;
  }

  for (const [key, val] of Object.entries(populationObj)) {
    const year = parseMonthYear(key);
    if (!year) continue;
    const entry = ensureYear(year);
    entry.popSum += Number(val) || 0;
    entry.popMonths += 1;
  }

  return Array.from(yearMap.entries())
    .map(([year, d]) => ({
      year,
      count: d.count,
      rate: d.rateMonths > 0 ? Math.round((d.rateSum / d.rateMonths) * 100) / 100 : 0,
      clearances: d.clearances,
      population: d.popMonths > 0 ? Math.round(d.popSum / d.popMonths) : 0,
    }))
    .sort((a, b) => a.year - b.year);
}

/**
 * Parse a CDE /hate-crime/ aggregate response.
 *
 * Actual response structure (verified from API):
 * {
 *   bias_section: {
 *     victim_type: { "Individual": 59835, ... },
 *     offense_type: { "Intimidation": 23576, ... },
 *     offender_race: { ... },
 *     ...
 *   },
 *   incident_section: {
 *     bias: { "Anti-Black or African American": 17382, ... },
 *     bias_category: { "Race/Ethnicity/Ancestry": 6460, ... }
 *   }
 * }
 *
 * NOTE: This endpoint returns aggregate totals, not monthly breakdowns.
 * Yearly trends must be built from per-year requests (done server-side).
 */
export function parseHateCrimeResponse(raw: unknown): {
  yearly: HateCrimeYearly[];
  biasCategories: { category: string; count: number }[];
  offenseTypes: { category: string; count: number }[];
} {
  if (!raw || typeof raw !== "object") {
    return { yearly: [], biasCategories: [], offenseTypes: [] };
  }

  const data = raw as Record<string, unknown>;

  // If this is a per-year aggregate response, yearly will be empty
  // (yearly trends come from the route handler making per-year requests)
  const yearly = (data._yearly ?? []) as HateCrimeYearly[];

  // Extract bias categories from incident_section.bias
  const incidentSection = (data.incident_section ?? {}) as Record<string, unknown>;
  const biasObj = (incidentSection.bias ?? {}) as Record<string, number>;
  const biasCategories = Object.entries(biasObj)
    .map(([category, count]) => ({ category, count: Number(count) || 0 }))
    .sort((a, b) => b.count - a.count);

  // Extract offense types from bias_section.offense_type
  const biasSection = (data.bias_section ?? {}) as Record<string, unknown>;
  const offenseTypeObj = (biasSection.offense_type ?? {}) as Record<string, number>;
  const offenseTypes = Object.entries(offenseTypeObj)
    .filter(([, count]) => count > 0)
    .map(([category, count]) => ({ category, count: Number(count) || 0 }))
    .sort((a, b) => b.count - a.count);

  return { yearly, biasCategories, offenseTypes };
}

// ---- Helpers ----

function parseMonthYear(key: string): number | null {
  const match = key.match(/(\d{2})-(\d{4})/);
  return match ? parseInt(match[2]) : null;
}

/** Find a key containing `include` but optionally NOT containing `exclude` */
function findKey(
  obj: Record<string, unknown>,
  include: string,
  exclude?: string,
): string | undefined {
  const keys = Object.keys(obj);
  if (exclude) {
    return keys.find((k) => k.includes(include) && !k.includes(exclude)) ?? keys.find((k) => k.includes(include));
  }
  return keys.find((k) => k.includes(include)) ?? keys[0];
}
