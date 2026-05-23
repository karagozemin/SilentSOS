# SilentSOS — Architecture

Technical reference for the ElevenHacks #10 Speech Engine submission.

---

## 1. System overview

SilentSOS splits into two deployable units:

| Unit | Platform | Role |
|---|---|---|
| **Frontend + API gateway** | Vercel (Next.js 16) | UI, WebRTC client, secret proxy |
| **Speech Engine server** | Render (Node 20) | WebSocket LLM backend for ElevenLabs |

```mermaid
flowchart TB
  subgraph Browser
    UI[SilentSOS UI]
    Hook[@elevenlabs/react]
    UI --> Hook
  end

  subgraph Vercel
    Token["/api/token"]
    Profile["/api/profile"]
    Health["/api/engine-health"]
  end

  subgraph ElevenLabs
    STT[Speech-to-Text]
    TTS[Text-to-Speech]
    SE[Speech Engine Router]
  end

  subgraph Render
    WS["/ws WebSocket"]
    LLM[Groq llama-3.3-70b]
    Store[(Profile Store)]
  end

  Hook <-->|WebRTC| STT
  Hook <-->|WebRTC| TTS
  Hook --> Token
  UI --> Profile
  UI --> Health

  Token --> ElevenLabs
  Profile --> Store
  Health --> Render

  SE <-->|JWT-verified WS| WS
  WS --> LLM
  LLM --> WS
  WS --> SE
  SE --> TTS
```

---

## 2. Voice session lifecycle

### 2.1 Start call

1. User clicks **Start Emergency Call**
2. Client calls `GET /api/engine-health` → pings Render `/health` (cold-start wake)
3. Client calls `POST /api/profile` → syncs emergency profile to Render
4. Client calls `POST /api/token` → server returns WebRTC conversation token
5. `useConversation().startSession({ conversationToken, overrides })` opens WebRTC
6. Agent speaks first message: *"I'm here. I'll speak for you…"*

### 2.2 During call

```
User audio → ElevenLabs STT → transcript batch
    → Render /ws (onTranscript)
    → Groq (system prompt + profile + history)
    → normalizeAgentSpeech()
    → session.sendResponse(text)
    → ElevenLabs TTS → user hears agent
```

Parallel on the client:

- `onMessage` → transcript panel (user / agent roles)
- `getDispatchFromUser()` / `getDispatchFromAgent()` → dispatch panel
- `onModeChange` → phase indicator (listening / speaking)
- `getInputVolume()` → mic level meter

### 2.3 Interruption

ElevenLabs handles barge-in natively. A new `user_transcript` aborts the in-flight Groq request via `AbortSignal` on the engine side.

### 2.4 End call

`conversation.endSession()` → WebSocket close → phase returns to `idle`.

---

## 3. Speech Engine server (`engine/`)

Minimal Node.js service — **no Next.js, no TypeScript runtime on Render**.

### 3.1 Entry

```
engine/server.mjs       ← production (npm start)
server/speech-engine.mjs ← legacy Render shim
```

### 3.2 HTTP routes

| Route | Method | Purpose |
|---|---|---|
| `/health` | GET | Liveness + `speechEngineAttached` + `llmProvider` |
| `/profile` | GET/POST | In-memory emergency profile for LLM context |
| `/ws` | WebSocket | ElevenLabs Speech Engine attach point |

### 3.3 WebSocket attach

```javascript
elevenlabs.speechEngine.attach(SPEECH_ENGINE_ID, httpServer, "/ws", {
  onTranscript(transcript, signal, session) {
    const text = await generateAgentResponse(transcript, profile, signal);
    await session.sendResponse(text);
  },
});
```

ElevenLabs SDK handles:

- JWT verification (`X-Elevenlabs-Speech-Engine-Authorization`)
- WebSocket upgrade routing
- Transcript batching + abort on interruption
- Streaming response protocol to TTS

### 3.4 LLM layer (`engine/llm.mjs`)

- Provider: **Groq** (OpenAI-compatible API) — fast, free tier friendly
- Model: `llama-3.3-70b-versatile`
- Non-streaming completion → full string passed to `sendResponse()`
- Fallback string if Groq errors (connection stays alive)

### 3.5 Agent prompt (`engine/agent-prompt.mjs`)

**Dual-mode agent** — one mode per reply:

| Mode | When | Output |
|---|---|---|
| **A — User** | Default; greetings, questions | Second person, no relay prefix |
| **B — Dispatch relay** | New critical facts | `"Relaying to dispatch: …"` + optional user question |

Profile fields injected into system prompt:

- Name, location, emergency type, medical notes

---

## 4. Client agent logic (`lib/`)

### 4.1 Speech normalization (`sanitize-agent-speech.ts`)

Post-processes agent text on **both** server and client:

- Keeps `"Relaying to dispatch:"` when the relay carries **substantive** facts (threat, location, safety)
- Strips the prefix when the model mistakenly prepends it to a simple question

### 4.2 Dispatch simulation (`dispatch-script.ts`)

Not a real dispatch system — a **trigger-based state machine** for the demo UI.

**User triggers** (examples):

