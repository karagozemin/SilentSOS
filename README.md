<p align="center">
  <img src="public/silentsos-logo.png" alt="SilentSOS" width="220" />
</p>

<h1 align="center">SilentSOS</h1>

<p align="center">
  <strong>When you can't speak, AI speaks for you.</strong>
</p>

<p align="center">
  <a href="https://docs.d-id.com/docs/elevenlabs-agent-overview">D-ID + ElevenAgents</a> ·
  Voice AI Emergency Relay
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Simulation%20Only-amber?style=flat-square" alt="Simulation only" />
  <img src="https://img.shields.io/badge/Stack-Next.js%20%7C%20D--ID%20%7C%20ElevenAgents-red?style=flat-square" alt="Stack" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="MIT" />
</p>

---

## The problem

In a real emergency, people often **cannot speak clearly** — panic, whispering, hiding, injury, or a threat in the room. Traditional voice systems fail when the caller goes silent. Help still needs context: *where they are, whether they're safe, what's happening*.

## The solution

**SilentSOS** listens to distressed or whispered speech and **speaks on the user's behalf** to a simulated dispatch operator — with a **D-ID expressive avatar** and **ElevenAgents** conversational AI.

The user sees a calm face. The AI asks short questions. When critical facts emerge, the avatar relays them: *"Relaying to dispatch: Caller is hiding, location confirmed, not safe."*

> **SIMULATION ONLY** — Not connected to real emergency services.

---

## Features

- **D-ID avatar relay** — expressive face lip-syncs dispatch messages in real time
- **ElevenAgents brain** — STT, LLM, and TTS via D-ID's native ElevenLabs integration
- **Optional vision** — webcam lets the agent react to visible distress
- **Three-panel UI** — profile · live avatar · transcript + dispatch
- **Dual-mode agent** — calm user dialogue vs. dispatch relay messages
- **Demo mode** — scripted walkthrough with lip-synced avatar lines

---

## Quick start

```bash
git clone https://github.com/karagozemin/SilentSOS.git
cd SilentSOS
cp .env.example .env.local
```

Fill `.env.local` with `ELEVENLABS_API_KEY` and `DID_API_KEY`, then:

```bash
npm run create-elevenlabs-agent   # → ELEVENLABS_AGENT_ID
npm run create-did-agent          # → DID_AGENT_ID, DID_CLIENT_KEY
npm install
npm run dev                       # http://localhost:3000
```

Architecture details → **[ARCHITECTURE.md](./ARCHITECTURE.md)**

---

## Deploy (Vercel)

Required env vars:

| Variable |
|---|
| `ELEVENLABS_API_KEY` |
| `ELEVENLABS_AGENT_ID` |
| `DID_AGENT_ID` |
| `DID_CLIENT_KEY` |

Whitelist your production domain when creating the D-ID agent:

```bash
DID_ALLOWED_DOMAINS=http://localhost:3000,https://your-app.vercel.app npm run create-did-agent
```

---

## Project structure

```
app/api/agent-config/     D-ID credentials for browser
app/api/agent-profile/    Profile → ElevenAgents prompt
components/               UI + avatar call screen
lib/                      D-ID hook, prompts, dispatch logic
scripts/                  Agent setup scripts
```

---

## Safety & ethics

SilentSOS is a **prototype for demonstration**. It does not contact real emergency services.

---

## License

MIT
