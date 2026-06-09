import { NextResponse } from "next/server";

export async function GET() {
  const agentId = process.env.DID_AGENT_ID;
  const clientKey = process.env.DID_CLIENT_KEY;

  if (!agentId || !clientKey) {
    return NextResponse.json(
      {
        error:
          "Missing DID_AGENT_ID or DID_CLIENT_KEY. Run: npm run create-elevenlabs-agent && npm run create-did-agent",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ agentId, clientKey });
}
