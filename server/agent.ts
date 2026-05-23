import type { EmergencyProfile } from "../lib/types.js";
import { buildAgentInstructions as buildFromLib } from "../lib/agent-prompt.js";

export function buildAgentInstructions(profile: EmergencyProfile): string {
  return buildFromLib(profile);
}
