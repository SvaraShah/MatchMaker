import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializePublicUserView } from '@/lib/serializers';

export async function GET() {
  try {
    const session = await requireUser();

    const received = await prisma.matchRequest.findMany({
      where: { receiverId: session.userId },
      include: {
        sender: {
          include: {
            customer: { include: { preference: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const sent = await prisma.matchRequest.findMany({
      where: { senderId: session.userId },
      include: {
        receiver: {
          include: {
            customer: { include: { preference: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedReceived = received.map((r: any) => ({
      id: r.id,
      status: r.status,
      message: r.message,
      createdAt: r.createdAt,
      senderProfile: r.sender?.customer
        ? serializePublicUserView(r.sender.customer, r.sender.customer.preference)
        : null,
    }));

    const formattedSent = sent.map((r: any) => ({
      id: r.id,
      status: r.status,
      message: r.message,
      createdAt: r.createdAt,
      receiverProfile: r.receiver?.customer
        ? serializePublicUserView(r.receiver.customer, r.receiver.customer.preference)
        : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        received: formattedReceived,
        sent: formattedSent,
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('API Get Requests Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
