import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { CategorySchema } from '@/lib/validations';
import { getSessionUser } from '@/lib/auth/better-auth';
import { slugify } from '@/lib/utils';
import { Role } from '@prisma/client';

export async function GET() {
  try {
    const categories = await db.category.findMany({
      where: { parentId: null },
      include: {
        subcategories: true,
        _count: { select: { businesses: true } },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json({ success: true, categories });
  } catch (error) {
    console.error('Get Categories Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user || (user.role !== Role.ADMINISTRATOR && user.role !== Role.MODERATOR)) {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin privileges required.' }, { status: 403 });
    }

    const body = await req.json();
    const validated = CategorySchema.parse(body);

    const slug = slugify(validated.name);

    const category = await db.category.create({
      data: {
        name: validated.name,
        slug,
        icon: validated.icon || null,
        description: validated.description || null,
        parentId: validated.parentId || null,
        isFeatured: validated.isFeatured || false,
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (error) {
    console.error('Create Category Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create category' },
      { status: 400 }
    );
  }
}
