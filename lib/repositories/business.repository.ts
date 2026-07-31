import db from '@/lib/db';
import { BusinessStatus, Prisma } from '@prisma/client';
import { slugify } from '@/lib/utils';

export interface BusinessFilterOptions {
  query?: string;
  categorySlug?: string;
  countryName?: string;
  cityName?: string;
  minRating?: number;
  featuredOnly?: boolean;
  status?: BusinessStatus;
  page?: number;
  limit?: number;
}

export class BusinessRepository {
  /**
   * Find approved businesses with filtering, pagination, and sorting
   */
  static async findMany(options: BusinessFilterOptions) {
    const {
      query,
      categorySlug,
      countryName,
      cityName,
      minRating = 0,
      featuredOnly = false,
      status = BusinessStatus.APPROVED,
      page = 1,
      limit = 12,
    } = options;

    const skip = (page - 1) * limit;

    const where: Prisma.BusinessWhereInput = {
      status,
      deletedAt: null,
    };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { tagline: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { cityName: { contains: query, mode: 'insensitive' } },
        { countryName: { contains: query, mode: 'insensitive' } },
        { address: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (countryName) {
      where.countryName = { contains: countryName, mode: 'insensitive' };
    }

    if (cityName) {
      where.cityName = { contains: cityName, mode: 'insensitive' };
    }

    if (minRating > 0) {
      where.avgRating = { gte: minRating };
    }

    if (featuredOnly) {
      where.isFeatured = true;
    }

    const [listings, total] = await Promise.all([
      db.business.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true, icon: true } },
          subcategory: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true, favorites: true } },
        },
        orderBy: [{ isFeatured: 'desc' }, { avgRating: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      db.business.count({ where }),
    ]);

    return {
      listings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Find unique business by slug with complete detail graph
   */
  static async findBySlug(slug: string) {
    return await db.business.findFirst({
      where: { slug, status: BusinessStatus.APPROVED, deletedAt: null },
      include: {
        category: true,
        subcategory: true,
        owner: { select: { id: true, name: true, email: true, phone: true, image: true } },
        gallery: { orderBy: { sortOrder: 'asc' } },
        logos: { orderBy: { createdAt: 'desc' }, take: 1 },
        covers: { orderBy: { createdAt: 'desc' }, take: 1 },
        videos: true,
        services: true,
        products: { where: { isAvailable: true } },
        contacts: true,
        socialLinks: true,
        openingHours: true,
        faqs: { orderBy: { sortOrder: 'asc' } },
        tags: true,
        features: true,
        documents: true,
        reviews: {
          where: { isApproved: true, deletedAt: null },
          include: {
            user: { select: { id: true, name: true, image: true } },
            replies: { include: { user: { select: { id: true, name: true } } } },
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { reviews: true, favorites: true, inquiries: true } },
      },
    });
  }

  /**
   * Create a new Business listing with unique slug generation
   */
  static async create(data: Omit<Prisma.BusinessUncheckedCreateInput, 'slug'>) {
    let baseSlug = slugify(data.name as string);
    let uniqueSlug = baseSlug;
    let count = 1;

    while (await db.business.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${baseSlug}-${count}`;
      count++;
    }

    return await db.business.create({
      data: {
        ...data,
        slug: uniqueSlug,
      },
    });
  }

  /**
   * Update Business listing
   */
  static async update(id: string, data: Prisma.BusinessUncheckedUpdateInput) {
    return await db.business.update({
      where: { id },
      data,
    });
  }

  /**
   * Soft-delete Business listing
   */
  static async softDelete(id: string) {
    return await db.business.update({
      where: { id },
      data: { deletedAt: new Date(), status: BusinessStatus.SUSPENDED },
    });
  }

  /**
   * Increment view counter atomically
   */
  static async incrementView(id: string, ipAddress?: string, userAgent?: string) {
    await Promise.all([
      db.business.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      }),
      db.businessView.create({
        data: {
          businessId: id,
          visitorIp: ipAddress || null,
          userAgent: userAgent || null,
        },
      }),
    ]);
  }
}
