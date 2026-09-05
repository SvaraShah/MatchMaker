import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim().toLowerCase();

    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, results: [] });
    }

    // Search Customers
    const customers = await prisma.customer.findMany({
      where: {
        OR: [
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
          { city: { contains: q, mode: 'insensitive' } },
          { designation: { contains: q, mode: 'insensitive' } },
          { company: { contains: q, mode: 'insensitive' } },
        ],
      },
      take: 5,
    });

    // Search Follow-ups
    const followUps = await prisma.followUp.findMany({
      where: {
        title: { contains: q, mode: 'insensitive' },
      },
      include: { customer: { select: { firstName: true, lastName: true } } },
      take: 5,
    });

    // Search Notes
    const notes = await prisma.note.findMany({
      where: {
        content: { contains: q, mode: 'insensitive' },
      },
      include: { customer: { select: { id: true, firstName: true, lastName: true } } },
      take: 5,
    });

    const results = [
      ...customers.map((c) => ({
        type: 'CLIENT',
        title: `${c.firstName} ${c.lastName}`,
        subtitle: `${c.gender}, ${c.age} yrs • ${c.city} (${c.designation})`,
        link: `/admin/clients/${c.id}`,
      })),
      ...followUps.map((f) => ({
        type: 'FOLLOW-UP',
        title: f.title,
        subtitle: `Client: ${f.customer.firstName} ${f.customer.lastName} • Due: ${f.dueDate}`,
        link: `/admin/follow-ups`,
      })),
      ...notes.map((n) => ({
        type: 'NOTE',
        title: `Note for ${n.customer.firstName} ${n.customer.lastName}`,
        subtitle: n.content.substring(0, 60) + '...',
        link: `/admin/clients/${n.customer.id}`,
      })),
    ];

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
