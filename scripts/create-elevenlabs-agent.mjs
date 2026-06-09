import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { buildAgentInstructions } from "./agent-prompt.mjs";

const FIRST_MESSAGE =
  "I'm here. I'll speak for you. Take a breath — what's happening?";

if (!process.env.ELEVENLABS_API_KEY) {
  console.error("ELEVENLABS_API_KEY is required in .env.local");
  process.exit(1);
}

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const agent = await elevenlabs.conversationalAi.agents.create({
  name: "SilentSOS Relay Agent",
  conversationConfig: {
    agent: {
      firstMessage: FIRST_MESSAGE,
      language: "en",
      prompt: {
        prompt: buildAgentInstructions(),
        llm: "gpt-4o-mini",
        temperature: 0.3,
        maxTokens: 300,
      },
    },
    tts: {
      modelId: "eleven_turbo_v2",
      voiceId: "EXAVITQu4vr4xnSDxMaL",
      stability: 0.65,
      speed: 0.95,
    },
    conversation: {
      maxDurationSeconds: 600,
    },
  },
});

console.log("\nElevenLabs Conversational AI agent created.\n");
console.log("Add this to .env.local and Vercel:\n");
console.log(`ELEVENLABS_AGENT_ID=${agent.agentId}\n`);
console.log("Next: npm run create-did-agent\n");
