import type { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type { VoiceSettings } from "@elevenlabs/elevenlabs-js/api/types/VoiceSettings";

const FALLBACK_VOICE_ID = "21m00Tcm4TlvDq8ikWAM";
const FALLBACK_MODEL_ID = "eleven_turbo_v2_5";

export type EngineTtsConfig = {
  voiceId: string;
  modelId: string;
  voiceSettings?: VoiceSettings;
  optimizeStreamingLatency?: number;
};

let cached: EngineTtsConfig | null = null;

export async function getEngineTtsConfig(
  client: ElevenLabsClient,
  engineId: string,
): Promise<EngineTtsConfig> {
  if (cached) return cached;

  const engine = await client.speechEngine.get(engineId);
  const tts = engine.config?.tts;

  const voiceSettings: VoiceSettings = {};
  if (typeof tts?.stability === "number") voiceSettings.stability = tts.stability;
  if (typeof tts?.similarityBoost === "number") {
    voiceSettings.similarityBoost = tts.similarityBoost;
  }
  if (typeof tts?.speed === "number") voiceSettings.speed = tts.speed;

  cached = {
    voiceId: tts?.voiceId ?? FALLBACK_VOICE_ID,
    modelId: tts?.modelId ?? FALLBACK_MODEL_ID,
    ...(Object.keys(voiceSettings).length > 0 ? { voiceSettings } : {}),
    ...(typeof tts?.optimizeStreamingLatency === "number"
      ? { optimizeStreamingLatency: tts.optimizeStreamingLatency }
      : {}),
  };

  return cached;
}
