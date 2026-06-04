const isVercel = process.env.VERCEL === '1';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...(isVercel ? {} : { output: 'export' }),
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
