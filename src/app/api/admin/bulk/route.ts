import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customerIds, action, payload } = body;

    if (!Array.isArray(customerIds) || customerIds.length === 0 || !action) {
      return NextResponse.json({ error: 'Invalid customer IDs or action' }, { status: 400 });
    }

    let affectedCount = 0;

    if (action === 'update_stage') {
      const { stage } = payload || {};
      if (!stage) return NextResponse.json({ error: 'Stage required' }, { status: 400 });

      const res = await prisma.customer.updateMany({
        where: { id: { in: customerIds } },
        data: { journeyStatus: stage, lastUpdated: new Date() },
      });
      affectedCount = res.count;
    } else if (action === 'add_note') {
      const { content } = payload || {};
      if (!content) return NextResponse.json({ error: 'Note content required' }, { status: 400 });

      const notesData = customerIds.map((cid: string) => ({
        customerId: cid,
        author: session.name || 'Admin Matchmaker',
        content: content.trim(),
      }));

      await prisma.note.createMany({ data: notesData });
      affectedCount = customerIds.length;
    } else if (action === 'create_followup') {
      const { title, dueDate, priority } = payload || {};
      if (!title || !dueDate) return NextResponse.json({ error: 'Title and due date required' }, { status: 400 });

      const followUpData = customerIds.map((cid: string) => ({
        customerId: cid,
        title: title.trim(),
        dueDate: dueDate.trim(),
        priority: priority || 'medium',
        status: 'pending',
      }));

      await prisma.followUp.createMany({ data: followUpData });
      affectedCount = customerIds.length;
    } else {
      return NextResponse.json({ error: 'Unsupported bulk action' }, { status: 400 });
    }

    // Record Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: `BULK_${action.toUpperCase()}`,
        entityType: 'Customer',
        metadata: JSON.stringify({ customerIds, action, payload, affectedCount }),
      },
    });

    return NextResponse.json({ success: true, affectedCount });
  } catch (error) {
    console.error('Bulk API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
