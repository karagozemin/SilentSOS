import { getActiveProfile, setActiveProfile } from "@/lib/profile-store";
import type { EmergencyProfile } from "@/lib/types";
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(getActiveProfile());
}

export async function POST(request: Request) {
  const profile = (await request.json()) as EmergencyProfile;
  setActiveProfile(profile);
  return NextResponse.json({ ok: true });
}
