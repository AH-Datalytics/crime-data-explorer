import { NextRequest, NextResponse } from "next/server";

const CDE_BASE = "https://cde.ucr.cjis.gov/LATEST";

// Proxy CDE agency requests to avoid CORS issues
// GET /api/agencies?state=LA  → agencies for Louisiana
// GET /api/agencies?state=all → agencies for all states
export async function GET(request: NextRequest) {
  const state = request.nextUrl.searchParams.get("state");

  if (!state) {
    return NextResponse.json({ error: "state parameter required" }, { status: 400 });
  }

  try {
    if (state === "all") {
      // Fetch all states in parallel
      const stateAbbrs = [
        "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
        "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
        "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
        "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
        "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
      ];

      const results = await Promise.allSettled(
        stateAbbrs.map(async (abbr) => {
          const res = await fetch(`${CDE_BASE}/agency/byStateAbbr/${abbr}`);
          if (!res.ok) return [];
          const data = await res.json();
          return flattenAgencies(data);
        }),
      );

      const all = results.flatMap((r) => (r.status === "fulfilled" ? r.value : []));
      return NextResponse.json(all, {
        headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
      });
    }

    // Single state
    const res = await fetch(`${CDE_BASE}/agency/byStateAbbr/${state}`);
    if (!res.ok) {
      return NextResponse.json(
        { error: `CDE API error: ${res.status}` },
        { status: res.status },
      );
    }
    const data = await res.json();
    const agencies = flattenAgencies(data);
    return NextResponse.json(agencies, {
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch agencies" },
      { status: 500 },
    );
  }
}

interface AgencyRaw {
  ori: string;
  agency_name: string;
  agency_type_name: string;
  state_abbr: string;
  state_name: string;
  counties: string;
  is_nibrs: boolean;
  latitude: number;
  longitude: number;
}

function flattenAgencies(data: Record<string, AgencyRaw[]>): AgencyRaw[] {
  if (!data || typeof data !== "object") return [];
  const result: AgencyRaw[] = [];
  for (const agencies of Object.values(data)) {
    if (!Array.isArray(agencies)) continue;
    result.push(...agencies);
  }
  return result;
}
