"use client";

import { BrandLogo } from "@/components/BrandLogo";
import type { ConversationPhase } from "@/lib/types";

type Props = {
  phase: ConversationPhase;
  isConnected: boolean;
  isSpeaking: boolean;
  isDemoMode: boolean;
  onStart: () => void;
  onStop: () => void;
  onStartDemo: () => void;
};

const phaseLabels: Record<ConversationPhase, string> = {
  idle: "Ready",
  connecting: "Connecting…",
  user_distress: "Caller distress detected",
  relaying: "Relaying to dispatch",
  safety_check: "Safety check",
  dispatch_confirmed: "Dispatch acknowledged",
};

export function CallScreen({
  phase,
  isConnected,
  isSpeaking,
  isDemoMode,
  onStart,
  onStop,
  onStartDemo,
}: Props) {
  const active = isConnected || isDemoMode;

  return (
    <section className="flex h-full flex-col items-center justify-center rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-950 to-black p-6">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
          SilentSOS Relay
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
          When you can&apos;t speak,
          <span className="block text-red-500">AI speaks for you.</span>
        </h1>
      </div>

      <div className="relative mb-8 flex h-48 w-48 items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full border-2 ${
            active ? "border-red-500/40 animate-pulse-slow" : "border-zinc-800"
          }`}
        />
        <div
          className={`absolute inset-4 rounded-full border ${
            isSpeaking ? "border-red-400/60 animate-ping-slow" : "border-zinc-700"
          }`}
        />
        <div
          className={`relative flex items-center justify-center rounded-2xl p-2 ${
            active ? "shadow-[0_0_80px_rgba(220,38,38,0.25)]" : ""
          }`}
        >
          <BrandLogo
            size={140}
            className={`max-h-[140px] max-w-[140px] transition-transform duration-300 ${
              isSpeaking ? "scale-105" : "scale-100"
            }`}
          />
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2">
        <span
          className={`h-2 w-2 rounded-full ${
            active ? "bg-red-500 animate-pulse" : "bg-zinc-600"
          }`}
        />
        <span className="text-sm text-zinc-300">{phaseLabels[phase]}</span>
        {isSpeaking && (
          <span className="text-xs text-red-400">· AI speaking</span>
        )}
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3">
        {!active ? (
          <>
            <button
              type="button"
              onClick={onStart}
              className="rounded-xl bg-red-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-red-500 active:scale-[0.98]"
            >
              Start Emergency Call
            </button>
            <button
              type="button"
              onClick={onStartDemo}
              className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-300 transition hover:border-zinc-600 hover:bg-zinc-800"
            >
              Run Demo Mode
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={onStop}
            className="rounded-xl border border-zinc-700 bg-zinc-900 px-6 py-4 text-base font-semibold text-zinc-200 transition hover:bg-zinc-800"
          >
            End Call
          </button>
        )}
      </div>

      <p className="mt-6 max-w-xs text-center text-xs text-zinc-600">
        Speak naturally or whisper. The AI relay agent will communicate on your
        behalf to a simulated dispatch operator.
      </p>
    </section>
  );
}
