import { NextResponse } from 'next/server';
import { requireUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { serializePublicUserView } from '@/lib/serializers';

export async function GET() {
  try {
    const session = await requireUser();
    
    const customer = await prisma.customer.findFirst({
      where: { userId: session.userId },
      include: { preference: true },
    });

    if (!customer) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: serializePublicUserView(customer, customer.preference),
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('API Get Profile Error:', error);
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

    // Allow user to update non-sensitive personal fields
    const updated = await prisma.customer.update({
      where: { id: customer.id },
      data: {
        city: body.city ?? customer.city,
        height: body.height ? Number(body.height) : customer.height,
        motherTongue: body.motherTongue ?? customer.motherTongue,
        languagesKnown: body.languagesKnown ? JSON.stringify(body.languagesKnown) : customer.languagesKnown,
        photoUrl: body.photoUrl !== undefined ? body.photoUrl : customer.photoUrl,
        aboutMe: body.aboutMe !== undefined ? body.aboutMe : customer.aboutMe,
        undergradCollege: body.undergradCollege ?? customer.undergradCollege,
        degree: body.degree ?? customer.degree,
        postgradDegree: body.postgradDegree ?? customer.postgradDegree,
        company: body.company ?? customer.company,
        designation: body.designation ?? customer.designation,
        income: body.income ? Number(body.income) : customer.income,
        industry: body.industry ?? customer.industry,
        smoking: body.smoking ?? customer.smoking,
        drinking: body.drinking ?? customer.drinking,
        diet: body.diet ?? customer.diet,
        openToPets: body.openToPets !== undefined ? Boolean(body.openToPets) : customer.openToPets,
        lastUpdated: new Date(),
      },
      include: { preference: true },
    });

    return NextResponse.json({
      success: true,
      data: serializePublicUserView(updated, updated.preference),
    });
  } catch (error: any) {
    if (error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }
    console.error('API Update Profile Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
