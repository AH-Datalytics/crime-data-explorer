// ---- FBI CDE API Response Types ----

export interface StateInfo {
  state_abbr: string;
  state_name: string;
  state_id: number;
}

export interface CrimeSummary {
  year: number;
  state_abbr?: string;
  population: number;
  violent_crime: number;
  homicide: number;
  rape_revised: number;
  robbery: number;
  aggravated_assault: number;
  property_crime: number;
  burglary: number;
  larceny: number;
  motor_vehicle_theft: number;
  arson?: number;
}

export interface CrimeRate extends CrimeSummary {
  violent_crime_rate: number;
  property_crime_rate: number;
  homicide_rate: number;
}

export interface ArrestData {
  year: number;
  state_abbr?: string;
  total_arrests: number;
  drug_abuse: number;
  dui: number;
  simple_assault: number;
  larceny_theft: number;
  disorderly_conduct: number;
}

export interface ArrestDemographic {
  year: number;
  key: string;
  value: number;
  arrest_type?: string;
}

export interface HateCrimeIncident {
  year: number;
  state_abbr?: string;
  incident_count: number;
  offense_count: number;
  victim_count: number;
  bias_category: string;
}

export interface HateCrimeBias {
  bias: string;
  count: number;
  year: number;
}

export interface HomicideData {
  year: number;
  state_abbr?: string;
  homicide_count: number;
  weapon?: string;
  circumstance?: string;
  relationship?: string;
  victim_sex?: string;
  victim_race?: string;
  victim_age?: string;
  offender_sex?: string;
  offender_race?: string;
  offender_age?: string;
}

export interface AgencyInfo {
  ori: string;
  agency_name: string;
  agency_type_name: string;
  state_abbr: string;
  county_name: string;
  population: number;
}

// ---- App-level Types ----

export interface KPIMetric {
  label: string;
  value: number;
  previousValue?: number;
  format?: "number" | "rate" | "percent";
  invertColor?: boolean; // true = up is good (not typical for crime)
}

export interface DomainCard {
  title: string;
  description: string;
  href: string;
  icon: string;
  kpi?: KPIMetric;
}

export interface FilterState {
  stateAbbr: string | null;
  startYear: number;
  endYear: number;
  crimeType: string;
}

export interface ChartDataPoint {
  year: number;
  value: number;
  rate?: number;
  label?: string;
}

export interface DemographicBreakdown {
  category: string;
  value: number;
  percentage: number;
}

export interface StateMapData {
  state_abbr: string;
  state_name: string;
  value: number;
  rate: number;
  population: number;
}

// ---- Pre-fetched Data File Types ----

export interface NationalSummaryFile {
  generated_at: string;
  data: CrimeSummary[];
}

export interface StateSummaryFile {
  generated_at: string;
  data: Record<string, CrimeSummary[]>;
}

export interface RefreshDate {
  date: string;
  source: string;
}
