import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

const DUPLICATE_WINDOW_MS = 8_000;

export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId } = await params;
  if (!conversationId) {
    return NextResponse.json({ error: "Missing conversation id" }, { status: 400 });
  }

  const payload = (await request.json().catch(() => null)) as { body?: string } | null;
  const body = String(payload?.body || "").trim();
  if (!body) {
    return NextResponse.json({ error: "Message body is required" }, { status: 400 });
  }
  if (body.length > 1200) {
    return NextResponse.json({ error: "Message too long" }, { status: 400 });
  }

  const conversation = await db.conversation.findUnique({
    where: { id: conversationId },
    select: { id: true, seekerId: true, employerId: true },
  });
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const canAccess =
    conversation.seekerId === session.userId || conversation.employerId === session.userId;
  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const lastMessage = await db.message.findFirst({
    where: { conversationId, senderId: session.userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, body: true, createdAt: true },
  });

  const isRapidDuplicate =
    !!lastMessage &&
    lastMessage.body === body &&
    Date.now() - new Date(lastMessage.createdAt).getTime() < DUPLICATE_WINDOW_MS;

  if (isRapidDuplicate) {
    return NextResponse.json({
      message: {
        id: lastMessage.id,
        senderId: session.userId,
        body: lastMessage.body,
        createdAt: lastMessage.createdAt.toISOString(),
      },
      duplicate: true,
    });
  }

  const [message] = await db.$transaction([
    db.message.create({
      data: {
        conversationId,
        senderId: session.userId,
        body,
      },
    }),
    db.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return NextResponse.json({
    message: {
      id: message.id,
      senderId: message.senderId,
      body: message.body,
      createdAt: message.createdAt.toISOString(),
    },
    duplicate: false,
  });
}
