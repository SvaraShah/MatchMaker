import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken, SESSION_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: { customer: { select: { id: true } } },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ success: false, error: 'Invalid email or password' }, { status: 401 });
    }

    const sessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      customerId: user.customer?.id || null,
    };

    const token = signToken(sessionPayload);

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        customerId: user.customer?.id || null,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('API Login error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
