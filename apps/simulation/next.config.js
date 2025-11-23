/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@constitutional/modeling'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3006/:path*'
      }
    ];
  }
};

module.exports = nextConfig;
