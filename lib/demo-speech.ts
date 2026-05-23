export type DemoSpeaker = "user" | "agent" | "dispatch" | "system";

let agentVoice: SpeechSynthesisVoice | null = null;
let userVoice: SpeechSynthesisVoice | null = null;

function pickVoices() {
  if (typeof window === "undefined") return;

  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return;

  agentVoice =
    voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        /samantha|karen|victoria|google.*english.*female|female/i.test(v.name),
    ) ??
    voices.find((v) => v.lang.startsWith("en")) ??
    null;

  userVoice =
    voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        v !== agentVoice &&
        /daniel|alex|fred|google.*english.*male|male/i.test(v.name),
    ) ??
    voices.find((v) => v.lang.startsWith("en") && v !== agentVoice) ??
    agentVoice;
}

export function initDemoSpeech() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  pickVoices();
  window.speechSynthesis.addEventListener("voiceschanged", pickVoices);
}

export function cancelDemoSpeech() {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
}

export function speakDemoLine(
  role: DemoSpeaker,
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
) {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return;
  }

  if (role === "system") {
    onEnd?.();
    return;
  }

  pickVoices();

  const spoken =
    role === "dispatch"
      ? text.replace(/^Dispatch:\s*/i, "")
      : text;

  const utterance = new SpeechSynthesisUtterance(spoken);

  if (role === "user") {
    utterance.voice = userVoice;
    utterance.rate = 0.78;
    utterance.pitch = 0.92;
    utterance.volume = 0.5;
  } else {
    utterance.voice = agentVoice;
    utterance.rate = role === "dispatch" ? 0.9 : 0.93;
    utterance.pitch = role === "dispatch" ? 0.85 : 1;
    utterance.volume = 1;
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);
}
