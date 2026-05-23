"use client";

import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { ClientShell } from "@/components/ClientShell";

export default function Home() {
  return (
    <>
      <DisclaimerBanner />
      <header className="border-b border-zinc-900 px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-red-500">
              ElevenHacks #10
            </p>
            <h1 className="text-xl font-bold text-white">SilentSOS</h1>
          </div>
          <p className="hidden text-sm text-zinc-500 sm:block">
            Voice relay prototype · ElevenLabs Speech Engine
          </p>
        </div>
      </header>
      <ClientShell />
    </>
  );
}
