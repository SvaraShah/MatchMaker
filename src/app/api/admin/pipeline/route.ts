import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializeAdminView } from '@/lib/serializers';

export const PIPELINE_STAGES = [
  'New Lead',
  'Profile Review',
  'Preferences Verified',
  'Matching',
  'Proposed',
  'Interest',
  'Connected',
  'Follow-up',
  'Matched',
];

export async function GET() {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customers = await prisma.customer.findMany({
      include: {
        preference: true,
        notes: true,
        timeline: true,
        followUps: {
          where: { status: 'pending' },
          orderBy: { dueDate: 'asc' },
        },
      },
      orderBy: { lastUpdated: 'desc' },
    });

    const pipeline: Record<string, any[]> = {};
    PIPELINE_STAGES.forEach((stage) => {
      pipeline[stage] = [];
    });

    customers.forEach((c) => {
      const serialized = serializeAdminView(c);
      const stage = PIPELINE_STAGES.includes(c.journeyStatus) ? c.journeyStatus : 'New Lead';
      
      pipeline[stage].push({
        ...serialized,
        pendingFollowUpCount: c.followUps.length,
        nextFollowUp: c.followUps[0] || null,
      });
    });

    return NextResponse.json({ success: true, stages: PIPELINE_STAGES, pipeline });
  } catch (error) {
    console.error('Pipeline GET error:', error);
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
    const { customerId, stage } = body;

    if (!customerId || !stage || !PIPELINE_STAGES.includes(stage)) {
      return NextResponse.json({ error: 'Invalid customer or pipeline stage' }, { status: 400 });
    }

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: {
        journeyStatus: stage,
        lastUpdated: new Date(),
      },
    });

    // Create Timeline Event
    await prisma.timelineEvent.create({
      data: {
        customerId,
        type: 'status_changed',
        title: `Pipeline Stage Updated`,
        description: `Stage updated to "${stage}" by Admin matchmaker.`,
      },
    });

    // Log Audit Event
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'PIPELINE_STAGE_UPDATED',
        entityType: 'Customer',
        entityId: customerId,
        metadata: JSON.stringify({ newStage: stage }),
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Pipeline PATCH error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
