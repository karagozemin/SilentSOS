import OpenAI from "openai";
import { buildAgentInstructions } from "./agent-prompt.mjs";

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";
const DEFAULT_GROQ_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_OPENAI_MODEL = "gpt-4o";

function transcriptToMessages(transcript, profile) {
  return [
    { role: "system", content: buildAgentInstructions(profile) },
    ...transcript.map((m) => ({
      role: m.role === "agent" ? "assistant" : m.role,
      content:
        typeof m.content === "string" ? m.content : JSON.stringify(m.content),
    })),
  ];
}

function createLlmConfig() {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    return {
      provider: "groq",
      model: process.env.GROQ_MODEL?.trim() || DEFAULT_GROQ_MODEL,
      client: new OpenAI({ apiKey: groqKey, baseURL: GROQ_BASE_URL }),
    };
  }

  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (openaiKey) {
    return {
      provider: "openai",
      model: process.env.OPENAI_MODEL?.trim() || DEFAULT_OPENAI_MODEL,
      client: new OpenAI({ apiKey: openaiKey }),
    };
  }

  return null;
}

export const llmConfig = createLlmConfig();

export function requireLlmKey() {
  if (!llmConfig) {
    console.error("[SilentSOS Engine] FATAL: No LLM configured.");
    console.error("[SilentSOS Engine] Add GROQ_API_KEY on Render → Settings → Environment");
    console.error("[SilentSOS Engine] Get a free key: https://console.groq.com/keys");
    process.exit(1);
  }
  console.log(
    `[SilentSOS Engine] LLM provider: ${llmConfig.provider} (${llmConfig.model})`,
  );
}

export async function streamAgentResponse(transcript, profile, signal) {
  if (!llmConfig) {
    throw new Error("No LLM configured");
  }

  return llmConfig.client.chat.completions.create(
    {
      model: llmConfig.model,
      messages: transcriptToMessages(transcript, profile),
      stream: true,
      temperature: 0.6,
      max_tokens: 256,
    },
    { signal },
  );
}
