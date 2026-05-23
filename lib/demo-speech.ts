export type DemoSpeaker = "user" | "agent" | "dispatch" | "system";

let userVoice: SpeechSynthesisVoice | null = null;
let currentAudio: HTMLAudioElement | null = null;

function pickUserVoice() {
  if (typeof window === "undefined") return;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;

  userVoice =
    voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        /daniel|alex|fred|google.*english.*male|male/i.test(v.name),
    ) ??
    voices.find((v) => v.lang.startsWith("en")) ??
    null;
}

export function initDemoSpeech() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  pickUserVoice();
  window.speechSynthesis.addEventListener("voiceschanged", pickUserVoice);
}

export function cancelDemoSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }
}

function speakBrowserUser(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }

    pickUserVoice();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = userVoice;
    utterance.rate = 0.78;
    utterance.pitch = 0.92;
    utterance.volume = 0.5;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}

async function speakElevenLabsAgent(text: string): Promise<void> {
  const response = await fetch("/api/demo-tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    console.warn("[SilentSOS demo] ElevenLabs TTS failed — agent line skipped");
    return;
  }

  const blob = await response.blob();
  if (!blob.size) return;

  const url = URL.createObjectURL(blob);

  return new Promise((resolve) => {
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      currentAudio = null;
      resolve();
    };
    void audio.play().catch(() => resolve());
  });
}

export async function speakDemoLine(
  role: DemoSpeaker,
  text: string,
): Promise<void> {
  if (role === "system") return;

  const spoken =
    role === "dispatch" ? text.replace(/^Dispatch:\s*/i, "") : text;

  if (role === "user") {
    await speakBrowserUser(spoken);
    return;
  }

  await speakElevenLabsAgent(spoken);
}
