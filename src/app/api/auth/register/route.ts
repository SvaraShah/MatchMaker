import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken, SESSION_COOKIE_NAME } from '@/lib/auth';
import { Role } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, gender, dob, city } = body;

    // 1. Required fields validation
    if (!name || !name.trim() || !email || !email.trim() || !password || !gender || !dob || !city || !city.trim()) {
      return NextResponse.json(
        { success: false, error: 'All fields are required.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // 2. Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // 3. Password minimum requirement
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    // 4. DOB & Age calculation
    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid date of birth.' },
        { status: 400 }
      );
    }

    const today = new Date();
    let age = today.getFullYear() - dobDate.getFullYear();
    const monthDiff = today.getMonth() - dobDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dobDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return NextResponse.json(
        { success: false, error: 'You must be at least 18 years old to register.' },
        { status: 400 }
      );
    }

    if (age > 100) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid date of birth.' },
        { status: 400 }
      );
    }

    // 5. Gender validation
    const normalizedGender = gender === 'Female' ? 'Female' : 'Male';

    // 6. Check existing user
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'An account with this email address already exists.' },
        { status: 400 }
      );
    }

    // 7. Hash password & split name
    const passwordHash = await hashPassword(password);
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0] || 'User';
    const lastName = nameParts.slice(1).join(' ') || 'Account';

    // 8. Create User + Customer + CustomerPreference in a transaction
    // MANDATORY SECURITY RULE: Role is ALWAYS forced to USER (never trust client)
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: cleanEmail,
          passwordHash,
          name: name.trim(),
          role: Role.USER,
        },
      });

      const customer = await tx.customer.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          gender: normalizedGender,
          dob: dobDate.toISOString(),
          age,
          country: 'India',
          city: city.trim(),
          height: normalizedGender === 'Female' ? 165 : 175,
          religion: 'Hindu',
          caste: 'Not Specified',
          motherTongue: 'Hindi',
          languagesKnown: JSON.stringify(['English', 'Hindi']),
          email: cleanEmail,
          phone: '+91 98765 43210',
          undergradCollege: 'State University',
          degree: "Bachelor's Degree",
          company: 'Corporate Professional',
          designation: 'Senior Specialist',
          income: 15,
          industry: 'Corporate Services',
          familyType: 'Nuclear',
          parentsOccupation: 'Employed / Retired',
          smoking: 'No',
          drinking: 'No',
          diet: 'Vegetarian',
          journeyStatus: 'Preferences Verified',
        },
      });

      await tx.customerPreference.create({
        data: {
          customerId: customer.id,
          ageMin: Math.max(18, age - 5),
          ageMax: age + 5,
          locations: JSON.stringify([city.trim(), 'Mumbai', 'Delhi', 'Bengaluru']),
          religions: JSON.stringify(['Hindu', 'Sikh', 'Jain', 'Christian', 'Muslim', 'Any']),
          castes: JSON.stringify(['Any']),
          wantKids: 'Open',
          openToRelocate: 'Depends',
          horoscopeRequired: false,
          manglikStatus: 'Any',
        },
      });

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        customerId: customer.id,
      };
    });

    // 9. Sign JWT Token & set HTTP-Only Session Cookie
    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      customerId: newUser.customerId,
    });

    const isHttps = request.headers.get('x-forwarded-proto') === 'https' || request.url.startsWith('https://');

    const cookieStore = await cookies();
    cookieStore.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    const response = NextResponse.json({
      success: true,
      user: newUser,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('API Register error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected server error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
