import db from '@/lib/db';
import { Prisma } from '@prisma/client';

export interface SearchParams {
  query?: string;
  category?: string;
  country?: string;
  city?: string;
  rating?: number;
  featured?: boolean;
  page?: number;
  limit?: number;
}

export class SearchService {
  /**
   * PostgreSQL Full-Text Search Query
   */
  static async searchBusinesses(params: SearchParams) {
    const {
      query = '',
      category = '',
      country = '',
      city = '',
      rating = 0,
      featured = false,
      page = 1,
      limit = 12,
    } = params;

    const skip = (page - 1) * limit;

    const whereClause: Prisma.BusinessWhereInput = {
      status: 'APPROVED',
      deletedAt: null,
    };

    if (category) {
      whereClause.category = { slug: category };
    }

    if (country) {
      whereClause.countryName = { contains: country, mode: 'insensitive' };
    }

    if (city) {
      whereClause.cityName = { contains: city, mode: 'insensitive' };
    }

    if (rating > 0) {
      whereClause.avgRating = { gte: rating };
    }

    if (featured) {
      whereClause.isFeatured = true;
    }

    if (query && query.trim() !== '') {
      const sanitizedQuery = query.trim();
      whereClause.OR = [
        { name: { contains: sanitizedQuery, mode: 'insensitive' } },
        { tagline: { contains: sanitizedQuery, mode: 'insensitive' } },
        { description: { contains: sanitizedQuery, mode: 'insensitive' } },
        { cityName: { contains: sanitizedQuery, mode: 'insensitive' } },
        { countryName: { contains: sanitizedQuery, mode: 'insensitive' } },
        { products: { some: { title: { contains: sanitizedQuery, mode: 'insensitive' } } } },
        { services: { some: { name: { contains: sanitizedQuery, mode: 'insensitive' } } } },
        { tags: { some: { tag: { contains: sanitizedQuery, mode: 'insensitive' } } } },
      ];
    }

    const [results, total] = await Promise.all([
      db.business.findMany({
        where: whereClause,
        include: {
          category: { select: { id: true, name: true, slug: true, icon: true } },
          services: { take: 3 },
          products: { take: 3 },
          _count: { select: { reviews: true } },
        },
        orderBy: [{ isFeatured: 'desc' }, { avgRating: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      db.business.count({ where: whereClause }),
    ]);

    // Log search event asynchronously for analytics
    if (query.trim() !== '') {
      db.searchLog
        .create({
          data: {
            query: query.trim(),
            categorySlug: category || null,
            location: [city, country].filter(Boolean).join(', ') || null,
            resultCount: total,
          },
        })
        .catch(() => null);
    }

    return {
      results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
