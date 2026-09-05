import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializePublicUserView } from '@/lib/serializers';

export async function GET() {
  try {
    const session = await requireUser();

    const shortlists = await prisma.shortlist.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' },
    });

    const candidateIds = shortlists.map((s: any) => s.candidateId);
    const candidates = await prisma.customer.findMany({
      where: { id: { in: candidateIds } },
      include: { preference: true },
    });

    const candidateMap = new Map(candidates.map((c: any) => [c.id, serializePublicUserView(c, c.preference)]));

    const result = shortlists
      .map((s: any) => candidateMap.get(s.candidateId))
      .filter(Boolean);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('API Get Shortlist Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireUser();
    const body = await request.json();
    const { candidateId } = body;

    if (!candidateId) {
      return NextResponse.json({ success: false, error: 'candidateId is required' }, { status: 400 });
    }

    const candidate = await prisma.customer.findUnique({
      where: { id: candidateId },
    });

    if (!candidate) {
      return NextResponse.json({ success: false, error: 'Candidate profile not found' }, { status: 404 });
    }

    const shortlist = await prisma.shortlist.upsert({
      where: {
        userId_candidateId: {
          userId: session.userId,
          candidateId,
        },
      },
      update: {},
      create: {
        userId: session.userId,
        candidateId,
      },
    });

    return NextResponse.json({
      success: true,
      data: shortlist,
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('API Add Shortlist Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
