"use client";

import { SilentSOSApp } from "@/components/SilentSOSApp";
import { ConversationProvider } from "@elevenlabs/react";

export function ClientShell() {
  return (
    <ConversationProvider>
      <SilentSOSApp />
    </ConversationProvider>
  );
}
