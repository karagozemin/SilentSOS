const DID_API = "https://api.d-id.com";

const PRESENTER_ID = "public_mia_elegant@avt_TJ0Tq5";

function didAuthHeader(apiKey) {
  return `Basic ${Buffer.from(`${apiKey}:`).toString("base64")}`;
}

async function didFetch(apiKey, path, options = {}) {
  const response = await fetch(`${DID_API}${path}`, {
    ...options,
    headers: {
      Authorization: didAuthHeader(apiKey),
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(
      body?.description ?? body?.error ?? `D-ID ${path} failed (${response.status})`,
    );
  }
  return body;
}

async function waitForAgent(apiKey, agentId) {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const agent = await didFetch(apiKey, `/agents/${agentId}`);
    if (agent.status === "done" || agent.status === "ready") {
      return agent;
    }
    if (agent.status === "error" || agent.status === "rejected") {
      throw new Error(`D-ID agent failed with status: ${agent.status}`);
    }
    console.log(`Waiting for avatar idle video… (${agent.status})`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error("Timed out waiting for D-ID agent to become ready");
}

const apiKey = process.env.DID_API_KEY;
const elevenLabsAgentId = process.env.ELEVENLABS_AGENT_ID;
const elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;

if (!apiKey || !elevenLabsAgentId || !elevenLabsApiKey) {
  console.error(
    "Required: DID_API_KEY, ELEVENLABS_AGENT_ID, ELEVENLABS_API_KEY in .env.local",
  );
  console.error("\nRun first: npm run create-elevenlabs-agent\n");
  process.exit(1);
}

const domains = (process.env.DID_ALLOWED_DOMAINS ??
  "http://localhost:3000,https://localhost:3000")
  .split(",")
  .map((d) => d.trim())
  .filter(Boolean);

console.log("Saving ElevenLabs API key to D-ID secret store…");
const secret = await didFetch(apiKey, "/secrets", {
  method: "POST",
  body: JSON.stringify({
    type: "api_key",
    provider: "elevenlabs",
    api_key: elevenLabsApiKey,
  }),
});

console.log("Creating D-ID + ElevenLabs integrated agent…");
const created = await didFetch(apiKey, "/v2/agents/integrations/elevenlabs", {
  method: "POST",
  body: JSON.stringify({
    preview_name: "SilentSOS Relay",
    preview_description:
      "Calm emergency voice relay — speaks for callers who cannot talk. Demo simulation only.",
    presenter: {
      type: "expressive",
      presenter_id: PRESENTER_ID,
    },
    external_agent: {
      type: "elevenlabs",
      agent_id: elevenLabsAgentId,
      secret_id: secret.id,
    },
  }),
});

console.log(`Agent ${created.id} created (${created.status}).`);
const ready = await waitForAgent(apiKey, created.id);

let clientKey = created.client_key;
if (clientKey) {
  console.log("Whitelisting domains for client key…");
  await didFetch(apiKey, `/agents/${created.id}/client-keys/${clientKey}`, {
    method: "PATCH",
    body: JSON.stringify({ allowed_domains: domains }),
  });
} else {
  console.log("Generating client key…");
  const keyResponse = await didFetch(apiKey, "/agents/client-key", {
    method: "POST",
    body: JSON.stringify({ allowed_domains: domains }),
  });
  clientKey = keyResponse.client_key;
}

console.log("\nD-ID agent ready.\n");
console.log("Add these to .env.local and Vercel:\n");
console.log(`DID_AGENT_ID=${ready.id}`);
console.log(`DID_CLIENT_KEY=${clientKey}\n`);
console.log("Allowed domains:", domains.join(", "));
console.log("\nRestart dev server and open the app to test the avatar call.\n");
