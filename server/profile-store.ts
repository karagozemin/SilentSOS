import type { EmergencyProfile } from "../lib/types.js";
import { DEFAULT_PROFILE } from "../lib/types.js";

let activeProfile: EmergencyProfile = { ...DEFAULT_PROFILE };

export function setActiveProfile(profile: EmergencyProfile): void {
  activeProfile = { ...profile };
}

export function getActiveProfile(): EmergencyProfile {
  return { ...activeProfile };
}
