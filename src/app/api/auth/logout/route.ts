import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
    
    // Clear cookie by setting maxAge to 0
    response.cookies.set({
      name: 'matchmaker_session',
      value: '',
      httpOnly: true,
      path: '/',
      maxAge: 0
    });

    return response;
  } catch (error) {
    console.error('API Logout error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
