"use client";

import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { ClientShell } from "@/components/ClientShell";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <DisclaimerBanner />
      <header className="shrink-0 border-b border-zinc-900 px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <p className="translate-x-5 font-brand text-2xl font-bold uppercase tracking-[0.14em]">
            <span className="text-white">Silent</span>
            <span className="text-red-500 drop-shadow-[0_0_14px_rgba(239,68,68,0.45)]">
              SOS
            </span>
          </p>
          <div className="text-right">
            <p className="text-xs uppercase tracking-[0.3em] text-red-500">
              ElevenHacks #10
            </p>
            <p className="text-sm text-zinc-500">ElevenLabs Speech Engine</p>
          </div>
        </div>
      </header>
      <ClientShell />
    </div>
  );
}
