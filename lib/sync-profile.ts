import type { EmergencyProfile } from "@/lib/types";

export async function syncProfileToEngine(
  profile: EmergencyProfile,
): Promise<void> {
  const response = await fetch("/api/profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw new Error("Failed to sync emergency profile to Speech Engine server");
  }
}
