import type { EmergencyProfile } from "./types";
import { DEFAULT_PROFILE } from "./types";

let activeProfile: EmergencyProfile = { ...DEFAULT_PROFILE };

export function setActiveProfile(profile: EmergencyProfile): void {
  activeProfile = { ...profile };
}

export function getActiveProfile(): EmergencyProfile {
  return { ...activeProfile };
}
