/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  experimental: {
    // Keep puppeteer-core/@sparticuz/chromium out of the webpack bundle for
    // the report API routes — they're loaded via a real require() at
    // runtime instead, so Vercel's file tracing ships their binary/brotli
    // assets as-is rather than webpack mangling them.
    serverComponentsExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
  },
};

export default nextConfig;
