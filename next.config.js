/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode for faster development
  experimental: {
    optimizeCss: true, // Optimize CSS
    serverActions: true,
  },
  transpilePackages: [], // Add any packages that need transpilation
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