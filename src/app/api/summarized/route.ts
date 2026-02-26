import { NextRequest, NextResponse } from "next/server";

const CDE_BASE = "https://cde.ucr.cjis.gov/LATEST";

// Proxy CDE summarized crime data to avoid CORS issues
// GET /api/summarized?scope=national&crime=violent-crime&from=2015&to=2024
// scope = national | state/{abbr} | agency/{ori}
export async function GET(request: NextRequest) {
  const scope = request.nextUrl.searchParams.get("scope") || "national";
  const crime = request.nextUrl.searchParams.get("crime") || "violent-crime";
  const from = request.nextUrl.searchParams.get("from") || "2015";
  const to = request.nextUrl.searchParams.get("to") || "2024";

  try {
    const url = `${CDE_BASE}/summarized/${scope}/${crime}?from=01-${from}&to=12-${to}`;
    const res = await fetch(url);
    if (!res.ok) {
      return NextResponse.json(
        { error: `CDE API error: ${res.status}` },
        { status: res.status },
      );
    }
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=1800, s-maxage=1800" },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch summarized crime data" },
      { status: 500 },
    );
  }
}
