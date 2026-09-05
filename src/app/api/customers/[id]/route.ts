import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeAdminView } from '@/lib/serializers';
import { getSessionUser } from '@/lib/auth';

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
    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        preference: true,
        notes: { orderBy: { createdAt: 'desc' } },
        timeline: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(serializeAdminView(customer));
  } catch (error) {
    console.error('API Single Customer error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
