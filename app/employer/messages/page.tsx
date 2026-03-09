import { sendEmployerMessageAction } from "@/actions/employer";
import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { LiveSync } from "@/components/chat/live-sync";

export default async function EmployerMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ conversationId?: string }>;
}) {
  const user = await requireRole("EMPLOYER");
  const { conversationId } = await searchParams;

  const conversations = await db.conversation.findMany({
    where: { employerId: user.id },
    include: {
      seeker: true,
      job: true,
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  const activeConversation =
    conversations.find((conversation) => conversation.id === conversationId) || conversations[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <LiveSync />
      <section className="rounded-2xl border border-slate-200 bg-white p-3">
        <h1 className="px-2 pb-2 font-display text-xl font-bold text-slate-900">Messages</h1>
        <div className="space-y-2">
          {conversations.map((conversation) => (
            <a
              key={conversation.id}
              href={`/employer/messages?conversationId=${conversation.id}`}
              className={`block rounded-xl px-3 py-2 ${activeConversation?.id === conversation.id ? "bg-slate-900 text-white" : "hover:bg-slate-100"}`}
            >
              <p className="text-sm font-semibold">{conversation.seeker.fullName}</p>
              <p className={`text-xs ${activeConversation?.id === conversation.id ? "text-slate-200" : "text-slate-500"}`}>{conversation.job.title}</p>
            </a>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        {!activeConversation ? (
          <p className="text-sm text-slate-600">No conversations yet.</p>
        ) : (
          <>
            <div className="border-b border-slate-200 pb-3">
              <h2 className="font-semibold text-slate-900">{activeConversation.seeker.fullName}</h2>
              <p className="text-xs text-slate-500">{activeConversation.job.title}</p>
            </div>
            <div className="max-h-[420px] space-y-3 overflow-y-auto py-4">
              {activeConversation.messages.map((message) => {
                const mine = message.senderId === user.id;
                return (
                  <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${mine ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800"}`}>
                      <p>{message.body}</p>
                      <p className={`mt-1 text-[11px] ${mine ? "text-slate-200" : "text-slate-500"}`}>{new Date(message.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <form action={sendEmployerMessageAction} className="flex gap-2 border-t border-slate-200 pt-3">
              <input type="hidden" name="conversationId" value={activeConversation.id} />
              <input name="body" required placeholder="Type your message" className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm" />
              <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Send</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
