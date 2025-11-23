/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@constitutional-shrinkage/governance-utils',
    '@constitutional-shrinkage/constitutional-framework',
    '@constitutional-shrinkage/metrics',
  ],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.constitutional-shrinkage.gov',
      },
    ],
  },
};

module.exports = nextConfig;
