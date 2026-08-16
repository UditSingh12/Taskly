import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@taskly/shared-types'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL
          ? `${process.env.NEXT_PUBLIC_API_URL}/api/:path*`
          : 'http://localhost:5000/api/:path*',
      },
    ];
  },
};

export default nextConfig;
