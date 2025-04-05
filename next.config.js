/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode for faster development
  experimental: {
    optimizeCss: true, // Optimize CSS
    serverActions: {
      allowedOrigins: ['localhost:3000', 'schedule-cocainebiceps420.vercel.app'],
    },
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
  // Disable static page generation for error routes
  generateStaticParams: async () => {
    return {
      '/_error': false,
      '/_not-found': false,
      '/404': false,
    };
  },
};

module.exports = nextConfig; 