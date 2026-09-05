import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth/better-auth';
import { ProductSchema } from '@/lib/validations';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const product = await db.businessProduct.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
    }

    if (product.ownerId !== user.id && product.business?.ownerId !== user.id && user.role !== 'ADMINISTRATOR') {
      return NextResponse.json({ success: false, error: 'Permission denied.' }, { status: 403 });
    }

    await db.businessProduct.delete({ where: { id } });

    return NextResponse.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Delete Product Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete product.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const product = await db.businessProduct.findUnique({
      where: { id },
      include: { business: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });
    }

    if (product.ownerId !== user.id && product.business?.ownerId !== user.id && user.role !== 'ADMINISTRATOR') {
      return NextResponse.json({ success: false, error: 'Permission denied.' }, { status: 403 });
    }

    const validated = ProductSchema.partial().omit({ businessId: true }).parse(body);
    const updateData: any = Object.fromEntries(
      Object.entries(validated).filter(([key, value]) => value !== undefined && key !== 'images')
    );

    if (Array.isArray(validated.images)) {
      // Recreate product images relation
      await db.businessProductImage.deleteMany({ where: { productId: id } });
      if (validated.images.length > 0) {
        updateData.image = validated.images[0];
        updateData.images = {
          create: validated.images.map((url, idx) => ({
            url,
            sortOrder: idx,
          })),
        };
      } else {
        updateData.image = null;
      }
    }

    const updated = await db.businessProduct.update({
      where: { id },
      data: updateData,
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
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Update Product Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update product.' }, { status: 500 });
  }
}
