"use client";

import type { ConversationPhase } from "@/lib/types";
import type { RefObject } from "react";

type Props = {
  phase: ConversationPhase;
  isConnected: boolean;
  isSpeaking: boolean;
  isDemoMode: boolean;
  cameraEnabled: boolean;
  enableCamera: boolean;
  onEnableCameraChange: (enabled: boolean) => void;
  videoRef: RefObject<HTMLVideoElement | null>;
  onStart: () => void;
  onStop: () => void;
  onStartDemo: () => void;
};

const phaseLabels: Record<ConversationPhase, string> = {
  idle: "Ready",
  connecting: "Connecting…",
  listening: "Listening — speak or whisper",
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
  cameraEnabled,
  enableCamera,
  onEnableCameraChange,
  videoRef,
  onStart,
  onStop,
  onStartDemo,
}: Props) {
  const active = isConnected || isDemoMode;

  return (
    <section className="flex h-full flex-col items-center justify-center rounded-xl border border-zinc-800 bg-gradient-to-b from-zinc-950 to-black p-6">
      <div className="mb-4 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-zinc-500">
          SilentSOS Relay
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-white lg:text-3xl">
          When you can&apos;t speak,
          <span className="block text-red-500">AI speaks for you.</span>
        </h1>
        <p className="mt-2 text-xs text-zinc-500">
          D-ID avatar · ElevenAgents voice relay
        </p>
      </div>

      <div className="relative mb-6 w-full max-w-sm">
        <div
          className={`relative aspect-[4/5] overflow-hidden rounded-2xl border-2 bg-black shadow-[0_0_60px_rgba(220,38,38,0.15)] ${
            active ? "border-red-500/50" : "border-zinc-800"
          }`}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={false}
            className={`size-full object-cover transition-opacity duration-300 ${
              active ? "opacity-100" : "opacity-40"
            }`}
          />
          {!active && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/70">
              <p className="px-6 text-center text-sm text-zinc-400">
                Your calm relay agent appears here — face, voice, and presence
                when you need help most.
              </p>
            </div>
          )}
          {isSpeaking && (
            <div className="absolute bottom-3 left-3 rounded-full border border-red-500/30 bg-black/60 px-3 py-1 text-xs text-red-300">
              Speaking for you
            </div>
          )}
          {cameraEnabled && (
            <div className="absolute right-3 top-3 rounded-full border border-emerald-500/30 bg-black/60 px-3 py-1 text-xs text-emerald-300">
              Camera on — agent can see
            </div>
          )}
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/80 px-4 py-2">
        <span
          className={`h-2 w-2 rounded-full ${
            active ? "bg-red-500 animate-pulse" : "bg-zinc-600"
          }`}
        />
        <span className="text-sm text-zinc-300">{phaseLabels[phase]}</span>
        {isSpeaking && (
          <span className="text-xs text-red-400">· Avatar active</span>
        )}
      </div>

      {!active && (
        <label className="mb-4 flex max-w-sm cursor-pointer items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={enableCamera}
            onChange={(event) => onEnableCameraChange(event.target.checked)}
            className="size-4 rounded border-zinc-600 bg-zinc-900 accent-red-500"
          />
          <span>
            Let the agent see me via webcam
            <span className="mt-0.5 block text-xs text-zinc-500">
              Optional — helps the relay agent react to visible distress
            </span>
          </span>
        </label>
      )}

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
        Speak naturally or whisper. The D-ID avatar relays your situation to a
        simulated dispatch operator via ElevenAgents. Simulation only.
      </p>
    </section>
  );
}
