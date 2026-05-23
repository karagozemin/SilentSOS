"use client";

import { BrandLogo } from "@/components/BrandLogo";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { ClientShell } from "@/components/ClientShell";

export default function Home() {
  return (
    <>
      <DisclaimerBanner />
      <header className="border-b border-zinc-900 px-4 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogo size={52} priority className="max-h-[52px] max-w-[52px]" />
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-red-500">
                ElevenHacks #10
              </p>
              <p className="text-sm text-zinc-500">
                Voice relay prototype
              </p>
            </div>
          </div>
          <p className="hidden text-sm text-zinc-500 sm:block">
            ElevenLabs Speech Engine
          </p>
        </div>
      </header>
      <ClientShell />
    </>
  );
}
