import { NextResponse } from 'next/server';
import { getCustomerById } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = getCustomerById(id);

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    console.error('API Single Customer error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
