import { NextResponse } from "next/server";

function getEngineUrl(): string {
  return (
    process.env.ENGINE_URL ??
    process.env.NEXT_PUBLIC_ENGINE_URL ??
    "http://localhost:3001"
  ).replace(/\/$/, "");
}

export async function GET() {
  const engineUrl = getEngineUrl();

  try {
    const response = await fetch(`${engineUrl}/health`, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json(
        { error: "Speech Engine server unhealthy" },
        { status: 502 },
      );
    }

    const health = (await response.json()) as {
      ok?: boolean;
      speechEngineAttached?: boolean;
    };

    if (!health.ok || !health.speechEngineAttached) {
      return NextResponse.json(
        { error: "Speech Engine not attached on server" },
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
