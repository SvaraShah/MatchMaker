import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTopMatches } from '@/lib/matchingEngine';
import { generateAIMatchPitches } from '@/lib/ai/matchAnalysis';
import { serializePublicUserView } from '@/lib/serializers';

export async function GET() {
  try {
    const session = await requireUser();

    const currentCustomer = await prisma.customer.findFirst({
      where: { userId: session.userId },
      include: { preference: true },
    });

    if (!currentCustomer) {
      return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
    }

    const targetGender = currentCustomer.gender === 'Female' ? 'Male' : 'Female';

    const candidates = await prisma.customer.findMany({
      where: {
        gender: targetGender,
        id: { not: currentCustomer.id },
      },
      include: { preference: true },
    });

    const formattedClient = serializePublicUserView(currentCustomer, currentCustomer.preference) as any;
    const formattedCandidates = candidates.map((c: any) => serializePublicUserView(c, c.preference) as any);

    const scoredMatches = getTopMatches(formattedClient, formattedCandidates, 15);

    const userShortlists = await prisma.shortlist.findMany({
      where: { userId: session.userId },
      select: { candidateId: true },
    });
    const shortlistedSet = new Set(userShortlists.map((s: any) => s.candidateId));

    const userRequests = await prisma.matchRequest.findMany({
      where: { senderId: session.userId },
      select: { receiverId: true, status: true },
    });
    const requestMap = new Map(userRequests.map((r: any) => [r.receiverId, r.status]));

    const results = [];
    for (const match of scoredMatches) {
      const prospectProfile = match.profile;
      
      const dbCandidate = candidates.find((c: any) => c.id === prospectProfile.id);
      const candidateUserId = dbCandidate?.userId || prospectProfile.id;

      const cachedMatch = await prisma.match.findFirst({
        where: {
          customerId: currentCustomer.id,
          candidateId: prospectProfile.id,
        },
      });

      let aiExplanation = cachedMatch?.aiExplanation;
      let aiIntroduction = cachedMatch?.aiIntroduction;

      if (!aiExplanation || !aiIntroduction) {
        const pitch = await generateAIMatchPitches(formattedClient, prospectProfile, match.score);
        aiExplanation = pitch.aiExplanation;
        aiIntroduction = pitch.aiIntroduction;

        await prisma.match.upsert({
          where: {
            customerId_candidateId: {
              customerId: currentCustomer.id,
              candidateId: prospectProfile.id,
            },
          },
          update: {
            compatibilityScore: match.score,
            scoreBreakdown: JSON.stringify(match.scoreBreakdown),
            aiExplanation,
            aiIntroduction,
          },
          create: {
            customerId: currentCustomer.id,
            candidateId: prospectProfile.id,
            compatibilityScore: match.score,
            scoreBreakdown: JSON.stringify(match.scoreBreakdown),
            aiExplanation,
            aiIntroduction,
          },
        }).catch(() => {});
      }

      results.push({
        profile: prospectProfile,
        score: match.score,
        scoreBreakdown: match.scoreBreakdown,
        aiExplanation,
        aiIntroduction,
        isShortlisted: shortlistedSet.has(prospectProfile.id),
        requestStatus: requestMap.get(candidateUserId) || null,
      });
    }

    return NextResponse.json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('API Get User Matches Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
