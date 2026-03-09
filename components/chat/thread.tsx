"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type Message = {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
};

type ThreadProps = {
  conversationId: string;
  currentUserId: string;
  headerTitle: string;
  headerSubtitle: string;
  initialMessages: Message[];
  emptyLabel?: string;
};

export function Thread({
  conversationId,
  currentUserId,
  headerTitle,
  headerSubtitle,
  initialMessages,
  emptyLabel = "No messages yet.",
}: ThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  const apiBase = useMemo(() => `/api/messages/${conversationId}`, [conversationId]);

  useEffect(() => {
    setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    const poll = async () => {
      const response = await fetch(apiBase, { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { messages: Message[] };
      setMessages(data.messages);
    };

    const intervalId = window.setInterval(() => {
      if (!document.hidden) void poll();
    }, 1000);

    const onFocus = () => void poll();
    const onVisible = () => {
      if (!document.hidden) void poll();
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [apiBase]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || sending) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: Message = {
      id: tempId,
      senderId: currentUserId,
      body,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setDraft("");
    setSending(true);

    try {
      const response = await fetch(`${apiBase}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });

      if (!response.ok) {
        setMessages((prev) => prev.filter((message) => message.id !== tempId));
        return;
      }

      const data = (await response.json()) as { message: Message };
      setMessages((prev) => prev.map((message) => (message.id === tempId ? data.message : message)));
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <div className="border-b border-slate-200 pb-3">
        <h2 className="font-semibold text-slate-900">{headerTitle}</h2>
        <p className="text-xs text-slate-500">{headerSubtitle}</p>
      </div>

      <div ref={listRef} className="max-h-[420px] space-y-3 overflow-y-auto py-4">
        {messages.length === 0 ? (
          <p className="text-sm text-slate-600">{emptyLabel}</p>
        ) : (
          messages.map((message) => {
            const mine = message.senderId === currentUserId;
            return (
              <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800"}`}
                >
                  <p>{message.body}</p>
                  <p className={`mt-1 text-[11px] ${mine ? "text-slate-200" : "text-slate-500"}`}>
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2 border-t border-slate-200 pt-3">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          required
          placeholder="Type your message"
          className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={sending}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          Send
        </button>
      </form>
    </>
  );
}
