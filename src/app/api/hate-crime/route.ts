import { NextRequest, NextResponse } from "next/server";

const CDE_BASE = "https://cde.ucr.cjis.gov/LATEST";

// Proxy CDE hate crime data to avoid CORS issues
// GET /api/hate-crime?scope=national&from=2015&to=2024
// This endpoint returns aggregate data for the full range PLUS
// per-year incident counts for building the trend chart.
export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope") || "national";
  const from = parseInt(request.nextUrl.searchParams.get("from") || "2015");
  const to = parseInt(request.nextUrl.searchParams.get("to") || "2024");

  try {
    // 1. Fetch aggregate data for the full range (for bias/offense breakdowns)
    const aggregateUrl = `${CDE_BASE}/hate-crime/${scope}?from=01-${from}&to=12-${to}`;
    const aggregateRes = await fetch(aggregateUrl);
    if (!aggregateRes.ok) {
      return NextResponse.json(
        { error: `CDE API error: ${aggregateRes.status}` },
        { status: aggregateRes.status },
      );
    }
    const aggregateData = await aggregateRes.json();

    // 2. Fetch per-year data for the trend chart
    const yearRequests = [];
    for (let y = from; y <= to; y++) {
      yearRequests.push(
        fetch(`${CDE_BASE}/hate-crime/${scope}?from=01-${y}&to=12-${y}`)
          .then(async (res) => {
            if (!res.ok) return null;
            const d = await res.json();
            const incidentSection = d?.incident_section?.bias_category ?? {};
            const biasSection = d?.bias_section ?? {};
            const incidents = Object.values(incidentSection).reduce(
              (sum: number, v) => sum + (Number(v) || 0), 0,
            );
            const offenseTypeObj = biasSection?.offense_type ?? {};
            const offenses = Object.values(offenseTypeObj).reduce(
              (sum: number, v) => sum + (Number(v) || 0), 0,
            );
            const victimTypeObj = biasSection?.victim_type ?? {};
            const victims = Object.values(victimTypeObj).reduce(
              (sum: number, v) => sum + (Number(v) || 0), 0,
            );
            return { year: y, incidents, offenses, victims };
          })
          .catch(() => null),
      );
    }

    const yearResults = await Promise.all(yearRequests);
    const yearly = yearResults.filter(Boolean);

    // Merge yearly trend into the aggregate response
    const result = { ...aggregateData, _yearly: yearly };

    return NextResponse.json(result, {
      headers: { "Cache-Control": "public, max-age=1800, s-maxage=1800" },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch hate crime data" },
      { status: 500 },
    );
  }
}
