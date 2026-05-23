import "../lib/load-env.js";
import { buildAgentInstructions } from "./agent.js";
import { getActiveProfile, setActiveProfile } from "./profile-store.js";
import type { EmergencyProfile } from "../lib/types.js";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import OpenAI from "openai";

const SPEECH_ENGINE_ID = process.env.SPEECH_ENGINE_ID?.trim();
const PORT = Number(process.env.PORT ?? 3001);

let speechEngineAttached = false;
let attachError: string | null = null;

if (!process.env.ELEVENLABS_API_KEY || !process.env.OPENAI_API_KEY) {
  throw new Error("ELEVENLABS_API_KEY and OPENAI_API_KEY are required");
}

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function readBody(request: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8");
}

function handleProfileRoute(
  request: IncomingMessage,
  response: ServerResponse,
) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return true;
  }

  if (request.method === "GET") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify(getActiveProfile()));
    return true;
  }

  if (request.method === "POST") {
    void readBody(request).then((body) => {
      try {
        const profile = JSON.parse(body) as EmergencyProfile;
        setActiveProfile(profile);
        response.writeHead(200, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ ok: true }));
      } catch {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ error: "Invalid profile JSON" }));
      }
    });
    return true;
  }

  response.writeHead(405);
  response.end();
  return true;
}

const httpServer = createServer((request, response) => {
  const path = request.url?.split("?")[0] ?? "";

  if (path === "/health") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(
      JSON.stringify({
        ok: true,
        speechEngineAttached,
        ...(attachError ? { attachError } : {}),
      }),
    );
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

      onInit(conversationId) {
        console.log("Session started:", conversationId);
      },

      async onTranscript(transcript, signal, session) {
        const profile = getActiveProfile();
        const instructions = buildAgentInstructions(profile);

        const response = await openai.responses.create(
          {
            model: "gpt-4o",
            instructions,
            input: transcript.map((message) => ({
              role: message.role === "agent" ? "assistant" : message.role,
              content: message.content,
            })),
            stream: true,
          },
          { signal },
        );

        session.sendResponse(response);
      },

      onClose(session) {
        console.log("Session ended:", session.conversationId);
      },

      onError(err) {
        console.error("Speech Engine error:", err);
      },
    });
    speechEngineAttached = true;
    console.log("Speech Engine attached:", SPEECH_ENGINE_ID);
  } catch (error) {
    attachError =
      error instanceof Error ? error.message : "Unknown attach error";
    console.error("Failed to attach Speech Engine:", attachError);
  }
} else {
  console.warn(
    "SPEECH_ENGINE_ID missing — server is up for /health and /profile only.",
  );
}

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Speech Engine server listening on 0.0.0.0:${PORT}`);
});
