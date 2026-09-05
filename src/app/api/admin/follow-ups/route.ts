import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');
    const filter = searchParams.get('filter'); // 'today' | 'overdue' | 'upcoming' | 'completed'

    const todayStr = new Date().toISOString().split('T')[0];

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (status) where.status = status;

    if (filter === 'today') {
      where.dueDate = todayStr;
      where.status = 'pending';
    } else if (filter === 'overdue') {
      where.dueDate = { lt: todayStr };
      where.status = 'pending';
    } else if (filter === 'upcoming') {
      where.dueDate = { gt: todayStr };
      where.status = 'pending';
    } else if (filter === 'completed') {
      where.status = 'completed';
    }

    const followUps = await prisma.followUp.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            city: true,
            journeyStatus: true,
          },
        },
        match: {
          include: {
            candidate: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: followUps });
  } catch (error) {
    console.error('Follow-ups GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customerId, matchId, title, dueDate, priority, notes } = body;

    if (!customerId || !title || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const followUp = await prisma.followUp.create({
      data: {
        customerId,
        matchId: matchId || null,
        title: title.trim(),
        dueDate: dueDate.trim(),
        priority: priority || 'medium',
        status: 'pending',
        notes: notes ? notes.trim() : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'FOLLOWUP_CREATED',
        entityType: 'FollowUp',
        entityId: followUp.id,
      },
    });

    return NextResponse.json({ success: true, data: followUp });
  } catch (error) {
    console.error('Follow-ups POST error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status, dueDate, notes, priority } = body;

    if (!id) {
      return NextResponse.json({ error: 'Follow-up ID required' }, { status: 400 });
    }

    const data: any = {};
    if (status) data.status = status;
    if (dueDate) data.dueDate = dueDate;
    if (notes !== undefined) data.notes = notes;
    if (priority) data.priority = priority;

    const updated = await prisma.followUp.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: `FOLLOWUP_${status ? status.toUpperCase() : 'UPDATED'}`,
        entityType: 'FollowUp',
        entityId: id,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Follow-ups PATCH error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
