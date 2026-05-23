# Deploy: Render + Vercel

Sıra önemli — önce Render, sonra Speech Engine ID, sonra Vercel.

## Adım 1 — Render (Speech Engine server)

1. Repo’yu GitHub’a push et
2. [render.com](https://render.com) → **New → Blueprint** (veya Web Service)
3. `render.yaml` otomatik okunur:
   - Start: `npm start` (root directory: `engine`)
   - Health: `/health`
4. **İlk deploy’da sadece şunları ekle:**

| Key | Value |
|---|---|
| `ELEVENLABS_API_KEY` | ElevenLabs key |
| `OPENAI_API_KEY` | OpenAI key |

> `SPEECH_ENGINE_ID` henüz **boş bırak** — sunucu yine ayağa kalkar.

5. Deploy bitince URL’i kopyala, örn:
   `https://silentsos-engine.onrender.com`

6. Test et:
   ```bash
   curl https://silentsos-engine.onrender.com/health
   ```
   Beklenen: `{"ok":true,"speechEngineAttached":false}`

---

## Adım 2 — Speech Engine ID oluştur (lokalde, 1 kez)

`.env.local`’de `ELEVENLABS_API_KEY` dolu olmalı.

```bash
npm run create-engine -- wss://silentsos-engine.onrender.com/ws
```

Çıktıdaki `SPEECH_ENGINE_ID=seng_...` değerini kopyala.

---

## Adım 3 — Render’a ID ekle + redeploy

Render dashboard → Environment → ekle:

| Key | Value |
|---|---|
| `SPEECH_ENGINE_ID` | `seng_...` (adım 2’den) |

Kaydet → Render otomatik restart eder.

Tekrar test:
```bash
curl https://silentsos-engine.onrender.com/health
```
Beklenen: `{"ok":true,"speechEngineAttached":true}`

---

## Adım 4 — Vercel (Next.js frontend)

1. [vercel.com](https://vercel.com) → Import repo
2. Framework: **Next.js** (auto)
3. Environment variables:

| Key | Value |
|---|---|
| `ELEVENLABS_API_KEY` | ElevenLabs key |
| `SPEECH_ENGINE_ID` | `seng_...` |
| `NEXT_PUBLIC_ENGINE_URL` | `https://silentsos-engine.onrender.com` |

> Vercel’de `OPENAI_API_KEY` ve `PORT` **gerekmez**.

4. Deploy → Vercel URL’ini hackathon **Demo URL** olarak kullan

---

## `.env.local` (lokal geliştirme)

| Key | Ne yazılır |
|---|---|
| `ELEVENLABS_API_KEY` | ✅ dolu |
| `OPENAI_API_KEY` | ✅ dolu |
| `SPEECH_ENGINE_ID` | Adım 2’den sonra doldur |
| `NEXT_PUBLIC_ENGINE_URL` | Lokal: `http://localhost:3001` / Prod test: Render URL |
| `PORT` | `3001` (sadece lokal) |

Lokal çalıştırma:
```bash
npm run dev           # terminal 1 — :3000
npm run speech-engine # terminal 2 — :3001
```

---

## Özet: hangi platformda ne var?

| Variable | Render | Vercel | .env.local |
|---|---|---|---|
| `ELEVENLABS_API_KEY` | ✅ | ✅ | ✅ |
| `OPENAI_API_KEY` | ✅ | ❌ | ✅ |
| `SPEECH_ENGINE_ID` | ✅ (adım 3) | ✅ | ✅ |
| `NEXT_PUBLIC_ENGINE_URL` | ❌ | ✅ Render URL | localhost veya Render URL |
| `PORT` | ❌ (Render verir) | ❌ | ✅ `3001` |

---

## Demo Mode vs Live Call

- **Demo Mode** → API key olmadan UI testi, video çekimi için
- **Start Emergency Call** → Render + Vercel + `SPEECH_ENGINE_ID` şart
