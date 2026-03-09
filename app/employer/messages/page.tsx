import { requireRole } from "@/lib/auth";
import { db } from "@/lib/db";
import { Thread } from "@/components/chat/thread";

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
      messages: { orderBy: { createdAt: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const activeConversation =
    conversations.find((conversation) => conversation.id === conversationId) || conversations[0];

  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
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
          <Thread
            conversationId={activeConversation.id}
            currentUserId={user.id}
            headerTitle={activeConversation.seeker.fullName}
            headerSubtitle={activeConversation.job.title}
            initialMessages={activeConversation.messages.map((message) => ({
              id: message.id,
              senderId: message.senderId,
              body: message.body,
              createdAt: message.createdAt.toISOString(),
            }))}
          />
        )}
      </section>
    </div>
  );
}
