import { NextResponse } from 'next/server';
import { getCustomerById, saveCustomer } from '@/lib/db';
import { Note, TimelineEvent, JourneyStatus } from '@/types/matchmaker';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { author, content, status } = body;

    if (!content || !author) {
      return NextResponse.json({ error: 'Author and Content are required' }, { status: 400 });
    }

    const customer = getCustomerById(id);
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const noteId = `note-${Date.now()}`;
    const newNote: Note = {
      id: noteId,
      author,
      content,
      createdAt: now
    };

    // Update notes
    customer.notes = [newNote, ...customer.notes];

    // Determine type of event based on keywords in content
    let eventType: TimelineEvent['type'] = 'note_added';
    let eventTitle = 'Note Added';
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('call') || lowerContent.includes('phone') || lowerContent.includes('talked')) {
      eventType = 'call_completed';
      eventTitle = 'Call Completed';
    } else if (lowerContent.includes('meeting') || lowerContent.includes('zoom') || lowerContent.includes('in-person')) {
      eventType = 'meeting_scheduled';
      eventTitle = 'Meeting Outcome Recorded';
    }

    // Append note timeline event
    customer.timeline.push({
      id: `evt-${Date.now()}-note`,
      type: eventType,
      title: eventTitle,
      description: `Note by ${author}: "${content.substring(0, 60)}${content.length > 60 ? '...' : ''}"`,
      createdAt: now
    });

    // If journey status is being updated
    if (status && status !== customer.journeyStatus) {
      const oldStatus = customer.journeyStatus;
      customer.journeyStatus = status as JourneyStatus;
      
      // Map journey status to event type
      let statusEvtType: TimelineEvent['type'] = 'status_changed';
      if (status === 'Profile Verified') statusEvtType = 'profile_verified';
      else if (status === 'Match Search') statusEvtType = 'match_search';
      else if (status === 'Match Sent') statusEvtType = 'match_sent';
      else if (status === 'Meeting Scheduled') statusEvtType = 'meeting_scheduled';
      else if (status === 'Active Discussion') statusEvtType = 'active_discussion';
      else if (status === 'Success') statusEvtType = 'success';

      customer.timeline.push({
        id: `evt-${Date.now()}-status`,
        type: statusEvtType,
        title: `Status Changed: ${status}`,
        description: `Journey status updated from "${oldStatus}" to "${status}".`,
        createdAt: now
      });
    }

    // Sort timeline so newest is first or chronologically ordered
    // We sort chronologically so that progress reads left-to-right/top-to-bottom, or reverse.
    // Let's sort chronologically by default
    customer.timeline.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    customer.lastUpdated = now;

    const success = saveCustomer(customer);
    if (!success) {
      return NextResponse.json({ error: 'Failed to save notes' }, { status: 500 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('API Add Note error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
