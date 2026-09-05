import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializePublicUserView } from '@/lib/serializers';

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.userId;

    // Fetch conversations where user is participant A or B
    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ participantAId: userId }, { participantBId: userId }],
      },
      include: {
        participantA: {
          include: { customer: true },
        },
        participantB: {
          include: { customer: true },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const data = conversations.map((conv) => {
      const isParticipantA = conv.participantAId === userId;
      const partnerUser = isParticipantA ? conv.participantB : conv.participantA;
      const partnerCustomer = partnerUser.customer
        ? serializePublicUserView(partnerUser.customer)
        : null;

      const lastMessage = conv.messages[0] || null;

      return {
        id: conv.id,
        partner: partnerCustomer,
        partnerUserId: partnerUser.id,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content,
              senderId: lastMessage.senderId,
              createdAt: lastMessage.createdAt.toISOString(),
            }
          : null,
        updatedAt: conv.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Conversations GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientUserId } = await request.json();
    if (!recipientUserId) {
      return NextResponse.json({ error: 'Recipient User ID required' }, { status: 400 });
    }

    const userId = session.userId;

    // SERVER-SIDE CHAT ACCESS GUARDRAIL:
    // Verify an accepted MatchRequest connection exists between userId and recipientUserId
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
        { error: 'Connection locked. Chat is only unlocked once match interest is accepted.' },
        { status: 403 }
      );
    }

    // Sort participant IDs deterministically to enforce @@unique([participantAId, participantBId])
    const [participantAId, participantBId] =
      userId < recipientUserId ? [userId, recipientUserId] : [recipientUserId, userId];

    let conversation = await prisma.conversation.findUnique({
      where: {
        participantAId_participantBId: {
          participantAId,
          participantBId,
        },
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantAId,
          participantBId,
        },
      });
    }

    return NextResponse.json({ success: true, conversationId: conversation.id });
  } catch (error) {
    console.error('Conversations POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
