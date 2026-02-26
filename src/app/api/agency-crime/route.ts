import { NextRequest, NextResponse } from "next/server";

const CDE_BASE = "https://cde.ucr.cjis.gov/LATEST";

// Proxy CDE agency crime data to avoid CORS issues
// GET /api/agency-crime?ori=NM0130200&type=violent-crime&from=2015&to=2023
export async function GET(request: NextRequest) {
  const ori = request.nextUrl.searchParams.get("ori");
  const crimeType = request.nextUrl.searchParams.get("type") || "violent-crime";
  const from = request.nextUrl.searchParams.get("from") || "2015";
  const to = request.nextUrl.searchParams.get("to") || "2023";

  if (!ori) {
    return NextResponse.json({ error: "ori parameter required" }, { status: 400 });
  }

  try {
    const url = `${CDE_BASE}/summarized/agency/${ori}/${crimeType}?from=01-${from}&to=12-${to}`;
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
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch agency crime data" },
      { status: 500 },
    );
  }
}
