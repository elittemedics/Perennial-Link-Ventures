import { PrismaClient, Role, UserStatus, BusinessStatus, DayOfWeek, SubscriptionPlanEnum, SubscriptionStatusEnum } from '@prisma/client';
import bcrypt from 'bcryptjs';

const db = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding for PostgreSQL Global Business Directory...');

  // 1. Seed Roles & Permissions
  console.log('1️⃣ Seeding Roles & System Settings...');

  // 2. Admin, Owner, Visitor Users
  const seedPassword = process.env.SEED_DEFAULT_PASSWORD
    || (process.env.NODE_ENV === 'production' ? undefined : 'LocalDevOnly123!');
  if (!seedPassword) {
    throw new Error('SEED_DEFAULT_PASSWORD must be set before seeding a production database.');
  }
  const defaultPasswordHash = await bcrypt.hash(seedPassword, 12);

  const adminUser = await db.user.upsert({
    where: { email: 'admin@perenniallink.com' },
    update: {},
    create: {
      name: 'System Administrator',
      email: 'admin@perenniallink.com',
      passwordHash: defaultPasswordHash,
      role: Role.ADMINISTRATOR,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      phone: '+233200000001',
    },
  });

  const ownerUser = await db.user.upsert({
    where: { email: 'owner@perenniallink.com' },
    update: {},
    create: {
      name: 'Global Business Owner',
      email: 'owner@perenniallink.com',
      passwordHash: defaultPasswordHash,
      role: Role.BUSINESS_OWNER,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      phone: '+233200000002',
    },
  });

  const visitorUser = await db.user.upsert({
    where: { email: 'visitor@perenniallink.com' },
    update: {},
    create: {
      name: 'Global Visitor',
      email: 'visitor@perenniallink.com',
      passwordHash: defaultPasswordHash,
      role: Role.VISITOR,
      status: UserStatus.ACTIVE,
      emailVerified: new Date(),
      phone: '+14155550199',
    },
  });

  console.log('✅ Default users created:');
  console.log('   - Seed credentials are supplied through SEED_DEFAULT_PASSWORD.');

  // 3. Seed Subscription Plans
  console.log('2️⃣ Seeding Subscription Plans...');
  const plans = [
    {
      name: 'Free Plan',
      plan: SubscriptionPlanEnum.FREE,
      price: 0,
      currency: 'USD',
      billingCycle: 'MONTHLY',
      maxListings: 1,
      maxPhotos: 5,
      maxProducts: 5,
      maxServices: 5,
      isFeatured: false,
      prioritySupport: false,
      description: 'Ideal for small startups registering their business directory listing.',
    },
    {
      name: 'Professional Plan',
      plan: SubscriptionPlanEnum.PRO,
      price: 29.99,
      currency: 'USD',
      billingCycle: 'MONTHLY',
      maxListings: 5,
      maxPhotos: 20,
      maxProducts: 25,
      maxServices: 25,
      isFeatured: true,
      prioritySupport: true,
      description: 'Ideal for growing businesses looking to expand their global market footprint.',
    },
    {
      name: 'Enterprise Plan',
      plan: SubscriptionPlanEnum.ENTERPRISE,
      price: 99.99,
      currency: 'USD',
      billingCycle: 'MONTHLY',
      maxListings: 50,
      maxPhotos: 100,
      maxProducts: 100,
      maxServices: 100,
      isFeatured: true,
      prioritySupport: true,
      description: 'For corporate conglomerates requiring premium global directory prominence.',
    },
  ];

  for (const p of plans) {
    await db.subscriptionPlan.upsert({
      where: { plan: p.plan },
      update: p,
      create: p,
    });
  }

  // 4. Seed Global Countries, Regions & Cities
  console.log('3️⃣ Seeding Global Location Hierarchy (Countries, Regions, Cities)...');
  
  const globalLocations = [
    {
      name: 'Ghana',
      code: 'GH',
      phoneCode: '+233',
      flagEmoji: '🇬🇭',
      currency: 'GHS',
      isFeatured: true,
      regions: [
        { name: 'Greater Accra', slug: 'greater-accra', cities: ['Accra', 'Tema', 'Madina'] },
        { name: 'Ashanti Region', slug: 'ashanti-region', cities: ['Kumasi', 'Obuasi'] },
        { name: 'Western Region', slug: 'western-region', cities: ['Sekondi-Takoradi'] },
      ],
    },
    {
      name: 'United States',
      code: 'US',
      phoneCode: '+1',
      flagEmoji: '🇺🇸',
      currency: 'USD',
      isFeatured: true,
      regions: [
        { name: 'New York', slug: 'new-york-state', cities: ['New York City', 'Buffalo'] },
        { name: 'California', slug: 'california', cities: ['San Francisco', 'Los Angeles', 'San Jose'] },
        { name: 'Texas', slug: 'texas', cities: ['Houston', 'Austin', 'Dallas'] },
      ],
    },
    {
      name: 'United Kingdom',
      code: 'GB',
      phoneCode: '+44',
      flagEmoji: '🇬🇧',
      currency: 'GBP',
      isFeatured: true,
      regions: [
        { name: 'Greater London', slug: 'greater-london', cities: ['London'] },
        { name: 'Greater Manchester', slug: 'greater-manchester', cities: ['Manchester'] },
      ],
    },
    {
      name: 'Germany',
      code: 'DE',
      phoneCode: '+49',
      flagEmoji: '🇩🇪',
      currency: 'EUR',
      isFeatured: true,
      regions: [
        { name: 'Berlin State', slug: 'berlin-state', cities: ['Berlin'] },
        { name: 'Bavaria', slug: 'bavaria', cities: ['Munich'] },
        { name: 'Hesse', slug: 'hesse', cities: ['Frankfurt'] },
      ],
    },
    {
      name: 'United Arab Emirates',
      code: 'AE',
      phoneCode: '+971',
      flagEmoji: '🇦🇪',
      currency: 'AED',
      isFeatured: true,
      regions: [
        { name: 'Emirate of Dubai', slug: 'dubai-emirate', cities: ['Dubai'] },
        { name: 'Emirate of Abu Dhabi', slug: 'abu-dhabi-emirate', cities: ['Abu Dhabi'] },
      ],
    },
  ];

  for (const c of globalLocations) {
    const country = await db.country.upsert({
      where: { code: c.code },
      update: { name: c.name, phoneCode: c.phoneCode, flagEmoji: c.flagEmoji, currency: c.currency, isFeatured: c.isFeatured },
      create: {
        name: c.name,
        code: c.code,
        phoneCode: c.phoneCode,
        flagEmoji: c.flagEmoji,
        currency: c.currency,
        isFeatured: c.isFeatured,
      },
    });

    for (const r of c.regions) {
      const region = await db.region.upsert({
        where: { slug: r.slug },
        update: { name: r.name, countryId: country.id },
        create: {
          name: r.name,
          slug: r.slug,
          countryId: country.id,
        },
      });

      for (const cityName of r.cities) {
        const citySlug = `${cityName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${c.code.toLowerCase()}`;
        await db.city.upsert({
          where: { slug: citySlug },
          update: { name: cityName, regionId: region.id, countryId: country.id },
          create: {
            name: cityName,
            slug: citySlug,
            regionId: region.id,
            countryId: country.id,
            isFeatured: true,
          },
        });
      }
    }
  }

  // 5. Seed Business Categories
  console.log('4️⃣ Seeding Global Business Categories...');

  const categoriesData = [
    {
      name: 'Technology & Software',
      slug: 'technology-software',
      icon: 'Laptop',
      description: 'Software development, cloud computing, AI, and cybersecurity firms.',
      isFeatured: true,
      sortOrder: 1,
    },
    {
      name: 'Financial & Investment Services',
      slug: 'financial-investment-services',
      icon: 'BadgeDollarSign',
      description: 'Banking, fintech, investment funds, and accounting agencies.',
      isFeatured: true,
      sortOrder: 2,
    },
    {
      name: 'Real Estate & Infrastructure',
      slug: 'real-estate-infrastructure',
      icon: 'Building2',
      description: 'Commercial properties, housing developments, and construction firms.',
      isFeatured: true,
      sortOrder: 3,
    },
    {
      name: 'Healthcare & Biotechnology',
      slug: 'healthcare-biotechnology',
      icon: 'Stethoscope',
      description: 'Hospitals, medical technology, pharmaceuticals, and clinics.',
      isFeatured: true,
      sortOrder: 4,
    },
    {
      name: 'Logistics & Freight Services',
      slug: 'logistics-freight-services',
      icon: 'Truck',
      description: 'Global cargo, shipping, warehousing, and supply chain solutions.',
      isFeatured: true,
      sortOrder: 5,
    },
    {
      name: 'Hospitality & International Tourism',
      slug: 'hospitality-international-tourism',
      icon: 'Hotel',
      description: 'Hotels, resorts, luxury dining, and travel management.',
      isFeatured: true,
      sortOrder: 6,
    },
    {
      name: 'Agriculture & Global Agribusiness',
      slug: 'agriculture-agribusiness',
      icon: 'Sprout',
      description: 'Farming, food processing, commodities export, and agritech.',
      isFeatured: true,
      sortOrder: 7,
    },
  ];

  const categoryMap: Record<string, string> = {};

  for (const catData of categoriesData) {
    const cat = await db.category.upsert({
      where: { slug: catData.slug },
      update: catData,
      create: catData,
    });
    categoryMap[catData.slug] = cat.id;
  }

  // 6. Seed Businesses across Global Markets
  console.log('5️⃣ Seeding Sample Global Business Directory Listings...');

  // Demo listings are opt-in only. Real deployments should begin with genuine user submissions.
  const sampleBusinesses = process.env.SEED_SAMPLE_DATA === 'true' ? [
    {
      name: 'Perennial Global Cloud Systems',
      slug: 'perennial-global-cloud-systems',
      tagline: 'Enterprise Cloud & AI Solutions for International Markets',
      description: 'Leading provider of enterprise cloud infrastructure, high-performance database cluster management, and AI integration services operating across EMEA and North America.',
      categorySlug: 'technology-software',
      phone: '+14155550100',
      whatsapp: '+14155550100',
      email: 'info@perennialcloud.com',
      website: 'https://perenniallink.com',
      address: '100 Silicon Way, Financial District',
      cityName: 'San Francisco',
      countryName: 'United States',
      isFeatured: true,
      isVerified: true,
      status: BusinessStatus.APPROVED,
      avgRating: 4.9,
      totalReviews: 28,
      viewCount: 1420,
    },
    {
      name: 'Accra Venture Capital & Financial Holdings',
      slug: 'accra-venture-capital-holdings',
      tagline: 'Empowering High-Growth Emerging Market Enterprises',
      description: 'Premier West African investment firm specializing in equity financing, corporate advisory, and international cross-border trade structured finance.',
      categorySlug: 'financial-investment-services',
      phone: '+233302001122',
      whatsapp: '+233244001122',
      email: 'invest@accraventures.com',
      website: 'https://accraventures.com',
      address: '24 Independence Avenue, Ridge',
      cityName: 'Accra',
      countryName: 'Ghana',
      isFeatured: true,
      isVerified: true,
      status: BusinessStatus.APPROVED,
      avgRating: 4.8,
      totalReviews: 19,
      viewCount: 980,
    },
    {
      name: 'London Apex Real Estate & Construction',
      slug: 'london-apex-real-estate',
      tagline: 'Luxury Commercial Properties & Architecture',
      description: 'International property development and asset management firm delivering prime real estate listings across European economic hubs.',
      categorySlug: 'real-estate-infrastructure',
      phone: '+442079460912',
      whatsapp: '+447911123456',
      email: 'contact@londonapex.co.uk',
      website: 'https://londonapex.co.uk',
      address: '1 Canary Wharf, Docklands',
      cityName: 'London',
      countryName: 'United Kingdom',
      isFeatured: true,
      isVerified: true,
      status: BusinessStatus.APPROVED,
      avgRating: 4.7,
      totalReviews: 15,
      viewCount: 860,
    },
  ] : [];

  for (const b of sampleBusinesses) {
    const categoryId = categoryMap[b.categorySlug] || Object.values(categoryMap)[0];

    const business = await db.business.upsert({
      where: { slug: b.slug },
      update: {
        name: b.name,
        tagline: b.tagline,
        description: b.description,
        categoryId,
        phone: b.phone,
        whatsapp: b.whatsapp,
        email: b.email,
        website: b.website,
        address: b.address,
        cityName: b.cityName,
        countryName: b.countryName,
        isFeatured: b.isFeatured,
        isVerified: b.isVerified,
        status: b.status,
        avgRating: b.avgRating,
        totalReviews: b.totalReviews,
        viewCount: b.viewCount,
      },
      create: {
        ownerId: ownerUser.id,
        name: b.name,
        slug: b.slug,
        tagline: b.tagline,
        description: b.description,
        categoryId,
        phone: b.phone,
        whatsapp: b.whatsapp,
        email: b.email,
        website: b.website,
        address: b.address,
        cityName: b.cityName,
        countryName: b.countryName,
        isFeatured: b.isFeatured,
        isVerified: b.isVerified,
        status: b.status,
        avgRating: b.avgRating,
        totalReviews: b.totalReviews,
        viewCount: b.viewCount,
      },
    });

    // Opening Hours
    const days: DayOfWeek[] = [DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY, DayOfWeek.THURSDAY, DayOfWeek.FRIDAY];
    for (const d of days) {
      await db.businessOpeningHour.upsert({
        where: { businessId_dayOfWeek: { businessId: business.id, dayOfWeek: d } },
        update: { openTime: '08:00', closeTime: '17:00', isClosed: false },
        create: { businessId: business.id, dayOfWeek: d, openTime: '08:00', closeTime: '17:00', isClosed: false },
      });
    }

    // Sample Reviews
    await db.review.create({
      data: {
        businessId: business.id,
        userId: visitorUser.id,
        rating: 5,
        title: 'Outstanding Global Service',
        comment: 'Working with this business enabled our cross-border international team to expand exponentially.',
        isApproved: true,
      },
    });
  }

  // 7. Seed Site Settings
  console.log('6️⃣ Seeding Global Platform Settings...');
  const siteSettings = [
    { key: 'site_name', value: 'Perennial Link Ventures', description: 'Platform Title' },
    { key: 'site_description', value: 'Premier Global Business Directory connecting international enterprises, investors, and clients.', description: 'Meta Description' },
    { key: 'contact_email', value: 'support@perenniallink.com', description: 'Support Contact Email' },
    { key: 'currency', value: 'USD', description: 'Default Global Platform Currency' },
    { key: 'enable_registration', value: 'true', description: 'Allow new user registration' },
    { key: 'require_business_approval', value: 'true', description: 'Require admin approval for new listings' },
  ];

  for (const s of siteSettings) {
    await db.siteSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description },
      create: s,
    });
  }

  console.log('🎉 PostgreSQL Global Business Directory Seeding Complete Successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
