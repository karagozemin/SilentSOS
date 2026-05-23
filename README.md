# SilentSOS

**When you can't speak, AI speaks for you.**

SilentSOS is a voice AI prototype for ElevenHacks #10 (Speech Engine). It helps people communicate during panic, disability, or unsafe moments by relaying critical information to a **simulated** dispatch operator.

> **SIMULATION ONLY** — Not connected to real emergency services (911 / 112).

## Stack

- **Frontend:** Next.js + Tailwind (Vercel)
- **Voice:** ElevenLabs Speech Engine + `@elevenlabs/react`
- **LLM:** OpenAI GPT-4o (custom relay agent logic)
- **Speech Engine server:** Node.js on Render

## Quick start (local)

```bash
cp .env.example .env.local
# Fill in ELEVENLABS_API_KEY, OPENAI_API_KEY, SPEECH_ENGINE_ID

npm install
npm run dev          # Next.js on :3000
npm run speech-engine # Speech Engine server on :3001
```

### First-time Speech Engine setup

1. Deploy or expose the Speech Engine server (Render or ngrok)
2. Create the engine resource:

```bash
npm run create-engine -- wss://YOUR-PUBLIC-URL/ws
```

3. Copy the printed `SPEECH_ENGINE_ID` into `.env.local` and Render env vars
4. Enable first message override (script does this automatically)

## Deploy

### Render (Speech Engine server)

1. Connect this repo to Render
2. Use `render.yaml` or create a Web Service:
   - **Start command:** `npx tsx server/speech-engine.mts`
   - **Health check:** `/health`
3. Set env vars: `ELEVENLABS_API_KEY`, `OPENAI_API_KEY`, `SPEECH_ENGINE_ID`

### Vercel (Next.js)

1. Import repo to Vercel
2. Set env vars:
   - `ELEVENLABS_API_KEY`
   - `SPEECH_ENGINE_ID`
   - `NEXT_PUBLIC_ENGINE_URL=https://your-render-service.onrender.com`

## Demo video script (~60s)

1. Dark screen, trembling hand, heavy breathing (0–3s)
2. User whispers: *"help… I can't talk"* (3–8s)
3. AI responds calmly: *"I'm here. I'll speak for you."* (8–12s)
4. AI relays to dispatch with location from profile (12–25s)
5. Dispatch asks safety question (25–35s)
6. User interrupts: *"no"* → AI relays urgency (35–42s)
7. Split screen with **SIMULATION** watermark (42–50s)
8. Logo + `@elevenlabsio` + `#ElevenHacks` (50–60s)

Use **Demo Mode** in the app for a reliable scripted walkthrough when recording.

## Hackathon submission

- **Description:** Voice relay prototype using ElevenLabs Speech Engine for people who cannot speak during emergencies. Demo simulation only.
- **Demo URL:** Vercel deployment
- **Repo:** This repository
- **Social:** Tag `@elevenlabsio` and `#ElevenHacks`

## Project structure

```
app/                  Next.js UI + /api/token
components/           3-panel UI, call screen, demo mode
lib/                  Agent prompts, dispatch script, types
server/               Speech Engine WebSocket server (Render)
scripts/              One-time engine creation
```

## License

MIT — hackathon demo project.
