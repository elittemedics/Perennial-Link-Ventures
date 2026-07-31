/** @type {import('next').NextConfig} */
const nextConfig = {
  // Docker enables this; Vercel uses its own optimized serverless output.
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/api/auth/register',
        destination: '/api/v1/auth/register',
      },
      {
        source: '/api/auth/login',
        destination: '/api/v1/auth/login',
      },
      {
        source: '/api/auth/logout',
        destination: '/api/v1/auth/logout',
      },
      {
        source: '/api/auth/forgot-password',
        destination: '/api/v1/auth/forgot-password',
      },
      {
        source: '/api/auth/reset-password',
        destination: '/api/v1/auth/reset-password',
      },
      {
        source: '/api/v1/auth/send-otp',
        destination: '/api/auth/send-otp',
      },
      {
        source: '/api/categories',
        destination: '/api/v1/categories',
      },
      {
        source: '/api/listings',
        destination: '/api/v1/businesses',
      },
      {
        source: '/api/reviews',
        destination: '/api/v1/reviews',
      },
      {
        source: '/api/upload',
        destination: '/api/v1/upload',
      },
      {
        source: '/api/v1/inquiries',
        destination: '/api/inquiries',
      },
    ];
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000,
    deviceSizes: [360, 480, 640, 750, 828, 1080, 1200, 1600, 1920],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
