import db from '@/lib/db';
import { Prisma, Role, UserStatus } from '@prisma/client';

export class UserRepository {
  /**
   * Find user by email
   */
  static async findByEmail(email: string) {
    return await db.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { planDetails: true },
          take: 1,
        },
      },
    });
  }

  /**
   * Find user by ID with full profile detail
   */
  static async findById(id: string) {
    return await db.user.findUnique({
      where: { id },
      include: {
        businesses: {
          where: { deletedAt: null },
          include: {
            category: { select: { id: true, name: true, slug: true } },
            _count: { select: { reviews: true, favorites: true, businessViews: true } },
          },
        },
        subscriptions: {
          include: { planDetails: true },
          orderBy: { createdAt: 'desc' },
        },
        favorites: {
          include: {
            business: {
              select: { id: true, name: true, slug: true, logo: true, cityName: true, countryName: true },
            },
          },
        },
        _count: {
          select: { businesses: true, reviews: true, favorites: true },
        },
      },
    });
  }

  /**
   * Create new User account
   */
  static async create(data: Prisma.UserCreateInput) {
    return await db.user.create({
      data: {
        ...data,
        email: data.email.toLowerCase(),
      },
    });
  }

  /**
   * Update User details
   */
  static async update(id: string, data: Prisma.UserUpdateInput) {
    return await db.user.update({
      where: { id },
      data,
    });
  }

  /**
   * Update User status or role (Admin operation)
   */
  static async updateRoleAndStatus(id: string, role?: Role, status?: UserStatus) {
    const updateData: Prisma.UserUpdateInput = {};
    if (role) updateData.role = role;
    if (status) updateData.status = status;

    return await db.user.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Paginated list of users for Admin dashboard
   */
  static async findManyAdmin(options: {
    query?: string;
    role?: Role;
    status?: UserStatus;
    page?: number;
    limit?: number;
  }) {
    const { query, role, status, page = 1, limit = 15 } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    };

    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
        { phone: { contains: query, mode: 'insensitive' } },
      ];
    }

    if (role) where.role = role;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          status: true,
          image: true,
          phone: true,
          createdAt: true,
          _count: {
            select: { businesses: true, reviews: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
