import { NextRequest, NextResponse } from 'next/server';
import { SearchService } from '@/lib/services/search.service';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || searchParams.get('query') || '';
    const category = searchParams.get('category') || '';
    const country = searchParams.get('country') || '';
    const city = searchParams.get('city') || '';
    const rating = parseFloat(searchParams.get('rating') || '0');
    const featured = searchParams.get('featured') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12', 10) || 12));

    const result = await SearchService.searchBusinesses({
      query,
      category,
      country,
      city,
      rating,
      featured,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      query,
      results: result.results,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Search Engine API Error:', error);
    return NextResponse.json({ success: false, error: 'Search execution failed.' }, { status: 500 });
  }
}
