import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'all'; // countries, regions, cities, or all

    if (type === 'countries') {
      const countries = await db.country.findMany({
        include: { _count: { select: { businesses: true, cities: true } } },
        orderBy: { sortOrder: 'asc' },
      });
      return NextResponse.json({ success: true, countries });
    }

    if (type === 'cities') {
      const cities = await db.city.findMany({
        include: { country: true, region: true, _count: { select: { businesses: true } } },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json({ success: true, cities });
    }

    const locations = await db.country.findMany({
      include: {
        regions: {
          include: {
            cities: {
              include: { _count: { select: { businesses: true } } },
            },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({ success: true, locations });
  } catch (error) {
    console.error('Get Locations Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch location hierarchy' }, { status: 500 });
  }
}
