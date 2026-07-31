import db from '@/lib/db';

export class LocationRepository {
  /**
   * Fetch featured countries with city count and business count
   */
  static async getFeaturedCountries() {
    return await db.country.findMany({
      where: { isFeatured: true },
      include: {
        _count: {
          select: { cities: true, businesses: true },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Fetch all regions and cities under a specific country by code (e.g., "GH", "US", "GB")
   */
  static async getHierarchyByCountry(countryCode: string) {
    return await db.country.findUnique({
      where: { code: countryCode.toUpperCase() },
      include: {
        regions: {
          include: {
            cities: {
              include: {
                _count: { select: { businesses: true } },
              },
            },
          },
        },
      },
    });
  }

  /**
   * Search locations (cities or countries) matching user query
   */
  static async searchLocations(query: string) {
    const [cities, countries] = await Promise.all([
      db.city.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
        },
        include: { country: { select: { name: true, code: true } } },
        take: 5,
      }),
      db.country.findMany({
        where: {
          name: { contains: query, mode: 'insensitive' },
        },
        take: 5,
      }),
    ]);

    return { cities, countries };
  }
}
