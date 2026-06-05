import { NextResponse } from 'next/server';
import { getCustomerById, saveCustomer, saveMatchState } from '@/lib/db';
import { TimelineEvent, Note } from '@/types/matchmaker';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, matchId, status, aiExplanation, aiIntroduction } = body;

    if (!customerId || !matchId || !status) {
      return NextResponse.json({ error: 'customerId, matchId, and status are required' }, { status: 400 });
    }

    if (!['saved', 'rejected', 'sent'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Save match state (this persists the decision and caches the AI text)
    const success = saveMatchState({
      customerId,
      matchId,
      status,
      aiExplanation,
      aiIntroduction
    });

    if (!success) {
      return NextResponse.json({ error: 'Failed to record match action' }, { status: 500 });
    }

    // Special behavior if sending a match: record to customer timeline and change journey status
    if (status === 'sent') {
      const customer = getCustomerById(customerId);
      const prospect = getCustomerById(matchId);
      
      if (customer && prospect) {
        const now = new Date().toISOString();
        
        // Update customer's journey status to 'Match Sent' if they are in 'Match Search' or below
        const prevStatus = customer.journeyStatus;
        if (customer.journeyStatus === 'New Lead' || customer.journeyStatus === 'Profile Verified' || customer.journeyStatus === 'Match Search') {
          customer.journeyStatus = 'Match Sent';
        }

        // Add timeline event
        customer.timeline.push({
          id: `evt-${Date.now()}-matchsent-${matchId}`,
          type: 'match_sent',
          title: `Match Proposal Sent: ${prospect.firstName} ${prospect.lastName}`,
          description: `AI-curated proposal (Score: ${body.score || 'N/A'}%) shared with client via email.`,
          createdAt: now
        });

        // Add automated note
        customer.notes.unshift({
          id: `note-${Date.now()}-matchsent-${matchId}`,
          author: 'System (AI Matchmaker)',
          content: `Sent match proposal of ${prospect.firstName} ${prospect.lastName} (${prospect.profession.designation}, ${prospect.city}). Score: ${body.score || 'N/A'}%. Reason: ${aiExplanation || 'Shared via email'}`,
          createdAt: now
        });

        customer.lastUpdated = now;
        saveCustomer(customer);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Match Action error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
