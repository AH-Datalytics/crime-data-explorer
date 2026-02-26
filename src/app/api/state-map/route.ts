import { NextRequest, NextResponse } from "next/server";
import { parseSummarizedResponse } from "@/lib/parse-cde";

const CDE_BASE = "https://cde.ucr.cjis.gov/LATEST";

const STATE_ABBRS = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

const STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "District of Columbia",
};

// GET /api/state-map?crime=violent-crime&year=2024
// Fetches the most recent year of data for all 51 states
export async function GET(request: NextRequest) {
  const crime = request.nextUrl.searchParams.get("crime") || "violent-crime";
  const year = request.nextUrl.searchParams.get("year") || "2024";
  const yearNum = parseInt(year);

  try {
    const results = await Promise.allSettled(
      STATE_ABBRS.map(async (abbr) => {
        const url = `${CDE_BASE}/summarized/state/${abbr}/${crime}?from=01-${yearNum}&to=12-${yearNum}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        const parsed = parseSummarizedResponse(data);
        const latest = parsed[parsed.length - 1];
        return latest
          ? {
              state_abbr: abbr,
              state_name: STATE_NAMES[abbr] || abbr,
              value: latest.count,
              rate: latest.rate,
              population: latest.population,
            }
          : null;
      }),
    );

    const mapData = results
      .map((r) => (r.status === "fulfilled" ? r.value : null))
      .filter(Boolean);

    return NextResponse.json(mapData, {
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch state map data" },
      { status: 500 },
    );
  }
}
