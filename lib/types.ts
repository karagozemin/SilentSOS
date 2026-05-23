export type ConversationPhase =
  | "idle"
  | "connecting"
  | "listening"
  | "user_distress"
  | "relaying"
  | "safety_check"
  | "dispatch_confirmed";

export type EmergencyProfile = {
  name: string;
  location: string;
  emergencyType: string;
  medicalNotes: string;
};

export type TranscriptEntry = {
  id: string;
  role: "user" | "agent" | "dispatch" | "system";
  content: string;
  timestamp: number;
};

export type DispatchMessage = {
  id: string;
  content: string;
  timestamp: number;
};

export const DEFAULT_PROFILE: EmergencyProfile = {
  name: "Alex Morgan",
  location: "Bornova, Izmir",
  emergencyType: "Possible threat / unable to speak",
  medicalNotes: "None reported",
};
