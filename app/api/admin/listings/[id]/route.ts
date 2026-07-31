import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const { status, isFeatured, isVerified, rejectionReason } = body;

    const updated = await db.business.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(typeof isFeatured === 'boolean' && { isFeatured }),
        ...(typeof isVerified === 'boolean' && { isVerified }),
        ...(rejectionReason && { rejectionReason }),
      },
    });

    return NextResponse.json({ success: true, business: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Update failed' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;

    await db.business.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 400 });
  }
}
