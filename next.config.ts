import type { NextConfig } from 'next';

// Pages allowed to show this site in a frame: itself, and STARTAP's portfolio,
// which previews this demonstration live. Add STARTAP's own domain here once it has one.
const frameAncestors = ["'self'", 'https://startap-site.vercel.app'];

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: `frame-ancestors ${frameAncestors.join(' ')}` },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [480, 640, 828, 1080, 1280, 1600, 1920, 2400],
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/media/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=2592000, stale-while-revalidate=86400' }] },
    ];
  },
};

export default nextConfig;
