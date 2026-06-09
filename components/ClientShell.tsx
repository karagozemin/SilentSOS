"use client";

import { SilentSOSApp } from "@/components/SilentSOSApp";

export function ClientShell() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <SilentSOSApp />
    </div>
  );
}
