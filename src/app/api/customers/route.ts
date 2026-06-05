import { NextResponse } from 'next/server';
import { getCustomers } from '@/lib/db';
import { JourneyStatus } from '@/types/matchmaker';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const status = searchParams.get('status') as JourneyStatus | 'All' | null;
    const gender = searchParams.get('gender') || 'All';
    const sortBy = searchParams.get('sort') || 'lastUpdated'; // name, age, lastUpdated, completeness

    let list = getCustomers();

    // 1. Apply Search (First name / Last name / City / Profession)
    if (search) {
      list = list.filter(
        c =>
          c.firstName.toLowerCase().includes(search) ||
          c.lastName.toLowerCase().includes(search) ||
          c.city.toLowerCase().includes(search) ||
          c.profession.designation.toLowerCase().includes(search)
      );
    }

    // 2. Apply Journey Status Filter
    if (status && status !== 'All') {
      list = list.filter(c => c.journeyStatus === status);
    }

    // 3. Apply Gender Filter
    if (gender && gender !== 'All') {
      list = list.filter(c => c.gender.toLowerCase() === gender.toLowerCase());
    }

    // Helper to calculate profile completeness
    const getCompleteness = (c: any) => {
      let fields = [
        c.firstName, c.lastName, c.gender, c.dob, c.email, c.phone,
        c.city, c.religion, c.caste, c.motherTongue,
        c.education?.undergradCollege, c.education?.degree,
        c.profession?.company, c.profession?.designation, c.profession?.income, c.profession?.industry,
        c.family?.familyType, c.family?.parentsOccupation,
        c.lifestyle?.smoking, c.lifestyle?.drinking, c.lifestyle?.diet,
        c.preferences?.ageMin, c.preferences?.ageMax, c.preferences?.locations, c.preferences?.religions
      ];
      const filled = fields.filter(f => f !== undefined && f !== null && f !== '' && (Array.isArray(f) ? f.length > 0 : true));
      return Math.round((filled.length / fields.length) * 100);
    };

    // 4. Apply Sorting
    list = list.sort((a, b) => {
      if (sortBy === 'name') {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      } else if (sortBy === 'age') {
        return a.age - b.age;
      } else if (sortBy === 'completeness') {
        return getCompleteness(b) - getCompleteness(a);
      } else {
        // Default: lastUpdated (newest first)
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
    });

    return NextResponse.json(list);
  } catch (error) {
    console.error('API Customers error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
