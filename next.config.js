/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode for faster development
  experimental: {
    optimizeCss: true, // Optimize CSS
    serverActions: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable static page generation for not-found
  output: 'standalone',
  // Skip the not-found page during build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Disable static optimization for not-found
  skipMiddlewareUrlNormalize: true,
  skipTrailingSlashRedirect: true,
  // Custom error handling
  async rewrites() {
    return [
      {
        source: '/_not-found',
        destination: '/404',
      },
    ];
  },
};

module.exports = nextConfig; 