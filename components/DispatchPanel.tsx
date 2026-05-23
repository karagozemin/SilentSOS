"use client";

import type { DispatchMessage } from "@/lib/types";
import { useStickToBottom } from "@/lib/use-stick-to-bottom";

type Props = {
  messages: DispatchMessage[];
};

export function DispatchPanel({ messages }: Props) {
  const scrollRef = useStickToBottom(messages);

  return (
    <section className="shrink-0 flex flex-col rounded-xl border border-amber-500/20 bg-amber-950/10">
      <div className="border-b border-amber-500/20 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.2em] text-amber-500/80">
          Simulated Dispatch
        </p>
        <h2 className="font-mono text-lg font-semibold text-amber-100">
          Operator Channel
        </h2>
      </div>

      <div
        ref={scrollRef}
        className="max-h-48 space-y-2 overflow-y-auto overscroll-contain [overflow-anchor:none] p-4"
      >
        {messages.length === 0 ? (
          <p className="font-mono text-sm text-amber-200/40">
            Waiting for relay…
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="rounded border border-amber-500/15 bg-black/40 px-3 py-2 font-mono text-sm text-amber-100"
            >
              <span className="text-amber-500/70">&gt; </span>
              {msg.content}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
