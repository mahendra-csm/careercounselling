/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'i.pravatar.cc' },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@react-pdf/renderer', 'puppeteer', 'puppeteer-core', '@sparticuz/chromium'],
    // Force the headless-Chrome binary files into the send-report serverless
    // function (otherwise the bundler drops @sparticuz/chromium's /bin folder).
    outputFileTracingIncludes: {
      '/api/send-report': ['./node_modules/@sparticuz/chromium/bin/**/*'],
    },
  },
};

module.exports = nextConfig;
