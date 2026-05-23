import { useEffect, useRef } from "react";

/** Scrolls a container to the bottom when items change — page stays fixed. */
export function useStickToBottom<T>(items: T[]) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [items]);

  return ref;
}
