import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextResponse } from "next/server";

export async function POST() {
  const speechEngineId = process.env.SPEECH_ENGINE_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!speechEngineId || !apiKey) {
    return NextResponse.json(
      {
        error:
          "Missing ELEVENLABS_API_KEY or SPEECH_ENGINE_ID environment variables",
      },
      { status: 500 },
    );
  }

  try {
    const elevenlabs = new ElevenLabsClient({ apiKey });

    const response =
      await elevenlabs.conversationalAi.conversations.getWebrtcToken({
        agentId: speechEngineId,
      });

    return NextResponse.json({ token: response.token });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create token";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
