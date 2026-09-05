import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { getSessionUser } from '@/lib/auth/better-auth';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { reportType = 'ABUSE', reason, reporterName, reporterEmail } = body;

    const user = await getSessionUser();

    const business = await db.business.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!business) {
      return NextResponse.json(
        { success: false, error: 'Business listing not found' },
        { status: 404 }
      );
    }

    const report = await db.businessReport.create({
      data: {
        businessId: id,
        reporterId: user?.id || null,
        reportType: reportType.toUpperCase(),
        reason: (reason || '').toString().trim().slice(0, 1000),
        reporterName: (reporterName || user?.name || '').toString().slice(0, 100),
        reporterEmail: (reporterEmail || user?.email || '').toString().slice(0, 100),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully. Our team will review this listing.',
      reportId: report.id,
    });
  } catch (error) {
    console.error('Business Report Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to submit report. Please try again.' },
      { status: 500 }
    );
  }
}
