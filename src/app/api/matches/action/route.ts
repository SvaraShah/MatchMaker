import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { customerId, matchId, status, aiExplanation, aiIntroduction } = body;

    if (!customerId || !matchId || !status) {
      return NextResponse.json({ error: 'customerId, matchId, and status are required' }, { status: 400 });
    }

    if (!['saved', 'rejected', 'sent', 'viewed', 'accepted', 'declined'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Save or update match state
    const matchRecord = await prisma.match.upsert({
      where: {
        customerId_candidateId: {
          customerId,
          candidateId: matchId,
        },
      },
      update: {
        status,
        aiExplanation: aiExplanation || undefined,
        aiIntroduction: aiIntroduction || undefined,
        updatedAt: new Date(),
      },
      create: {
        customerId,
        candidateId: matchId,
        compatibilityScore: body.score || 80,
        scoreBreakdown: JSON.stringify(body.scoreBreakdown || {}),
        aiExplanation: aiExplanation || null,
        aiIntroduction: aiIntroduction || null,
        status,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: `MATCH_${status.toUpperCase()}`,
        entityType: 'Match',
        entityId: matchRecord.id,
        metadata: JSON.stringify({ customerId, candidateId: matchId }),
      },
    });

    // Special behavior if sending match: update timeline and customer status
    if (status === 'sent') {
      const customer = await prisma.customer.findUnique({ where: { id: customerId } });
      const prospect = await prisma.customer.findUnique({ where: { id: matchId } });

      if (customer && prospect) {
        const now = new Date();
        const prevStatus = customer.journeyStatus;

        let newJourneyStatus = customer.journeyStatus;
        if (['New Lead', 'Profile Verified', 'Match Search'].includes(prevStatus)) {
          newJourneyStatus = 'Match Sent';
        }

        await prisma.timelineEvent.create({
          data: {
            customerId,
            type: 'match_sent',
            title: `Match Proposal Sent: ${prospect.firstName} ${prospect.lastName}`,
            description: `AI-curated proposal (Score: ${body.score || 'N/A'}%) shared with client.`,
            createdAt: now,
          },
        });

        await prisma.note.create({
          data: {
            customerId,
            author: 'System (AI Matchmaker)',
            content: `Sent match proposal of ${prospect.firstName} ${prospect.lastName} (${prospect.designation}, ${prospect.city}). Score: ${body.score || 'N/A'}%. Reason: ${aiExplanation || 'Shared via email'}`,
            createdAt: now,
          },
        });

        await prisma.customer.update({
          where: { id: customerId },
          data: {
            journeyStatus: newJourneyStatus,
            lastUpdated: now,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Match Action error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
