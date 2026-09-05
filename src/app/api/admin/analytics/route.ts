import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await requireAdmin();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // 1. Client Growth & Overview
    const allCustomers = await prisma.customer.findMany({
      include: { preference: true },
    });

    const totalClients = allCustomers.length;
    const matchSearchCount = allCustomers.filter(c => c.journeyStatus === 'Match Search').length;
    const successCount = allCustomers.filter(c => c.journeyStatus === 'Success').length;
    const activeCount = allCustomers.filter(c => c.journeyStatus !== 'Success' && c.journeyStatus !== 'Archived').length;
    const inactiveCount = totalClients - activeCount;

    // 2. Profile Completion
    let totalCompletenessSum = 0;
    let incompleteCount = 0;
    let completedCount = 0;

    allCustomers.forEach((c: any) => {
      let score = 0;
      if (c.firstName && c.lastName) score += 15;
      if (c.city) score += 10;
      if (c.age && c.height) score += 10;
      if (c.education) score += 15;
      if (c.profession) score += 15;
      if (c.lifestyle) score += 10;
      if (c.aboutMe) score += 10;
      if (c.photoUrl) score += 5;
      if (c.preference) score += 10;

      totalCompletenessSum += score;
      if (score >= 80) {
        completedCount++;
      } else {
        incompleteCount++;
      }
    });

    const averageCompletion = totalClients > 0 ? Math.round(totalCompletenessSum / totalClients) : 0;

    // 3. Engagement
    const totalShortlists = await prisma.shortlist.count();
    const totalInterests = await prisma.matchRequest.count();
    const pendingInterests = await prisma.matchRequest.count({ where: { status: 'pending' } });
    const acceptedInterests = await prisma.matchRequest.count({ where: { status: 'accepted' } });
    const totalConversations = await prisma.conversation.count();

    // 4. Follow-up Performance
    const totalFollowUps = await prisma.followUp.count();
    const completedFollowUps = await prisma.followUp.count({ where: { status: 'COMPLETED' } });
    const overdueFollowUps = await prisma.followUp.count({
      where: {
        status: 'PENDING',
        dueDate: { lt: startOfToday.toISOString() },
      },
    });
    const dueTodayFollowUps = await prisma.followUp.count({
      where: {
        status: 'PENDING',
        dueDate: { gte: startOfToday.toISOString() },
      },
    });

    // 5. Matches & Quality
    const matches = await prisma.match.findMany({
      select: { compatibilityScore: true, status: true },
    });

    const totalMatchesAnalyzed = matches.length;
    const avgScore = totalMatchesAnalyzed > 0
      ? Math.round(matches.reduce((acc, m) => acc + m.compatibilityScore, 0) / totalMatchesAnalyzed)
      : 0;

    const highQualityMatches = matches.filter(m => m.compatibilityScore >= 80).length;
    const moderateQualityMatches = matches.filter(m => m.compatibilityScore >= 60 && m.compatibilityScore < 80).length;
    const lowQualityMatches = matches.filter(m => m.compatibilityScore < 60).length;

    // Funnel Conversions
    const matchToInterestRate = totalMatchesAnalyzed > 0 ? Math.round((totalInterests / totalMatchesAnalyzed) * 100) : 0;
    const interestToConnectRate = totalInterests > 0 ? Math.round((acceptedInterests / totalInterests) * 100) : 0;
    const connectToMatchRate = acceptedInterests > 0 ? Math.round((successCount / acceptedInterests) * 100) : 0;

    const successRate = totalClients > 0 ? Math.round((successCount / totalClients) * 100) : 0;

    return NextResponse.json({
      success: true,
      data: {
        total: totalClients,
        active: activeCount,
        inactive: inactiveCount,
        matchSearch: matchSearchCount,
        successRate,

        profileCompletion: {
          average: averageCompletion,
          completed: completedCount,
          incomplete: incompleteCount,
        },

        engagement: {
          shortlists: totalShortlists,
          interests: totalInterests,
          pendingInterests,
          acceptedInterests,
          conversations: totalConversations,
        },

        followUps: {
          total: totalFollowUps,
          completed: completedFollowUps,
          overdue: overdueFollowUps,
          dueToday: dueTodayFollowUps,
        },

        matchQuality: {
          totalAnalyzed: totalMatchesAnalyzed,
          averageScore: avgScore,
          highQuality: highQualityMatches,
          moderateQuality: moderateQualityMatches,
          lowQuality: lowQualityMatches,
          conversions: {
            matchToInterest: matchToInterestRate,
            interestToConnect: interestToConnectRate,
            connectToMatch: connectToMatchRate,
          },
        },
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error('API Admin Analytics Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

