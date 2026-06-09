import { buildAgentInstructions } from "@/lib/agent-prompt";
import type { EmergencyProfile } from "@/lib/types";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const agentId = process.env.ELEVENLABS_AGENT_ID;
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!agentId || !apiKey) {
    return NextResponse.json(
      { error: "Missing ELEVENLABS_AGENT_ID or ELEVENLABS_API_KEY" },
      { status: 500 },
    );
  }

  const profile = (await request.json()) as EmergencyProfile;

  try {
    const elevenlabs = new ElevenLabsClient({ apiKey });
    const existing = await elevenlabs.conversationalAi.agents.get(agentId);

    await elevenlabs.conversationalAi.agents.update(agentId, {
      conversationConfig: {
        ...existing.conversationConfig,
        agent: {
          ...existing.conversationConfig?.agent,
          prompt: {
            ...existing.conversationConfig?.agent?.prompt,
            prompt: buildAgentInstructions(profile),
          },
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to update agent profile";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
