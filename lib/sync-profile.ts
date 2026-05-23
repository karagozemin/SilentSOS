import type { EmergencyProfile } from "@/lib/types";

export async function syncProfileToEngine(
  profile: EmergencyProfile,
): Promise<void> {
  const engineUrl = (
    process.env.NEXT_PUBLIC_ENGINE_URL ?? "http://localhost:3001"
  ).replace(/\/$/, "");

  const response = await fetch(`${engineUrl}/profile`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    throw new Error("Failed to sync emergency profile to Speech Engine server");
  }
}
