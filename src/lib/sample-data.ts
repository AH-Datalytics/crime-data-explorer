// Sample/fallback data for development and when API is unavailable
import type { CrimeSummary, StateMapData, DemographicBreakdown } from "./types";

export const SAMPLE_NATIONAL_TREND: CrimeSummary[] = Array.from({ length: 39 }, (_, i) => {
  const year = 1985 + i;
  const base = 1800000;
  // Crime peaked in early 90s, dropped steadily, slight uptick 2020
  const cycleFactor = year < 1992
    ? 1 + (year - 1985) * 0.04
    : year < 2015
      ? 1.28 - (year - 1992) * 0.025
      : year < 2020
        ? 0.7 + (year - 2015) * 0.01
        : year < 2023
          ? 0.75 + (year - 2020) * 0.02
          : 0.72;
  const violent = Math.round(base * cycleFactor * (0.95 + Math.random() * 0.1));
  const pop = 240_000_000 + (year - 1985) * 2_500_000;
  return {
    year,
    population: pop,
    violent_crime: violent,
    homicide: Math.round(violent * 0.008),
    rape_revised: Math.round(violent * 0.07),
    robbery: Math.round(violent * 0.22),
    aggravated_assault: Math.round(violent * 0.55),
    property_crime: Math.round(violent * 4.2),
    burglary: Math.round(violent * 1.2),
    larceny: Math.round(violent * 2.5),
    motor_vehicle_theft: Math.round(violent * 0.5),
    arson: Math.round(violent * 0.04),
  };
});

export const SAMPLE_STATE_MAP: StateMapData[] = [
  { state_abbr: "CA", state_name: "California", value: 174026, rate: 442, population: 39350000 },
  { state_abbr: "TX", state_name: "Texas", value: 126320, rate: 422, population: 29946000 },
  { state_abbr: "FL", state_name: "Florida", value: 83850, rate: 384, population: 21830000 },
  { state_abbr: "NY", state_name: "New York", value: 74500, rate: 364, population: 20440000 },
  { state_abbr: "IL", state_name: "Illinois", value: 50200, rate: 404, population: 12430000 },
  { state_abbr: "PA", state_name: "Pennsylvania", value: 42300, rate: 326, population: 12970000 },
  { state_abbr: "OH", state_name: "Ohio", value: 37800, rate: 321, population: 11770000 },
  { state_abbr: "GA", state_name: "Georgia", value: 38500, rate: 357, population: 10800000 },
  { state_abbr: "NC", state_name: "North Carolina", value: 36200, rate: 343, population: 10560000 },
  { state_abbr: "MI", state_name: "Michigan", value: 45100, rate: 450, population: 10020000 },
  { state_abbr: "NJ", state_name: "New Jersey", value: 22000, rate: 236, population: 9320000 },
  { state_abbr: "VA", state_name: "Virginia", value: 19500, rate: 227, population: 8600000 },
  { state_abbr: "WA", state_name: "Washington", value: 26800, rate: 349, population: 7690000 },
  { state_abbr: "AZ", state_name: "Arizona", value: 31000, rate: 425, population: 7300000 },
  { state_abbr: "MA", state_name: "Massachusetts", value: 25800, rate: 366, population: 7050000 },
  { state_abbr: "TN", state_name: "Tennessee", value: 45600, rate: 653, population: 6990000 },
  { state_abbr: "IN", state_name: "Indiana", value: 26100, rate: 384, population: 6800000 },
  { state_abbr: "MO", state_name: "Missouri", value: 35200, rate: 573, population: 6150000 },
  { state_abbr: "MD", state_name: "Maryland", value: 28000, rate: 454, population: 6170000 },
  { state_abbr: "WI", state_name: "Wisconsin", value: 19800, rate: 339, population: 5840000 },
  { state_abbr: "CO", state_name: "Colorado", value: 23500, rate: 406, population: 5800000 },
  { state_abbr: "MN", state_name: "Minnesota", value: 14800, rate: 261, population: 5670000 },
  { state_abbr: "SC", state_name: "South Carolina", value: 28400, rate: 549, population: 5170000 },
  { state_abbr: "AL", state_name: "Alabama", value: 28500, rate: 572, population: 4980000 },
  { state_abbr: "LA", state_name: "Louisiana", value: 26200, rate: 564, population: 4650000 },
  { state_abbr: "KY", state_name: "Kentucky", value: 10300, rate: 230, population: 4480000 },
  { state_abbr: "OR", state_name: "Oregon", value: 12900, rate: 307, population: 4200000 },
  { state_abbr: "OK", state_name: "Oklahoma", value: 17900, rate: 450, population: 3980000 },
  { state_abbr: "CT", state_name: "Connecticut", value: 8200, rate: 228, population: 3600000 },
  { state_abbr: "UT", state_name: "Utah", value: 8600, rate: 261, population: 3300000 },
  { state_abbr: "IA", state_name: "Iowa", value: 9100, rate: 286, population: 3180000 },
  { state_abbr: "NV", state_name: "Nevada", value: 17200, rate: 551, population: 3120000 },
  { state_abbr: "AR", state_name: "Arkansas", value: 18400, rate: 608, population: 3020000 },
  { state_abbr: "MS", state_name: "Mississippi", value: 8100, rate: 275, population: 2950000 },
  { state_abbr: "KS", state_name: "Kansas", value: 12100, rate: 413, population: 2930000 },
  { state_abbr: "NM", state_name: "New Mexico", value: 15600, rate: 740, population: 2110000 },
  { state_abbr: "NE", state_name: "Nebraska", value: 5900, rate: 303, population: 1950000 },
  { state_abbr: "ID", state_name: "Idaho", value: 4100, rate: 215, population: 1910000 },
  { state_abbr: "WV", state_name: "West Virginia", value: 5600, rate: 316, population: 1770000 },
  { state_abbr: "HI", state_name: "Hawaii", value: 3800, rate: 268, population: 1420000 },
  { state_abbr: "NH", state_name: "New Hampshire", value: 2200, rate: 161, population: 1370000 },
  { state_abbr: "ME", state_name: "Maine", value: 1700, rate: 126, population: 1350000 },
  { state_abbr: "MT", state_name: "Montana", value: 4100, rate: 374, population: 1100000 },
  { state_abbr: "RI", state_name: "Rhode Island", value: 2400, rate: 220, population: 1090000 },
  { state_abbr: "DE", state_name: "Delaware", value: 5200, rate: 527, population: 987000 },
  { state_abbr: "SD", state_name: "South Dakota", value: 4300, rate: 483, population: 890000 },
  { state_abbr: "ND", state_name: "North Dakota", value: 2800, rate: 362, population: 775000 },
  { state_abbr: "AK", state_name: "Alaska", value: 6100, rate: 838, population: 728000 },
  { state_abbr: "DC", state_name: "District of Columbia", value: 5100, rate: 743, population: 686000 },
  { state_abbr: "VT", state_name: "Vermont", value: 1300, rate: 200, population: 645000 },
  { state_abbr: "WY", state_name: "Wyoming", value: 1300, rate: 224, population: 580000 },
];

