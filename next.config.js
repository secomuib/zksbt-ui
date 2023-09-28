/** @type {import('next').NextConfig} */

const nextConfig = {
  // to solve issue with fs
  webpack5: true,
  webpack: (config) => {
    config.resolve.fallback = { fs: false };

    return config;
  }
  // to solve issue with fs
}

module.exports = nextConfig
