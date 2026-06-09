"use client";

import { CallScreen } from "@/components/CallScreen";
import { DispatchPanel } from "@/components/DispatchPanel";
import { EmergencyProfileForm } from "@/components/EmergencyProfile";
import { TranscriptPanel } from "@/components/TranscriptPanel";
import { DEMO_SCRIPT, getDispatchFromAgent, getDispatchFromUser } from "@/lib/dispatch-script";
import { normalizeAgentSpeech } from "@/lib/sanitize-agent-speech";
import { syncAgentProfile } from "@/lib/sync-profile";
import type {
  ConversationPhase,
  DispatchMessage,
  EmergencyProfile,
  TranscriptEntry,
} from "@/lib/types";
import { DEFAULT_PROFILE } from "@/lib/types";
import { useDidAgent } from "@/lib/use-did-agent";
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
  const [enableCamera, setEnableCamera] = useState(false);
  const demoAbortRef = useRef(false);
  const isDemoModeRef = useRef(false);
  const processedMessageIds = useRef<Set<string>>(new Set());

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
      const cleaned = normalizeAgentSpeech(text);
      addEntry("agent", cleaned);
      const { response, nextPhase } = getDispatchFromAgent(cleaned);
      if (response) addDispatch(response);
      if (nextPhase) setPhase(nextPhase);
    },
    [addDispatch, addEntry],
  );

  const handleUserText = useCallback(
    (text: string) => {
      addEntry("user", text);
      setPhase("user_distress");
      const { response, nextPhase } = getDispatchFromUser(text);
      if (response) addDispatch(response);
      if (nextPhase) setPhase(nextPhase);
    },
    [addDispatch, addEntry],
  );

  const processIncomingMessages = useCallback(
    (
      messages: Array<{ id?: string; role?: string; content?: string }>,
      type: "answer" | "user",
    ) => {
      for (const message of messages) {
        if (!message.content || !message.id) continue;
        if (processedMessageIds.current.has(message.id)) continue;
        processedMessageIds.current.add(message.id);

        if (type === "user" || message.role === "user") {
          handleUserText(message.content);
        } else if (message.role === "assistant") {
          handleAgentText(message.content);
        }
      }
    },
    [handleAgentText, handleUserText],
  );

  const didAgent = useDidAgent({
    onConnect: () => {
      setPhase("listening");
      addEntry("system", "Avatar connected — speak or whisper");
    },
    onDisconnect: () => {
      if (!isDemoModeRef.current) {
        setPhase("idle");
        addEntry("system", "Call ended");
      }
    },
    onError: (message) => {
      addEntry("system", `Error: ${message}`);
      setPhase("idle");
      setIsDemoMode(false);
    },
    onNewMessage: (messages, type) => {
      if (type === "partial") return;
      processIncomingMessages(messages, type);
    },
  });

  const resetSession = useCallback(() => {
    demoAbortRef.current = true;
    isDemoModeRef.current = false;
    processedMessageIds.current.clear();
    setIsDemoMode(false);
    setPhase("idle");
    setEntries([]);
    setDispatchMessages([]);
  }, []);

  const startCall = useCallback(async () => {
    resetSession();
    demoAbortRef.current = false;
    setPhase("connecting");

    try {
      addEntry("system", "Syncing profile to ElevenAgents…");
      await syncAgentProfile(profile);
      await didAgent.connect({
        enableCamera,
        enableMicrophone: true,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to start call";
      addEntry("system", message);
      setPhase("idle");
      await didAgent.disconnect();
    }
  }, [addEntry, didAgent, enableCamera, profile, resetSession]);

  const stopCall = useCallback(async () => {
    demoAbortRef.current = true;
    await didAgent.disconnect();
    resetSession();
  }, [didAgent, resetSession]);

  const startDemo = useCallback(async () => {
    resetSession();
    demoAbortRef.current = false;
    isDemoModeRef.current = true;
    setIsDemoMode(true);
    setPhase("connecting");

    try {
      await syncAgentProfile(profile);
      await didAgent.connect({ enableMicrophone: false, enableCamera: false });

      for (const step of DEMO_SCRIPT) {
        if (demoAbortRef.current) return;

        if (step.pauseMs > 0) {
          await new Promise((resolve) => setTimeout(resolve, step.pauseMs));
        }
        if (demoAbortRef.current) return;

        if (step.phase) setPhase(step.phase);
        addEntry(step.role, step.content);

        if (step.role === "dispatch") addDispatch(step.content);
        if (step.role === "user") {
          const { response, nextPhase } = getDispatchFromUser(step.content);
          if (response) addDispatch(response);
          if (nextPhase) setPhase(nextPhase);
        }
        if (step.role === "agent") {
          const { response, nextPhase } = getDispatchFromAgent(step.content);
          if (response) addDispatch(response);
          if (nextPhase) setPhase(nextPhase);
          await didAgent.speak(step.content);
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Demo mode failed";
      addEntry("system", message);
    } finally {
      if (!demoAbortRef.current) {
        addEntry("system", "Demo complete — simulation only");
      }
    }
  }, [addDispatch, addEntry, didAgent, profile, resetSession]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    void syncAgentProfile(profile);
  }, [profile]);

  const active = didAgent.isConnected || isDemoMode;

  return (
    <div className="mx-auto grid min-h-0 w-full max-w-7xl flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[280px_1fr_320px]">
      <EmergencyProfileForm
        profile={profile}
        onChange={setProfile}
        disabled={active}
      />

      <CallScreen
        phase={phase}
        isConnected={didAgent.isConnected}
        isSpeaking={didAgent.isSpeaking}
        isDemoMode={isDemoMode}
        cameraEnabled={didAgent.cameraEnabled}
        enableCamera={enableCamera}
        onEnableCameraChange={setEnableCamera}
        videoRef={didAgent.videoRef}
        onStart={startCall}
        onStop={stopCall}
        onStartDemo={startDemo}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden">
        <TranscriptPanel entries={entries} />
        <DispatchPanel messages={dispatchMessages} />
      </div>
    </div>
  );
}
