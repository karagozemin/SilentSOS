"use client";

import { SilentSOSApp } from "@/components/SilentSOSApp";
import { ConversationProvider } from "@elevenlabs/react";

export function ClientShell() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <ConversationProvider>
        <SilentSOSApp />
      </ConversationProvider>
    </div>
  );
}
