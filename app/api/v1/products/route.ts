import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth/better-auth';
import { ProductSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const businessId = searchParams.get('businessId') || undefined;
    const category = searchParams.get('category') || undefined;
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    const whereClause: any = { isAvailable: true };
    if (businessId) whereClause.businessId = businessId;
    if (category) whereClause.productCategory = category;

    const products = await db.businessProduct.findMany({
      where: whereClause,
      take: limit,
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        business: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            whatsapp: true,
            cityName: true,
            countryName: true,
            isVerified: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Fetch Products Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized access.' }, { status: 401 });
    }

    const body = await req.json();
    const validated = ProductSchema.parse(body);

    // Verify business ownership or admin
    const business = await db.business.findUnique({
      where: { id: validated.businessId },
    });

    if (!business) {
      return NextResponse.json({ success: false, error: 'Business not found.' }, { status: 404 });
    }

    if (business.ownerId !== user.id && user.role !== 'ADMINISTRATOR') {
      return NextResponse.json({ success: false, error: 'Permission denied.' }, { status: 403 });
    }

    // Create product
    const product = await db.businessProduct.create({
      data: {
        businessId: validated.businessId,
        title: validated.title,
        description: validated.description || null,
        price: validated.price,
        originalPrice: validated.originalPrice || null,
        currency: validated.currency || 'GHS',
        image: validated.image || (validated.images && validated.images.length > 0 ? validated.images[0] : null),
        quantity: validated.quantity !== undefined ? validated.quantity : null,
        location: validated.location || null,
        whatsappPhone: validated.whatsappPhone || business.whatsapp || business.phone,
        productCategory: validated.productCategory || 'Other categories',
        images: validated.images && validated.images.length > 0 ? {
          create: validated.images.map((url, idx) => ({
            url,
            sortOrder: idx,
          })),
        } : undefined,
      },
      include: {
        images: true,
      },
    });

    return NextResponse.json({ success: true, message: 'Product added successfully.', product }, { status: 201 });
  } catch (error) {
    console.error('Create Product Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create product' },
      { status: 400 }
    );
  }
}
