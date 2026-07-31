import db from '@/lib/db';
import { Prisma } from '@prisma/client';

export class ReviewRepository {
  /**
   * Get approved reviews for a business
   */
  static async findByBusinessId(businessId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const where: Prisma.ReviewWhereInput = {
      businessId,
      isApproved: true,
      deletedAt: null,
    };

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where,
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
          replies: {
            include: {
              user: { select: { id: true, name: true, image: true } },
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.review.count({ where }),
    ]);

    return {
      reviews,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create review and recalculate business avg rating & review count
   */
  static async createReview(data: {
    businessId: string;
    userId: string;
    rating: number;
    title: string;
    comment: string;
  }) {
    const existing = await db.review.findFirst({
      where: { businessId: data.businessId, userId: data.userId, deletedAt: null },
      select: { id: true },
    });
    if (existing) {
      throw new Error('You have already submitted a review for this business.');
    }

    const review = await db.review.create({
      data: {
        ...data,
        isApproved: true,
      },
    });

    await this.recalculateBusinessRating(data.businessId);
    return review;
  }

  /**
   * Add owner reply to review
   */
  static async addReply(reviewId: string, userId: string, comment: string) {
    return await db.reviewReply.create({
      data: {
        reviewId,
        userId,
        comment,
      },
    });
  }

  /**
   * Recalculate average rating and total reviews for a business
   */
  static async recalculateBusinessRating(businessId: string) {
    const aggregate = await db.review.aggregate({
      where: {
        businessId,
        isApproved: true,
        deletedAt: null,
      },
      _avg: { rating: true },
      _count: { id: true },
    });

    const avgRating = Number((aggregate._avg.rating || 0).toFixed(1));
    const totalReviews = aggregate._count.id;

    await db.business.update({
      where: { id: businessId },
      data: {
        avgRating,
        totalReviews,
      },
    });
  }
}
