/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@constitutional-shrinkage/governance-utils',
    '@constitutional-shrinkage/voting-system',
    '@constitutional-shrinkage/constitutional-framework',
    '@constitutional-shrinkage/metrics',
  ],
};

module.exports = nextConfig;
