import { NextRequest, NextResponse } from 'next/server';
import { BusinessRepository } from '@/lib/repositories/business.repository';
import { BusinessListingSchema } from '@/lib/validations';
import { getSessionUser } from '@/lib/auth/better-auth';
import { BusinessStatus, Role } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const mine = searchParams.get('mine') === 'true';
    const query = searchParams.get('q') || undefined;
    const categorySlug = searchParams.get('category') || undefined;
    const countryName = searchParams.get('country') || undefined;
    const cityName = searchParams.get('city') || undefined;
    const minRating = parseFloat(searchParams.get('rating') || '0');
    const featuredOnly = searchParams.get('featured') === 'true';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '12', 10) || 12));

    if (mine) {
      const user = await getSessionUser();
      if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized access. Please login first.' }, { status: 401 });
      }

      const { default: db } = await import('@/lib/db');
      const listings = await db.business.findMany({
        where: { ownerId: user.id, deletedAt: null },
        select: { id: true, name: true, slug: true, cityName: true, phone: true, whatsapp: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });

      return NextResponse.json({
        success: true,
        listings,
        pagination: { page: 1, limit, total: listings.length, totalPages: 1 },
      });
    }

    const result = await BusinessRepository.findMany({
      query,
      categorySlug,
      countryName,
      cityName,
      minRating,
      featuredOnly,
      page,
      limit,
    });

    return NextResponse.json({
      success: true,
      listings: result.listings,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get Businesses Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch business directory listings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized access. Please login first.' }, { status: 401 });
    }

    const body = await req.json();
    const validated = BusinessListingSchema.parse(body);

    const business = await BusinessRepository.create({
      ownerId: user.id,
      name: validated.name,
      tagline: validated.tagline,
      description: validated.description || '',
      categoryId: validated.categoryId,
      subcategoryId: validated.subcategoryId || null,
      phone: validated.phone || '',
      whatsapp: validated.whatsapp || null,
      email: validated.email || '',
      website: validated.website || null,
      address: validated.address,
      cityName: validated.cityName,
      stateName: validated.stateName || null,
      countryName: validated.countryName || 'Ghana',
      zipCode: validated.zipCode || null,
      latitude: validated.latitude || null,
      longitude: validated.longitude || null,
      logo: validated.logo || null,
      coverImage: validated.coverImage || null,
      status: BusinessStatus.APPROVED,
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Business listing published successfully on the marketplace.',
        business,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create Business Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create business listing' },
      { status: 400 }
    );
  }
}
