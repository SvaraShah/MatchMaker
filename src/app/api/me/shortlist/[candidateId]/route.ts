import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const session = await requireUser();
    const { candidateId } = await params;

    await prisma.shortlist.deleteMany({
      where: {
        userId: session.userId,
        candidateId,
      },
    });

    return NextResponse.json({ success: true, message: 'Removed from shortlist' });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('API Delete Shortlist Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
