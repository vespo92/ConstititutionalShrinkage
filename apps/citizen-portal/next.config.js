/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@constitutional-shrinkage/governance-utils',
    '@constitutional-shrinkage/voting-system',
    '@constitutional-shrinkage/constitutional-framework',
    '@constitutional-shrinkage/entity-registry',
  ],
  // experimental: {
  //   typedRoutes: true,
  // },
};

module.exports = nextConfig;
