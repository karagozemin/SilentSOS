"use client";

import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { ClientShell } from "@/components/ClientShell";

export default function Home() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <DisclaimerBanner />
      <header className="shrink-0 border-b border-zinc-900 px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <p className="text-lg font-semibold tracking-tight text-white">
            SilentSOS
          </p>
        </div>
      </header>
      <ClientShell />
    </div>
  );
}
