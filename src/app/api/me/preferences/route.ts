import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseJsonField } from '@/lib/serializers';

export async function GET() {
  try {
    const session = await requireUser();

    const customer = await prisma.customer.findFirst({
      where: { userId: session.userId },
      include: { preference: true },
    });

    if (!customer || !customer.preference) {
      return NextResponse.json({ success: false, error: 'Preferences not found' }, { status: 404 });
    }

    const pref = customer.preference;
    return NextResponse.json({
      success: true,
      data: {
        id: pref.id,
        customerId: pref.customerId,
        ageMin: pref.ageMin,
        ageMax: pref.ageMax,
        locations: parseJsonField<string[]>(pref.locations, []),
        religions: parseJsonField<string[]>(pref.religions, []),
        castes: parseJsonField<string[]>(pref.castes, ['Any']),
        wantKids: pref.wantKids,
        openToRelocate: pref.openToRelocate,
        horoscopeRequired: pref.horoscopeRequired,
        manglikStatus: pref.manglikStatus,
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('API Get Preferences Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireUser();
    const body = await request.json();

    const customer = await prisma.customer.findFirst({
      where: { userId: session.userId },
    });

    if (!customer) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    const updatedPref = await prisma.customerPreference.upsert({
      where: { customerId: customer.id },
      update: {
        ageMin: body.ageMin !== undefined ? Number(body.ageMin) : undefined,
        ageMax: body.ageMax !== undefined ? Number(body.ageMax) : undefined,
        locations: body.locations ? JSON.stringify(body.locations) : undefined,
        religions: body.religions ? JSON.stringify(body.religions) : undefined,
        castes: body.castes ? JSON.stringify(body.castes) : undefined,
        wantKids: body.wantKids ?? undefined,
        openToRelocate: body.openToRelocate ?? undefined,
        horoscopeRequired: body.horoscopeRequired !== undefined ? Boolean(body.horoscopeRequired) : undefined,
        manglikStatus: body.manglikStatus ?? undefined,
      },
      create: {
        customerId: customer.id,
        ageMin: Number(body.ageMin || 21),
        ageMax: Number(body.ageMax || 40),
        locations: JSON.stringify(body.locations || [customer.city]),
        religions: JSON.stringify(body.religions || [customer.religion]),
        castes: JSON.stringify(body.castes || ['Any']),
        wantKids: body.wantKids || 'Open',
        openToRelocate: body.openToRelocate || 'Depends',
        horoscopeRequired: Boolean(body.horoscopeRequired),
        manglikStatus: body.manglikStatus || 'Any',
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedPref.id,
        customerId: updatedPref.customerId,
        ageMin: updatedPref.ageMin,
        ageMax: updatedPref.ageMax,
        locations: parseJsonField<string[]>(updatedPref.locations, []),
        religions: parseJsonField<string[]>(updatedPref.religions, []),
        castes: parseJsonField<string[]>(updatedPref.castes, ['Any']),
        wantKids: updatedPref.wantKids,
        openToRelocate: updatedPref.openToRelocate,
        horoscopeRequired: updatedPref.horoscopeRequired,
        manglikStatus: updatedPref.manglikStatus,
      },
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('API Update Preferences Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
