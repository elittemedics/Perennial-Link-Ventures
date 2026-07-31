import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { BusinessRepository } from '@/lib/repositories/business.repository';
import { BusinessListingSchema } from '@/lib/validations';
import { getSessionUser } from '@/lib/auth/better-auth';
import { Role } from '@prisma/client';
import { BusinessStatus } from '@prisma/client';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let business: any = await BusinessRepository.findBySlug(id);
    if (!business) {
      business = await db.business.findUnique({
        where: { id },
        include: {
          category: true,
          subcategory: true,
          owner: { select: { id: true, name: true } },
          gallery: true,
          services: true,
          products: true,
          openingHours: true,
          reviews: { where: { isApproved: true } },
        },
      });
    }

    if (!business || business.deletedAt !== null || business.status !== BusinessStatus.APPROVED) {
      return NextResponse.json({ success: false, error: 'Business listing not found.' }, { status: 404 });
    }

    // Record view asynchronously
    const ip = req.headers.get('x-forwarded-for') || undefined;
    const ua = req.headers.get('user-agent') || undefined;
    BusinessRepository.incrementView(business.id, ip, ua).catch(() => null);

    return NextResponse.json({ success: true, business });
  } catch (error) {
    console.error('Get Business Detail Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to retrieve business details' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.business.findUnique({ where: { id } });

    if (!existing || existing.deletedAt !== null) {
      return NextResponse.json({ success: false, error: 'Business not found.' }, { status: 404 });
    }

    if (existing.ownerId !== user.id && user.role !== Role.ADMINISTRATOR && user.role !== Role.MODERATOR) {
      return NextResponse.json({ success: false, error: 'Forbidden. You do not own this business.' }, { status: 403 });
    }

    const body = await req.json();
    const validated = BusinessListingSchema.partial().parse(body);

    const updated = await BusinessRepository.update(id, validated);

    return NextResponse.json({ success: true, business: updated });
  } catch (error) {
    console.error('Update Business Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update business' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await db.business.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Business not found.' }, { status: 404 });
    }

    if (existing.ownerId !== user.id && user.role !== Role.ADMINISTRATOR) {
      return NextResponse.json({ success: false, error: 'Forbidden.' }, { status: 403 });
    }

    await BusinessRepository.softDelete(id);

    return NextResponse.json({ success: true, message: 'Business listing soft-deleted successfully.' });
  } catch (error) {
    console.error('Delete Business Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete business' }, { status: 500 });
  }
}
