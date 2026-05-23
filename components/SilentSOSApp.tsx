"use client";

import { CallScreen } from "@/components/CallScreen";
import { DispatchPanel } from "@/components/DispatchPanel";
import { EmergencyProfileForm } from "@/components/EmergencyProfile";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { FIRST_MESSAGE } from "@/lib/agent-prompt";
import { DEMO_SCRIPT, getDispatchResponse } from "@/lib/dispatch-script";
import { syncProfileToEngine } from "@/lib/sync-profile";
import type {
  ConversationPhase,
  DispatchMessage,
  EmergencyProfile,
  TranscriptEntry,
} from "@/lib/types";
import { DEFAULT_PROFILE } from "@/lib/types";
import { useConversation } from "@elevenlabs/react";
import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "silentsos-profile";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function loadStoredProfile(): EmergencyProfile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return DEFAULT_PROFILE;
  try {
    return JSON.parse(stored) as EmergencyProfile;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function SilentSOSApp() {
  const [profile, setProfile] = useState<EmergencyProfile>(loadStoredProfile);
  const [phase, setPhase] = useState<ConversationPhase>("idle");
  const [entries, setEntries] = useState<TranscriptEntry[]>([]);
  const [dispatchMessages, setDispatchMessages] = useState<DispatchMessage[]>(
    [],
  );
  const [isDemoMode, setIsDemoMode] = useState(false);
  const demoTimeouts = useRef<number[]>([]);

  const addEntry = useCallback(
    (role: TranscriptEntry["role"], content: string) => {
      setEntries((prev) => [
        ...prev,
        { id: createId(), role, content, timestamp: Date.now() },
      ]);
    },
    [],
  );

  const addDispatch = useCallback((content: string) => {
    setDispatchMessages((prev) => [
      ...prev,
      { id: createId(), content, timestamp: Date.now() },
    ]);
  }, []);

  const handleAgentText = useCallback(
    (text: string) => {
      addEntry("agent", text);
      const { response, nextPhase } = getDispatchResponse(text);
      if (response) {
        addDispatch(response);
      }
      if (nextPhase) {
        setPhase(nextPhase);
      }
    },
    [addDispatch, addEntry],
  );

  const conversation = useConversation({
    onConnect: () => {
      setPhase("connecting");
      addEntry("system", "Voice connection established");
    },
    onDisconnect: () => {
      setPhase("idle");
      addEntry("system", "Call ended");
    },
    onError: (message) => {
      addEntry("system", `Error: ${message}`);
      setPhase("idle");
    },
    onInterruption: () => {
      addEntry("system", "User interrupted — listening");
    },
    onMessage: ({ message, role, source }) => {
      if (!message) return;

      const speaker = role ?? source;
      if (speaker === "user") {
        addEntry("user", message);
        setPhase("user_distress");
      } else {
        handleAgentText(message);
      }
    },
  });

  const clearDemoTimeouts = useCallback(() => {
    demoTimeouts.current.forEach((id) => window.clearTimeout(id));
    demoTimeouts.current = [];
  }, []);

  const resetSession = useCallback(() => {
    clearDemoTimeouts();
    setIsDemoMode(false);
    setPhase("idle");
    setEntries([]);
    setDispatchMessages([]);
  }, [clearDemoTimeouts]);

  const syncProfile = useCallback(async (nextProfile: EmergencyProfile) => {
    await syncProfileToEngine(nextProfile);
  }, []);

  const startCall = useCallback(async () => {
    resetSession();
    setPhase("connecting");

    try {
      await syncProfile(profile);
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const tokenRes = await fetch("/api/token", { method: "POST" });
      if (!tokenRes.ok) {
        throw new Error("Failed to get conversation token");
      }
      const { token } = (await tokenRes.json()) as { token: string };

      conversation.startSession({
        conversationToken: token,
        overrides: {
          agent: {
            firstMessage: FIRST_MESSAGE,
          },
        },
      });

      addEntry("agent", FIRST_MESSAGE);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to start call";
      addEntry("system", message);
      setPhase("idle");
    }
  }, [addEntry, conversation, profile, resetSession, syncProfile]);

  const stopCall = useCallback(async () => {
    clearDemoTimeouts();
    if (isDemoMode) {
      resetSession();
      return;
    }
    conversation.endSession();
    setPhase("idle");
    setIsDemoMode(false);
  }, [clearDemoTimeouts, conversation, isDemoMode, resetSession]);

  const startDemo = useCallback(() => {
    resetSession();
    setIsDemoMode(true);
    setPhase("connecting");

    let elapsed = 0;
    for (const step of DEMO_SCRIPT) {
      elapsed += step.delayMs;
      const timeoutId = window.setTimeout(() => {
        if (step.phase) setPhase(step.phase);
        addEntry(step.role, step.content);
        if (step.role === "dispatch") {
          addDispatch(step.content);
        }
        if (step.role === "agent") {
          const { nextPhase } = getDispatchResponse(step.content);
          if (nextPhase) setPhase(nextPhase);
        }
      }, elapsed);
      demoTimeouts.current.push(timeoutId);
    }
  }, [addDispatch, addEntry, resetSession]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    void syncProfile(profile);
  }, [profile, syncProfile]);

  useEffect(() => {
    return () => clearDemoTimeouts();
  }, [clearDemoTimeouts]);

  const isConnected = conversation.status === "connected";

  return (
    <div className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 gap-4 p-4 lg:grid-cols-[280px_1fr_320px]">
      <EmergencyProfileForm
        profile={profile}
        onChange={setProfile}
        disabled={isConnected || isDemoMode}
      />

      <CallScreen
        phase={phase}
        isConnected={isConnected}
        isSpeaking={conversation.isSpeaking}
        isDemoMode={isDemoMode}
        onStart={startCall}
        onStop={stopCall}
        onStartDemo={startDemo}
      />

      <div className="flex min-h-0 flex-col gap-4">
        <TranscriptPanel entries={entries} />
        <DispatchPanel messages={dispatchMessages} />
      </div>
    </div>
  );
}
