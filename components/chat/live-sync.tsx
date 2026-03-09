"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

export function LiveSync({ intervalMs = 2500 }: { intervalMs?: number }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const lastRefreshAt = useRef(0);

  useEffect(() => {
    const refresh = () => {
      if (document.hidden || isPending) return;
      const now = Date.now();
      if (now - lastRefreshAt.current < 1000) return;
      lastRefreshAt.current = now;
      startTransition(() => router.refresh());
    };

    const intervalId = window.setInterval(refresh, intervalMs);
    const onFocus = () => refresh();
    const onVisible = () => refresh();

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [intervalMs, isPending, router]);

  return null;
}
