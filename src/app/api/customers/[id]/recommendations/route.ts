import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/auth';
import { getTopMatches } from '@/lib/matchingEngine';
import { generateAIMatchPitches } from '@/lib/ai/matchAnalysis';
import { serializeAdminView } from '@/lib/serializers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const clientCustomer = await prisma.customer.findUnique({
      where: { id },
      include: { preference: true },
    });

    if (!clientCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const allCustomers = await prisma.customer.findMany({
      include: { preference: true },
    });

    const clientAdminView = serializeAdminView(clientCustomer) as any;
    const allAdminViews = allCustomers.map((c: any) => serializeAdminView(c) as any);

    // Compute top matches
    const topScored = getTopMatches(clientAdminView, allAdminViews, 10);

    const matchRecords = await prisma.match.findMany({
      where: { customerId: id },
    });
    const matchMap = new Map(matchRecords.map((m: any) => [m.candidateId, m]));

    const recommendations = [];

    for (const item of topScored) {
      const prospect = item.profile;
      const existingMatch = matchMap.get(prospect.id) as any;

      let aiExplanation = existingMatch?.aiExplanation || '';
      let aiIntroduction = existingMatch?.aiIntroduction || '';

      if (!aiExplanation || !aiIntroduction) {
        const pitch = await generateAIMatchPitches(clientAdminView, prospect, item.score);
        aiExplanation = pitch.aiExplanation;
        aiIntroduction = pitch.aiIntroduction;

        // Cache into DB
        await prisma.match.upsert({
          where: {
            customerId_candidateId: {
              customerId: id,
              candidateId: prospect.id,
            },
          },
          update: {
            compatibilityScore: item.score,
            scoreBreakdown: JSON.stringify(item.scoreBreakdown),
            aiExplanation,
            aiIntroduction,
          },
          create: {
            customerId: id,
            candidateId: prospect.id,
            compatibilityScore: item.score,
            scoreBreakdown: JSON.stringify(item.scoreBreakdown),
            aiExplanation,
            aiIntroduction,
          },
        }).catch(() => {});
      }

      recommendations.push({
        ...item,
        aiExplanation,
        aiIntroduction,
        status: existingMatch?.status,
      });
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('API Recommendations error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
