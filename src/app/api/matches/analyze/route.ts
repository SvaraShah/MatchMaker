import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';
import { calculateCompatibility } from '@/lib/matchingEngine';
import { generateAIMatchPitches } from '@/lib/ai/matchAnalysis';
import { serializeAdminView } from '@/lib/serializers';

export async function POST(request: Request) {
  try {
    const session = await requireAdmin();
    const body = await request.json();
    const { customerId, candidateId } = body;

    if (!customerId || !candidateId) {
      return NextResponse.json({ success: false, error: 'customerId and candidateId are required' }, { status: 400 });
    }

    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
      include: { preference: true },
    });

    const candidate = await prisma.customer.findUnique({
      where: { id: candidateId },
      include: { preference: true },
    });

    if (!customer || !candidate) {
      return NextResponse.json({ success: false, error: 'Customer or candidate not found' }, { status: 404 });
    }

    const formattedCustomer = serializeAdminView(customer) as any;
    const formattedCandidate = serializeAdminView(candidate) as any;

    // 1. Run deterministic matching engine
    const matchScore = calculateCompatibility(formattedCustomer, formattedCandidate);

    // 2. Call server-side OpenAI SDK (or fallback)
    const pitch = await generateAIMatchPitches(formattedCustomer, formattedCandidate, matchScore.score);

    // 3. Save match analysis to database
    const savedMatch = await prisma.match.upsert({
      where: {
        customerId_candidateId: {
          customerId,
          candidateId,
        },
      },
      update: {
        compatibilityScore: matchScore.score,
        scoreBreakdown: JSON.stringify(matchScore.scoreBreakdown),
        aiExplanation: pitch.aiExplanation,
        aiIntroduction: pitch.aiIntroduction,
        updatedAt: new Date(),
      },
      create: {
        customerId,
        candidateId,
        compatibilityScore: matchScore.score,
        scoreBreakdown: JSON.stringify(matchScore.scoreBreakdown),
        aiExplanation: pitch.aiExplanation,
        aiIntroduction: pitch.aiIntroduction,
      },
    });

    // 4. Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId: session.userId,
        action: 'AI_MATCH_ANALYZED',
        entityType: 'Match',
        entityId: savedMatch.id,
        metadata: JSON.stringify({ customerId, candidateId, score: matchScore.score }),
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        score: matchScore.score,
        scoreBreakdown: matchScore.scoreBreakdown,
        aiExplanation: pitch.aiExplanation,
        aiIntroduction: pitch.aiIntroduction,
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error('API Analyze Match Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
