import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const body = await request.json();
    const { candidateId, message } = body;

    if (!candidateId) {
      return NextResponse.json({ success: false, error: 'candidateId is required' }, { status: 400 });
    }

    // Resolve target candidate's user
    const candidateCustomer = await prisma.customer.findUnique({
      where: { id: candidateId },
      include: { user: true },
    });

    if (!candidateCustomer || !candidateCustomer.userId) {
      return NextResponse.json({ success: false, error: 'Target user not found' }, { status: 404 });
    }

    const receiverId = candidateCustomer.userId;

    if (session.userId === receiverId) {
      return NextResponse.json({ success: false, error: 'Cannot send request to yourself' }, { status: 400 });
    }

    const matchRequest = await prisma.matchRequest.upsert({
      where: {
        senderId_receiverId: {
          senderId: session.userId,
          receiverId,
        },
      },
      update: {
        status: 'pending',
        message: message || undefined,
        updatedAt: new Date(),
      },
      create: {
        senderId: session.userId,
        receiverId,
        status: 'pending',
        message: message || null,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'INTEREST_EXPRESSED',
        entityType: 'MatchRequest',
        entityId: matchRequest.id,
        metadata: JSON.stringify({ receiverId, candidateId }),
      },
    });

    return NextResponse.json({
      success: true,
      data: matchRequest,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('API Express Interest Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
