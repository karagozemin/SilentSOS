import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

const wsUrl = process.argv[2];

if (!wsUrl) {
  console.error(
    "Usage: npm run create-engine -- wss://YOUR-SERVICE.onrender.com/ws",
  );
  process.exit(1);
}

if (!process.env.ELEVENLABS_API_KEY) {
  console.error("ELEVENLABS_API_KEY is required in .env.local");
  process.exit(1);
}

const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

const engine = await elevenlabs.speechEngine.create({
  name: "SilentSOS Speech Engine",
  speechEngine: {
    wsUrl,
  },
});

console.log("\nSpeech Engine created successfully.\n");
console.log("Add this to Render + Vercel env vars:\n");
console.log(`SPEECH_ENGINE_ID=${engine.engineId}\n`);

await elevenlabs.speechEngine.update(engine.engineId, {
  overrides: {
    firstMessage: true,
  },
});

console.log("firstMessage override enabled.");
