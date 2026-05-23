"use client";

import type { TranscriptEntry } from "@/lib/types";
import { useStickToBottom } from "@/lib/use-stick-to-bottom";

type Props = {
  entries: TranscriptEntry[];
};

const roleStyles: Record<TranscriptEntry["role"], string> = {
  user: "border-l-blue-500/70 bg-blue-950/20",
  agent: "border-l-red-500/70 bg-red-950/20",
  dispatch: "border-l-amber-500/70 bg-amber-950/20",
  system: "border-l-zinc-600 bg-zinc-900/40",
};

const roleLabels: Record<TranscriptEntry["role"], string> = {
  user: "You",
  agent: "SilentSOS",
  dispatch: "Dispatch",
  system: "System",
};

export function TranscriptPanel({ entries }: Props) {
  const scrollRef = useStickToBottom(entries);

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950/80">
      <div className="border-b border-zinc-800 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
          Live Transcript
        </p>
        <h2 className="text-lg font-semibold text-zinc-100">Conversation Log</h2>
      </div>

      <div
        ref={scrollRef}
        className="scroll-panel min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain [overflow-anchor:none] p-4"
      >
        {entries.length === 0 ? (
          <p className="text-sm text-zinc-600">
            Transcript will appear here once the call starts.
          </p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className={`rounded-lg border-l-2 px-3 py-2 ${roleStyles[entry.role]}`}
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                  {roleLabels[entry.role]}
                </span>
                <span className="text-[10px] text-zinc-600">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-zinc-200">
                {entry.content}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
