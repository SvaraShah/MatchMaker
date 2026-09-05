import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { sseManager } from '@/lib/sse';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const userId = session.userId;

    // Verify user is a participant in this conversation
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (
      !conversation ||
      (conversation.participantAId !== userId && conversation.participantBId !== userId)
    ) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });

    // Mark unread messages from other participant as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        readAt: null,
      },
      data: { readAt: new Date() },
    });

    const data = messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      senderId: m.senderId,
      content: m.content,
      readAt: m.readAt ? m.readAt.toISOString() : null,
      createdAt: m.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const { content } = await request.json();

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
    }

    const userId = session.userId;

    // Verify conversation access
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (
      !conversation ||
      (conversation.participantAId !== userId && conversation.participantBId !== userId)
    ) {
      return NextResponse.json({ error: 'Forbidden: Access denied' }, { status: 403 });
    }

    const recipientUserId =
      conversation.participantAId === userId
        ? conversation.participantBId
        : conversation.participantAId;

    // SERVER-SIDE CHAT SECURITY GUARDRAIL:
    // Verify connection remains accepted
    const connection = await prisma.matchRequest.findFirst({
      where: {
        status: 'accepted',
        OR: [
          { senderId: userId, receiverId: recipientUserId },
          { senderId: recipientUserId, receiverId: userId },
        ],
      },
    });

    if (!connection) {
      return NextResponse.json(
        { error: 'Forbidden: Chat is locked. Match interest must be accepted.' },
        { status: 403 }
      );
    }

    // Create Message in PostgreSQL
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content: content.trim(),
      },
    });

    const msgPayload = {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      content: message.content,
      createdAt: message.createdAt.toISOString(),
    };

    // Broadcast message event via native Server-Sent Events (SSE) stream
    sseManager.emit('new_message', msgPayload);

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Create Notification for recipient
    await prisma.notification.create({
      data: {
        userId: recipientUserId,
        type: 'new_message',
        title: 'New Matrimonial Message',
        message: `${session.name} sent you a message.`,
        link: '/app/chat',
      },
    });

    return NextResponse.json({
      success: true,
      data: msgPayload,
    });
  } catch (error) {
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
