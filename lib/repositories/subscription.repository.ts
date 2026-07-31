import db from '@/lib/db';
import { PaymentStatus, Prisma, SubscriptionPlanEnum, SubscriptionStatusEnum } from '@prisma/client';

export class SubscriptionRepository {
  /**
   * Get all active subscription plans
   */
  static async getPlans() {
    return await db.subscriptionPlan.findMany({
      orderBy: { price: 'asc' },
    });
  }

  /**
   * Get active user subscription with plan details
   */
  static async getUserSubscription(ownerId: string) {
    return await db.subscription.findFirst({
      where: { ownerId, status: SubscriptionStatusEnum.ACTIVE },
      include: { planDetails: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Upsert subscription for business owner
   */
  static async updateSubscription(data: {
    ownerId: string;
    plan: SubscriptionPlanEnum;
    billingCycle?: string;
    price: number;
    transactionRef?: string;
  }) {
    const planDetails = await db.subscriptionPlan.findUnique({
      where: { plan: data.plan },
    });

    const activeSub = await this.getUserSubscription(data.ownerId);

    if (activeSub) {
      return await db.subscription.update({
        where: { id: activeSub.id },
        data: {
          plan: data.plan,
          planId: planDetails?.id || null,
          price: data.price,
          billingCycle: data.billingCycle || 'MONTHLY',
          status: SubscriptionStatusEnum.ACTIVE,
          transactionRef: data.transactionRef,
          updatedAt: new Date(),
        },
      });
    }

    return await db.subscription.create({
      data: {
        ownerId: data.ownerId,
        plan: data.plan,
        planId: planDetails?.id || null,
        price: data.price,
        billingCycle: data.billingCycle || 'MONTHLY',
        status: SubscriptionStatusEnum.ACTIVE,
        transactionRef: data.transactionRef,
      },
    });
  }

  /**
   * Record payment transaction
   */
  static async recordPayment(data: {
    userId: string;
    subscriptionId?: string;
    amount: number;
    currency?: string;
    paymentMethod?: string;
    transactionRef: string;
    status?: PaymentStatus;
  }) {
    return await db.payment.create({
      data: {
        userId: data.userId,
        subscriptionId: data.subscriptionId || null,
        amount: data.amount,
        currency: data.currency || 'USD',
        paymentMethod: data.paymentMethod || 'CARD',
        transactionRef: data.transactionRef,
        status: data.status || PaymentStatus.COMPLETED,
      },
    });
  }
}
