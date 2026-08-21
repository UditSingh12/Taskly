import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Required for Docker/Fluid Compute: produces a self-contained .next/standalone folder
  output: 'standalone',

  // @taskly/shared-types is vendored locally via tsconfig paths, no transpile needed
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
