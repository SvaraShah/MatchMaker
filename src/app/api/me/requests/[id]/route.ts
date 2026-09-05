import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireUser();
    const { id } = await params;
    const body = await request.json();
    const { status } = body; // 'accepted' | 'declined' | 'withdrawn'

    if (!['accepted', 'declined', 'withdrawn'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 });
    }

    const matchRequest = await prisma.matchRequest.findUnique({
      where: { id },
    });

    if (!matchRequest) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404 });
    }

    // Verify ownership
    if (status === 'withdrawn' && matchRequest.senderId !== session.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    if ((status === 'accepted' || status === 'declined') && matchRequest.receiverId !== session.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.matchRequest.update({
      where: { id },
      data: { status, updatedAt: new Date() },
    });

    // If accepted -> automatically create/ensure Conversation record and notify sender
    if (status === 'accepted') {
      const senderId = matchRequest.senderId;
      const receiverId = matchRequest.receiverId;

      const [participantAId, participantBId] =
        senderId < receiverId ? [senderId, receiverId] : [receiverId, senderId];

      await prisma.conversation.upsert({
        where: {
          participantAId_participantBId: {
            participantAId,
            participantBId,
          },
        },
        update: { updatedAt: new Date() },
        create: {
          participantAId,
          participantBId,
        },
      });

      await prisma.notification.create({
        data: {
          userId: senderId,
          type: 'interest_accepted',
          title: 'Interest Request Accepted!',
          message: 'Your matrimonial interest request was accepted. Real-time chat is now unlocked!',
          link: '/app/chat',
        },
      });
    } else if (status === 'declined') {
      await prisma.notification.create({
        data: {
          userId: matchRequest.senderId,
          type: 'interest_declined',
          title: 'Interest Request Update',
          message: 'Your interest request was declined.',
          link: '/app/requests',
        },
      });
    }

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: `REQUEST_${status.toUpperCase()}`,
        entityType: 'MatchRequest',
        entityId: id,
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('API Update Request Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
