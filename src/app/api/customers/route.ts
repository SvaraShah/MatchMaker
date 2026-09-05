import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serializeAdminView } from '@/lib/serializers';
import { getSessionUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase().trim() || '';
    const status = searchParams.get('status');
    const gender = searchParams.get('gender');
    const sortBy = searchParams.get('sort') || 'lastUpdated';

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { designation: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status && status !== 'All') {
      where.journeyStatus = status;
    }

    if (gender && gender !== 'All') {
      where.gender = { equals: gender, mode: 'insensitive' };
    }

    const total = await prisma.customer.count({ where });

    let orderBy: any = { lastUpdated: 'desc' };
    if (sortBy === 'name') {
      orderBy = { firstName: 'asc' };
    } else if (sortBy === 'age') {
      orderBy = { age: 'asc' };
    }

    const rawCustomers = await prisma.customer.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        preference: true,
        notes: { orderBy: { createdAt: 'desc' } },
        timeline: { orderBy: { createdAt: 'desc' } },
      },
    });

    const serialized = rawCustomers.map((c: any) => serializeAdminView(c));

    return NextResponse.json(serialized);
  } catch (error) {
    console.error('API Customers error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const customer = await prisma.customer.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        gender: body.gender,
        dob: body.dob || new Date().toISOString(),
        age: Number(body.age),
        country: body.country || 'India',
        city: body.city,
        height: Number(body.height || 170),
        religion: body.religion,
        caste: body.caste,
        motherTongue: body.motherTongue || 'Hindi',
        languagesKnown: JSON.stringify(body.languagesKnown || ['English', 'Hindi']),
        email: body.email,
        phone: body.phone,
        undergradCollege: body.undergradCollege || 'University of Delhi',
        degree: body.degree || 'B.Tech',
        postgradDegree: body.postgradDegree || null,
        company: body.company || 'Corporate',
        designation: body.designation || 'Consultant',
        income: Number(body.income || 20),
        industry: body.industry || 'Technology',
        siblings: Number(body.siblings || 0),
        familyType: body.familyType || 'Nuclear',
        parentsOccupation: body.parentsOccupation || 'Service',
        smoking: body.smoking || 'No',
        drinking: body.drinking || 'No',
        diet: body.diet || 'Vegetarian',
        openToPets: Boolean(body.openToPets),
        journeyStatus: body.journeyStatus || 'New Lead',
        preference: {
          create: {
            ageMin: Number(body.ageMin || 21),
            ageMax: Number(body.ageMax || 40),
            locations: JSON.stringify(body.locations || [body.city]),
            religions: JSON.stringify(body.religions || [body.religion]),
            castes: JSON.stringify(body.castes || ['Any']),
            wantKids: body.wantKids || 'Open',
            openToRelocate: body.openToRelocate || 'Depends',
            horoscopeRequired: Boolean(body.horoscopeRequired),
            manglikStatus: body.manglikStatus || 'Any',
          },
        },
      },
      include: { preference: true, notes: true, timeline: true },
    });

    return NextResponse.json({ success: true, data: serializeAdminView(customer) });
  } catch (error) {
    console.error('API Create Customer Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
