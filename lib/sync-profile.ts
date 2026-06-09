import type { EmergencyProfile } from "@/lib/types";

export async function syncAgentProfile(
  profile: EmergencyProfile,
): Promise<void> {
  const response = await fetch("/api/agent-profile", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(profile),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(body?.error ?? "Failed to sync profile to ElevenAgents");
  }
}
