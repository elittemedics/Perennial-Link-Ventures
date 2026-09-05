import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth/better-auth';

// POST — report a product as ABUSE or UNAVAILABLE
// Business owners reporting UNAVAILABLE also set isAvailable = false immediately
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getSessionUser();

    const body = await req.json();
    const reportType: 'UNAVAILABLE' | 'ABUSE' = body.reportType === 'UNAVAILABLE' ? 'UNAVAILABLE' : 'ABUSE';
    const reason = (body.reason || '').toString().trim() || null;

    const product = await db.businessProduct.findUnique({
      where: { id },
      select: { ownerId: true, business: { select: { ownerId: true } } },
    });
    if (!product) return NextResponse.json({ success: false, error: 'Product not found.' }, { status: 404 });

    const isOwner =
      user && (product.ownerId === user.id || product.business?.ownerId === user.id);

    // Business owner can directly mark product as unavailable
    if (reportType === 'UNAVAILABLE' && isOwner) {
      await db.businessProduct.update({ where: { id }, data: { isAvailable: false } });
      return NextResponse.json({ success: true, message: 'Product marked as unavailable.' });
    }

    // Anyone (authenticated or not) can file a report
    await db.productReport.create({
      data: {
        productId: id,
        reporterId: user?.id ?? null,
        reportType,
        reason,
      },
    });

    return NextResponse.json({ success: true, message: 'Report submitted. Thank you.' }, { status: 201 });
  } catch (error) {
    console.error('Report Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit report.' }, { status: 500 });
  }
}
