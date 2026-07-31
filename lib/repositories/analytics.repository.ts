import db from '@/lib/db';
import { ClickTarget } from '@prisma/client';

export class AnalyticsRepository {
  /**
   * Log user click event on business contact channels (phone, website, whatsapp, directions)
   */
  static async logClick(businessId: string, targetType: ClickTarget, visitorIp?: string) {
    await Promise.all([
      db.businessClick.create({
        data: {
          businessId,
          targetType,
          visitorIp: visitorIp || null,
        },
      }),
      db.business.update({
        where: { id: businessId },
        data: { clickCount: { increment: 1 } },
      }),
    ]);
  }

  /**
   * Log search queries for analytics
   */
  static async logSearch(data: {
    query: string;
    categorySlug?: string;
    location?: string;
    resultCount: number;
    visitorIp?: string;
  }) {
    return await db.searchLog.create({
      data: {
        query: data.query,
        categorySlug: data.categorySlug || null,
        location: data.location || null,
        resultCount: data.resultCount,
        visitorIp: data.visitorIp || null,
      },
    });
  }

  /**
   * Get total platform stats for Admin dashboard
   */
  static async getAdminPlatformStats() {
    const [totalUsers, totalBusinesses, pendingBusinesses, totalReviews, totalViews] = await Promise.all([
      db.user.count({ where: { deletedAt: null } }),
      db.business.count({ where: { deletedAt: null } }),
      db.business.count({ where: { status: 'PENDING', deletedAt: null } }),
      db.review.count({ where: { deletedAt: null } }),
      db.businessView.count(),
    ]);

    return {
      totalUsers,
      totalBusinesses,
      pendingBusinesses,
      totalReviews,
      totalViews,
    };
  }
}
