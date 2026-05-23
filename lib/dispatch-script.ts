import type { ConversationPhase } from "./types";

export type DispatchTrigger = {
  match: RegExp;
  response: string;
  nextPhase: ConversationPhase;
};

export const DISPATCH_TRIGGERS: DispatchTrigger[] = [
  {
    match: /relaying to dispatch/i,
    response: "Dispatch: Copy. What's the nature of the emergency?",
    nextPhase: "relaying",
  },
  {
    match: /unable to speak|can't speak|cannot speak/i,
    response: "Dispatch: Understood. Confirming location and caller status.",
    nextPhase: "relaying",
  },
  {
    match: /not safe|unsafe|in danger/i,
    response: "Dispatch: Acknowledged. Marking as urgent. Stay on the line.",
    nextPhase: "dispatch_confirmed",
  },
  {
    match: /are they safe|is (the )?user safe|safe right now/i,
    response: "Dispatch: Are they safe right now? Need a yes or no.",
    nextPhase: "safety_check",
  },
  {
    match: /requesting immediate|dispatch help|send help/i,
    response: "Dispatch: Help is being routed. Simulation complete.",
    nextPhase: "dispatch_confirmed",
  },
];

export function getDispatchResponse(agentText: string): {
  response: string | null;
  nextPhase: ConversationPhase | null;
} {
  for (const trigger of DISPATCH_TRIGGERS) {
    if (trigger.match.test(agentText)) {
      return { response: trigger.response, nextPhase: trigger.nextPhase };
    }
  }
  return { response: null, nextPhase: null };
}

export type DemoStep = {
  delayMs: number;
  role: "user" | "agent" | "dispatch" | "system";
  content: string;
  phase?: ConversationPhase;
};

export const DEMO_SCRIPT: DemoStep[] = [
  {
    delayMs: 0,
    role: "system",
    content: "Demo mode started — simulation only",
    phase: "connecting",
  },
  {
    delayMs: 1500,
    role: "user",
    content: "help… I can't talk",
    phase: "user_distress",
  },
  {
    delayMs: 2500,
    role: "agent",
    content: "I'm here. I'll speak for you. What's happening?",
  },
  {
    delayMs: 4000,
    role: "user",
    content: "someone is outside… I'm hiding",
  },
  {
    delayMs: 5500,
    role: "agent",
    content:
      "Relaying to dispatch: Caller unable to speak clearly. Location Bornova, Izmir. Possible threat — caller is hiding.",
    phase: "relaying",
  },
  {
    delayMs: 7000,
    role: "dispatch",
    content: "Dispatch: Copy. Are they safe right now?",
    phase: "safety_check",
  },
  {
    delayMs: 9000,
    role: "agent",
    content: "Are you safe? Say yes or no.",
  },
  {
    delayMs: 11000,
    role: "user",
    content: "no",
  },
  {
    delayMs: 12500,
    role: "agent",
    content:
      "Relaying to dispatch: User is NOT safe. Requesting immediate assistance.",
    phase: "dispatch_confirmed",
  },
  {
    delayMs: 14000,
    role: "dispatch",
    content: "Dispatch: Acknowledged. Help is being routed. Simulation complete.",
  },
];