- `"can't talk"` → dispatch acknowledges speech difficulty
- `"hiding"` / `"someone outside"` → threat reported
- `"no"` → not safe, urgent

**Agent triggers**:

- `"Relaying to dispatch"` → copy received
- `"Are you safe"` → awaiting confirmation

### 4.3 Conversation phases

```
idle → connecting → listening → user_distress
                              → relaying → safety_check → dispatch_confirmed
```

Drives the call screen status label and demo script timing.

---

## 5. Frontend layout

```
┌─────────────────────────────────────────────────────────────┐
│  SIMULATION ONLY banner                                     │
├─────────────────────────────────────────────────────────────┤
│  SilentSOS          │                    ElevenHacks #10   │
├──────────┬──────────────────────┬─────────────────────────┤
│ Emergency│     Call Screen      │  Live Transcript          │
│ Profile  │  logo · phase · mic  │  (scroll, auto-stick)     │
│          │  start / end / demo  ├─────────────────────────┤
│          │                      │  Simulated Dispatch       │
└──────────┴──────────────────────┴─────────────────────────┘
```

- Viewport-locked layout (`h-dvh`, no page scroll)
- Transcript / dispatch scroll **inside** their panels only

---

## 6. Security model

| Secret | Stored on | Never in browser |
|---|---|---|
| `ELEVENLABS_API_KEY` | Vercel + Render | ✅ proxied via `/api/token` |
| `GROQ_API_KEY` | Render only | ✅ |
| `SPEECH_ENGINE_ID` | Vercel + Render | ✅ server-side token minting |

WebSocket `/ws` rejects connections without valid ElevenLabs JWT (HMAC of API key hash).

---

## 7. Environment matrix

| Variable | Vercel | Render | `.env.local` |
|---|---|---|---|
| `ELEVENLABS_API_KEY` | ✅ | ✅ | ✅ |
| `GROQ_API_KEY` | ❌ | ✅ | ✅ |
| `SPEECH_ENGINE_ID` | ✅ | ✅ | ✅ |
| `NEXT_PUBLIC_ENGINE_URL` | ✅ | ❌ | ✅ |
| `ENGINE_URL` | ✅ | ❌ | ✅ |
| `PORT` | ❌ | auto | `3001` (local engine only) |

---

## 8. Demo Mode vs Live Call

| | Demo Mode | Live Call |
|---|---|---|
| API keys | Not required | ElevenLabs + Render + Groq |
| Voice | Scripted timeouts | Real WebRTC |
| Dispatch | Pre-written script | Trigger-based from speech |
| Use case | Video recording, UI test | Full Speech Engine demo |

---

## 9. Key design decisions

1. **Custom Speech Engine server instead of hosted agent** — full control over relay prompt, profile injection, and LLM choice.
2. **Groq over OpenAI** — lower latency, free tier, OpenAI-compatible chat API works with `sendResponse(string)`.
3. **Profile sync before token** — engine always has latest caller context when `onTranscript` fires.
4. **Server + client normalize** — belt-and-suspenders against over-eager relay prefixes from smaller LLMs.
5. **Separate dispatch simulation** — demonstrates the *concept* of operator handoff without claiming real PSAP integration.

---

## 10. Failure handling

| Failure | Behavior |
|---|---|
| Render cold start | `/api/engine-health` wake before call |
| Groq quota / error | Fallback spoken message; session stays open |
| WebRTC drop | `onDisconnect` → system message in transcript |
| Missing env | `/api/token` returns 500 with clear error |

---

## 11. Extension roadmap

- Push-to-talk for absolute silence scenarios
- Multilingual relay (STT already multi-locale via ElevenLabs)
- Persistent profile storage (Postgres on Render)
- Real dispatch API adapter layer (behind explicit opt-in + legal gate)
- Streaming LLM back through `sendResponse(stream)` for lower time-to-first-token

---

## 12. File map

```
engine/
  server.mjs           HTTP server + speechEngine.attach
  llm.mjs              Groq client + generateAgentResponse
  agent-prompt.mjs     Dual-mode system instructions
  sanitize-speech.mjs  Relay prefix normalization
  profile-store.mjs    In-memory profile singleton
  types.mjs            DEFAULT_PROFILE for engine

app/api/
  token/route.ts       getWebrtcToken(agentId: SPEECH_ENGINE_ID)
  profile/route.ts     Proxy POST → Render /profile
  engine-health/route.ts  Proxy GET → Render /health

components/
  SilentSOSApp.tsx     Voice hook + state orchestration
  CallScreen.tsx       Call UI + mic meter
  TranscriptPanel.tsx  Live log
  DispatchPanel.tsx    Simulated operator channel
  EmergencyProfile.tsx Profile form → localStorage + sync

lib/
  dispatch-script.ts   Trigger tables + DEMO_SCRIPT
  sync-profile.ts      wakeEngineServer + syncProfileToEngine
  use-stick-to-bottom.ts  Panel scroll helper

scripts/
  create-engine.mjs    One-time seng_* registration
```

---

<p align="center">
  <a href="./README.md">← Back to README</a>
</p>
