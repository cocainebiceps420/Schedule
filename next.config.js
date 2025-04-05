/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable strict mode for faster development
  experimental: {
    optimizeCss: true, // Optimize CSS
  },
  transpilePackages: [], // Add any packages that need transpilation
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig; 