import type { EmergencyProfile } from "@/lib/types";
import { NextResponse } from "next/server";

function getEngineUrl(): string {
  return (
    process.env.ENGINE_URL ??
    process.env.NEXT_PUBLIC_ENGINE_URL ??
    "http://localhost:3001"
  ).replace(/\/$/, "");
}

export async function POST(request: Request) {
  const profile = (await request.json()) as EmergencyProfile;
  const engineUrl = getEngineUrl();

  try {
    const response = await fetch(`${engineUrl}/profile`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to sync profile to Speech Engine server" },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Speech Engine server unreachable" },
      { status: 502 },
    );
  }
}
