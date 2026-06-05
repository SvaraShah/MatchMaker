import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate demo credentials
    if (email === 'matchmaker@tdc.com' && password === 'password123') {
      const response = NextResponse.json({ success: true, message: 'Logged in successfully' });
      
      // Set HTTP-only session cookie
      response.cookies.set({
        name: 'matchmaker_session',
        value: 'matchmaker_crm_session_active_key',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 1 day
        path: '/'
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  } catch (error) {
    console.error('API Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
