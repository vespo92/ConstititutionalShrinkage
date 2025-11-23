/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@constitutional-shrinkage/governance-utils',
    '@constitutional-shrinkage/constitutional-framework',
    '@constitutional-shrinkage/metrics',
    '@constitutional-shrinkage/voting-system',
  ],
  images: {
    domains: ['api.mapbox.com', 'tile.openstreetmap.org'],
  },
};

module.exports = nextConfig;
