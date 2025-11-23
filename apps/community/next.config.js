/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@constitutional-shrinkage/governance-utils',
    '@constitutional-shrinkage/voting-system',
    '@constitutional-shrinkage/entity-registry',
    '@constitutional-shrinkage/moderation',
  ],
};

module.exports = nextConfig;
