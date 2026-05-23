const RELAY_PATTERN = /Relaying to dispatch:\s*/gi;

export function sanitizeAgentSpeech(text) {
  const cleaned = text.replace(RELAY_PATTERN, " ").replace(/\s+/g, " ").trim();
  if (cleaned) return cleaned;
  return "I'm here with you. What's happening?";
}
