import { DEFAULT_PROFILE } from "./types.mjs";

let activeProfile = { ...DEFAULT_PROFILE };

export function setActiveProfile(profile) {
  activeProfile = { ...profile };
}

export function getActiveProfile() {
  return { ...activeProfile };
}