export const SAMPLE_BIAS_CATEGORIES: DemographicBreakdown[] = [
  { category: "Anti-Black", value: 3032, percentage: 35.5 },
  { category: "Anti-Jewish", value: 1124, percentage: 13.2 },
  { category: "Anti-White", value: 807, percentage: 9.5 },
  { category: "Anti-Gay (Male)", value: 786, percentage: 9.2 },
  { category: "Anti-Hispanic", value: 652, percentage: 7.6 },
  { category: "Anti-Asian", value: 421, percentage: 4.9 },
  { category: "Anti-Transgender", value: 283, percentage: 3.3 },
  { category: "Anti-Arab", value: 189, percentage: 2.2 },
  { category: "Other", value: 1241, percentage: 14.5 },
];

export const SAMPLE_WEAPONS: DemographicBreakdown[] = [
  { category: "Handgun", value: 7032, percentage: 45.2 },
  { category: "Firearm (type unknown)", value: 3124, percentage: 20.1 },
  { category: "Knife/Cutting", value: 1607, percentage: 10.3 },
  { category: "Personal Weapons", value: 986, percentage: 6.3 },
  { category: "Rifle", value: 455, percentage: 2.9 },
  { category: "Blunt Object", value: 393, percentage: 2.5 },
  { category: "Shotgun", value: 203, percentage: 1.3 },
  { category: "Other/Unknown", value: 1760, percentage: 11.3 },
];

export const SAMPLE_ARREST_TREND = Array.from({ length: 24 }, (_, i) => {
  const year = 2000 + i;
  const base = 700000;
  const factor = year < 2007 ? 1.0 : year < 2015 ? 1.0 - (year - 2007) * 0.02 : 0.84 - (year - 2015) * 0.01;
  return {
    year,
    total_arrests: Math.round(base * factor),
    drug_abuse: Math.round(base * factor * 0.24),
    dui: Math.round(base * factor * 0.15),
    simple_assault: Math.round(base * factor * 0.18),
  };
});

export const SAMPLE_HATE_CRIME_TREND = Array.from({ length: 24 }, (_, i) => {
  const year = 2000 + i;
  const base = 7000;
  const factor = year < 2015 ? 0.85 + Math.random() * 0.1 : 1.0 + (year - 2015) * 0.06;
  return {
    year,
    incidents: Math.round(base * factor),
    offenses: Math.round(base * factor * 1.2),
    victims: Math.round(base * factor * 1.3),
  };
});

export const SAMPLE_HOMICIDE_TREND = Array.from({ length: 24 }, (_, i) => {
  const year = 2000 + i;
  const base = 15000;
  const factor = year < 2014 ? 1.0 - (year - 2000) * 0.015 : 0.79 + (year - 2014) * 0.03;
  return {
    year,
    homicides: Math.round(base * factor),
    male_victims: Math.round(base * factor * 0.78),
    female_victims: Math.round(base * factor * 0.22),
  };
});
