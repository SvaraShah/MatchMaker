import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const total = await prisma.auditLog.count();
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED_ADMIN') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }
    console.error('API Audit Logs Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
