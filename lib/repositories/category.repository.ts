import db from '@/lib/db';
import { Prisma } from '@prisma/client';
import { slugify } from '@/lib/utils';

export class CategoryRepository {
  /**
   * Fetch all main categories with subcategories and business counts
   */
  static async findMany(includeSubcategories = true) {
    return await db.category.findMany({
      where: { parentId: null },
      include: {
        subs: includeSubcategories,
        _count: {
          select: { businesses: true },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Get featured categories for homepage/navigation
   */
  static async getFeatured(limit = 8) {
    return await db.category.findMany({
      where: { isFeatured: true },
      include: {
        subs: true,
        _count: {
          select: { businesses: true },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      take: limit,
    });
  }

  /**
   * Find category by slug with detailed business listings and subcategories
   */
  static async findBySlug(slug: string) {
    return await db.category.findUnique({
      where: { slug },
      include: {
        subs: {
          include: {
            _count: { select: { businesses: true } },
          },
        },
        businesses: {
          where: { status: 'APPROVED', deletedAt: null },
          take: 12,
          orderBy: [{ isFeatured: 'desc' }, { avgRating: 'desc' }],
          include: {
            category: { select: { id: true, name: true, slug: true, icon: true } },
            subcategory: { select: { id: true, name: true, slug: true } },
            _count: { select: { reviews: true, favorites: true } },
          },
        },
        _count: {
          select: { businesses: true, subs: true },
        },
      },
    });
  }

  /**
   * Create a new category
   */
  static async create(data: {
    name: string;
    description?: string;
    icon?: string;
    isFeatured?: boolean;
    sortOrder?: number;
    parentId?: string;
  }) {
    let slug = slugify(data.name);
    let count = 1;
    while (await db.category.findUnique({ where: { slug } })) {
      slug = `${slugify(data.name)}-${count}`;
      count++;
    }

    return await db.category.create({
      data: {
        ...data,
        slug,
      },
    });
  }

  /**
   * Update category
   */
  static async update(id: string, data: Prisma.CategoryUpdateInput) {
    return await db.category.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete category
   */
  static async delete(id: string) {
    return await db.category.delete({
      where: { id },
    });
  }
}
