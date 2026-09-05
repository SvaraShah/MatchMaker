import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { serializeAdminView } from '@/lib/serializers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { author, content, status } = body;

    if (!content || !author) {
      return NextResponse.json({ error: 'Author and Content are required' }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const now = new Date();

    // 1. Add Note
    await prisma.note.create({
      data: {
        customerId: id,
        author,
        content,
        createdAt: now,
      },
    });

    // 2. Determine Timeline Event Type
    let eventType = 'note_added';
    let eventTitle = 'Note Added';
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('call') || lowerContent.includes('phone') || lowerContent.includes('talked')) {
      eventType = 'call_completed';
      eventTitle = 'Call Completed';
    } else if (lowerContent.includes('meeting') || lowerContent.includes('zoom') || lowerContent.includes('in-person')) {
      eventType = 'meeting_scheduled';
      eventTitle = 'Meeting Outcome Recorded';
    }

    await prisma.timelineEvent.create({
      data: {
        customerId: id,
        type: eventType,
        title: eventTitle,
        description: `Note by ${author}: "${content.substring(0, 60)}${content.length > 60 ? '...' : ''}"`,
        createdAt: now,
      },
    });

    // 3. Update Journey Status if changed
    if (status && status !== customer.journeyStatus) {
      let statusEvtType = 'status_changed';
      if (status === 'Profile Verified') statusEvtType = 'profile_verified';
      else if (status === 'Match Search') statusEvtType = 'match_search';
      else if (status === 'Match Sent') statusEvtType = 'match_sent';
      else if (status === 'Meeting Scheduled') statusEvtType = 'meeting_scheduled';
      else if (status === 'Active Discussion') statusEvtType = 'active_discussion';
      else if (status === 'Success') statusEvtType = 'success';

      await prisma.timelineEvent.create({
        data: {
          customerId: id,
          type: statusEvtType,
          title: `Status Changed: ${status}`,
          description: `Journey status updated from "${customer.journeyStatus}" to "${status}".`,
          createdAt: now,
        },
      });

      await prisma.customer.update({
        where: { id },
        data: {
          journeyStatus: status,
          lastUpdated: now,
        },
      });
    } else {
      await prisma.customer.update({
        where: { id },
        data: { lastUpdated: now },
      });
    }

    const updatedCustomer = await prisma.customer.findUnique({
      where: { id },
      include: {
        preference: true,
        notes: { orderBy: { createdAt: 'desc' } },
        timeline: { orderBy: { createdAt: 'desc' } },
      },
    });

    return NextResponse.json(serializeAdminView(updatedCustomer));
  } catch (error) {
    console.error('API Add Note error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
