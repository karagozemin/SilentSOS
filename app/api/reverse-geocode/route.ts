import { NextResponse } from "next/server";

type NominatimAddress = {
  city?: string;
  town?: string;
  village?: string;
  suburb?: string;
  neighbourhood?: string;
  state?: string;
  country?: string;
};

function formatAddress(address: NominatimAddress): string | null {
  const locality =
    address.city ??
    address.town ??
    address.village ??
    address.suburb ??
    address.neighbourhood;

  const parts = [locality, address.state, address.country].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");

  if (!lat || !lon) {
    return NextResponse.json(
      { error: "Missing lat or lon query parameters" },
      { status: 400 },
    );
  }

  const latitude = Number(lat);
  const longitude = Number(lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  try {
    const params = new URLSearchParams({
      lat: String(latitude),
      lon: String(longitude),
      format: "json",
    });

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params}`,
      {
        headers: {
          "User-Agent": "SilentSOS/1.0 (ElevenHacks demo; contact: github.com/karagozemin/SilentSOS)",
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Reverse geocoding failed" },
        { status: 502 },
      );
    }

    const data = (await response.json()) as { address?: NominatimAddress };
    const label = data.address ? formatAddress(data.address) : null;

    if (!label) {
      return NextResponse.json(
        { error: "No address found for this location" },
        { status: 404 },
      );
    }

    return NextResponse.json({ label });
  } catch {
    return NextResponse.json(
      { error: "Reverse geocoding failed" },
      { status: 502 },
    );
  }
}
