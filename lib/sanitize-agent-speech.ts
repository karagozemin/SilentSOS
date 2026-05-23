/** True when relay prefix carries new critical info, not just a question */
export function isSubstantiveRelay(text: string): boolean {
  const match = text.match(/Relaying to dispatch:\s*([\s\S]+)/i);
  if (!match) return false;

  const body = match[1].trim();
  const hasCriticalFact =
    /not safe|unsafe|in danger|hiding|threat|unable to speak|can't speak|location|bornova|requesting|urgent|help|injured|hurt/i.test(
      body,
    );
  const mostlyQuestion =
    body.endsWith("?") &&
    body.length < 100 &&
    /^(are you|can you|what|where|how|is the|do you)/i.test(body);

  return hasCriticalFact && !mostlyQuestion;
}

/**
 * Keeps "Relaying to dispatch" when appropriate.
 * Strips it only from clarifying questions that wrongly include the prefix.
 */
export function normalizeAgentSpeech(text: string): string {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (!trimmed) return "I'm here with you. What's happening?";

  if (!/Relaying to dispatch:/i.test(trimmed)) return trimmed;
  if (isSubstantiveRelay(trimmed)) return trimmed;

  const withoutPrefix = trimmed
    .replace(/^Relaying to dispatch:\s*/i, "")
    .trim();
  if (withoutPrefix) {
    return withoutPrefix.charAt(0).toUpperCase() + withoutPrefix.slice(1);
  }
  return trimmed;
}
