/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@constitutional-shrinkage/governance-utils',
    '@constitutional-shrinkage/metrics',
    '@constitutional-shrinkage/business-transparency',
    '@constitutional-shrinkage/entity-registry',
  ],
  images: {
    domains: ['localhost'],
  },
};

module.exports = nextConfig;
