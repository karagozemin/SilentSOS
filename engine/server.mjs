import { createServer } from "node:http";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { llmConfig, requireLlmKey, generateAgentResponse } from "./llm.mjs";
import { getActiveProfile, setActiveProfile } from "./profile-store.mjs";

const SPEECH_ENGINE_ID = process.env.SPEECH_ENGINE_ID?.trim();
const PORT = Number(process.env.PORT ?? 3001);
let speechEngineAttached = false;
let attachError = null;

function log(...args) {
  console.log("[SilentSOS Engine]", ...args);
}

if (!process.env.ELEVENLABS_API_KEY) {
  console.error("[SilentSOS Engine] FATAL: ELEVENLABS_API_KEY is required");
  process.exit(1);
}
requireLlmKey();

const elevenlabs = new ElevenLabsClient({ apiKey: process.env.ELEVENLABS_API_KEY });

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function handleProfileRoute(request, response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }
  if (request.method === "GET") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(getActiveProfile()));
    return;
  }
  if (request.method === "POST") {
    void readBody(request)
      .then((body) => {
        setActiveProfile(JSON.parse(body));
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ ok: true }));
      })
      .catch(() => {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid profile JSON" }));
      });
    return;
  }
  response.writeHead(405);
  response.end();
}

const httpServer = createServer((request, response) => {
  const path = request.url?.split("?")[0] ?? "";
  if (path === "/health") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ ok: true, speechEngineAttached, llmProvider: llmConfig?.provider ?? null, ...(attachError ? { attachError } : {}) }));
    return;
  }
  if (path === "/") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ service: "SilentSOS Speech Engine", health: "/health", websocket: "/ws", speechEngineAttached }));
    return;
  }
  if (path === "/profile") {
    handleProfileRoute(request, response);
    return;
  }
  response.writeHead(404, { "Content-Type": "application/json" });
  response.end(JSON.stringify({ error: "Not found" }));
});

if (SPEECH_ENGINE_ID) {
  try {
    elevenlabs.speechEngine.attach(SPEECH_ENGINE_ID, httpServer, "/ws", {
      debug: true,
      onInit(id) { log("Session started:", id); },
      async onTranscript(transcript, signal, session) {
        try {
          const text = await generateAgentResponse(
            transcript,
            getActiveProfile(),
            signal,
          );
          await session.sendResponse(text);
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          console.error("[SilentSOS Engine] LLM error:", message);
          await session.sendResponse(
            "I'm still here with you. Are you in a safe place right now? Please answer yes or no.",
          );
        }
      },
      onClose(session) { log("Session ended:", session.conversationId); },
      onError(err) { console.error("[SilentSOS Engine] error:", err); },
    });
    speechEngineAttached = true;
    log("Speech Engine attached:", SPEECH_ENGINE_ID);
  } catch (error) {
    attachError = error instanceof Error ? error.message : "Unknown attach error";
    console.error("[SilentSOS Engine] Failed to attach:", attachError);
  }
} else {
  log("SPEECH_ENGINE_ID missing");
}

httpServer.listen(PORT, "0.0.0.0", () => log(`Listening on 0.0.0.0:${PORT}`));
