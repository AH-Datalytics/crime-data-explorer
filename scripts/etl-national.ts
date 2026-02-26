/**
 * ETL script to pre-fetch national + state crime data from FBI CDE API.
 * Run: npx tsx scripts/etl-national.ts
 *
 * Output: public/data/generated/*.json
 */

import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const CDE_BASE = "https://cde.ucr.cjis.gov/LATEST";
const OUT_DIR = join(__dirname, "..", "public", "data", "generated");

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

const CRIME_TYPES = [
  "violent-crime", "property-crime", "homicide", "rape-revised",
  "robbery", "aggravated-assault", "burglary", "larceny", "motor-vehicle-theft", "arson",
];

async function fetchJSON(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.json();
}

function save(filename: string, data: unknown) {
  writeFileSync(join(OUT_DIR, filename), JSON.stringify(data));
  console.log(`  ✓ ${filename}`);
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });
  const timestamp = new Date().toISOString();

  console.log("Fetching national estimates...");
  for (const ct of CRIME_TYPES) {
    try {
      const data = await fetchJSON(
        `${CDE_BASE}/estimate/national/${ct}?startYear=1985&endYear=2023`,
      );
      save(`national-${ct}.json`, { generated_at: timestamp, data });
    } catch (e) {
      console.error(`  ✗ national-${ct}: ${e}`);
    }
  }

  console.log("\nFetching state estimates (violent-crime + property-crime)...");
  const stateData: Record<string, unknown> = {};
  for (const state of STATES) {
    try {
      const data = await fetchJSON(
        `${CDE_BASE}/estimate/state/${state}/violent-crime?startYear=1985&endYear=2023`,
      );
      stateData[state] = data;
      process.stdout.write(`.`);
    } catch {
      process.stdout.write(`x`);
    }
    // Rate limit
    await new Promise((r) => setTimeout(r, 200));
  }
  console.log();
  save("state-violent-crime.json", { generated_at: timestamp, data: stateData });

  console.log("\nFetching hate crime national...");
  try {
    const data = await fetchJSON(`${CDE_BASE}/hate-crime/national?startYear=2000&endYear=2023`);
    save("national-hate-crime.json", { generated_at: timestamp, data });
  } catch (e) {
    console.error(`  ✗ hate-crime: ${e}`);
  }

  console.log("\nFetching arrest national...");
  try {
    const data = await fetchJSON(`${CDE_BASE}/arrest/national?startYear=2000&endYear=2023`);
    save("national-arrests.json", { generated_at: timestamp, data });
  } catch (e) {
    console.error(`  ✗ arrests: ${e}`);
  }

  console.log("\nFetching homicide (SHR) national...");
  try {
    const data = await fetchJSON(`${CDE_BASE}/shr/national?startYear=2000&endYear=2023`);
    save("national-homicide.json", { generated_at: timestamp, data });
  } catch (e) {
    console.error(`  ✗ homicide: ${e}`);
  }

  console.log("\nDone!");
}

main().catch(console.error);
