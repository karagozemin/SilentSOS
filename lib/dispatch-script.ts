import type { ConversationPhase } from "./types";

type DispatchTrigger = {
  match: RegExp;
  response: string;
  nextPhase: ConversationPhase;
};

const USER_DISPATCH_TRIGGERS: DispatchTrigger[] = [
  {
    match: /can't talk|cannot speak|unable to speak|help me|help…/i,
    response: "Dispatch: Caller needs assistance — may be unable to speak.",
    nextPhase: "relaying",
  },
  {
    match: /hiding|someone (is )?outside|break(?:ing)? in|threat|following me/i,
    response: "Dispatch: Possible threat reported. Caller may be hiding.",
    nextPhase: "relaying",
  },
  {
    match: /not safe|unsafe|in danger|^no$/i,
    response: "Dispatch: Caller reports NOT safe. Marking urgent.",
    nextPhase: "dispatch_confirmed",
  },
  {
    match: /^yes$|i'?m safe|safe now|i am safe/i,
    response: "Dispatch: Caller confirms they are safe for now.",
    nextPhase: "safety_check",
  },
  {
    match: /bornova|izmir|location|at home|my address/i,
    response: "Dispatch: Location update received from caller.",
    nextPhase: "relaying",
  },
];

const AGENT_DISPATCH_TRIGGERS: DispatchTrigger[] = [
  {
    match: /relaying to dispatch/i,
    response: "Dispatch: Copy. Received relay update.",
    nextPhase: "relaying",
  },
  {
    match: /not safe|unsafe|in danger|requesting immediate|urgent/i,
    response: "Dispatch: Acknowledged. Marking as urgent.",
    nextPhase: "dispatch_confirmed",
  },
  {
    match: /are you safe|safe right now|say yes or no/i,
    response: "Dispatch: Awaiting safety confirmation from caller.",
    nextPhase: "safety_check",
  },
];

export function getDispatchFromUser(userText: string): {
  response: string | null;
  nextPhase: ConversationPhase | null;
} {
  for (const trigger of USER_DISPATCH_TRIGGERS) {
    if (trigger.match.test(userText)) {
      return { response: trigger.response, nextPhase: trigger.nextPhase };
    }
  }
  return { response: null, nextPhase: null };
}

export function getDispatchFromAgent(agentText: string): {
  response: string | null;
  nextPhase: ConversationPhase | null;
} {
  for (const trigger of AGENT_DISPATCH_TRIGGERS) {
    if (trigger.match.test(agentText)) {
      return { response: trigger.response, nextPhase: trigger.nextPhase };
    }
  }
  return { response: null, nextPhase: null };
}

type DemoStep = {
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
    delayMs: 6500,
    role: "agent",
    content:
      "Relaying to dispatch: Caller unable to speak clearly. Location Bornova, Izmir. Possible threat — caller is hiding. Are you safe?",
    phase: "relaying",
  },
  {
    delayMs: 8000,
    role: "dispatch",
    content: "Dispatch: Awaiting safety confirmation from caller.",
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
      "Relaying to dispatch: Caller reports NOT safe. Requesting immediate assistance.",
    phase: "dispatch_confirmed",
  },
  {
    delayMs: 13500,
    role: "dispatch",
    content: "Dispatch: Acknowledged. Help is being routed. Simulation complete.",
  },
];
