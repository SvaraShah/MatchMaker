import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Quick lightweight database query to verify connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'TDC MatchMaker Engine',
      database: 'connected',
    });
  } catch (error) {
    console.error('Health check database query failed:', error);
    return NextResponse.json(
      { status: 'error', timestamp: new Date().toISOString(), service: 'TDC MatchMaker Engine', database: 'disconnected' },
      { status: 500 }
    );
  }
}
