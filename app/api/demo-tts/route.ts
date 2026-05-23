import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { getEngineTtsConfig } from "@/lib/engine-tts";
import { NextResponse } from "next/server";

async function streamToBuffer(stream: ReadableStream<Uint8Array>) {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c)));
}

export async function POST(request: Request) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const speechEngineId = process.env.SPEECH_ENGINE_ID;

  if (!apiKey || !speechEngineId) {
    return NextResponse.json(
      { error: "Missing ELEVENLABS_API_KEY or SPEECH_ENGINE_ID" },
      { status: 500 },
    );
  }

  const { text } = (await request.json()) as { text?: string };
  if (!text?.trim()) {
    return NextResponse.json({ error: "Missing text" }, { status: 400 });
  }

  try {
    const client = new ElevenLabsClient({ apiKey });
    const { voiceId, modelId, voiceSettings, optimizeStreamingLatency } =
      await getEngineTtsConfig(client, speechEngineId);

    const audioStream = await client.textToSpeech.convert(voiceId, {
      text: text.trim(),
      modelId,
      outputFormat: "mp3_44100_128",
      ...(voiceSettings ? { voiceSettings } : {}),
      ...(optimizeStreamingLatency !== undefined
        ? { optimizeStreamingLatency }
        : {}),
    });

    const buffer = await streamToBuffer(audioStream);
    return new NextResponse(buffer, {
      headers: { "Content-Type": "audio/mpeg", "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate demo speech";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
