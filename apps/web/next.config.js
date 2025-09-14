/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gdrive-audio-player/ui', '@gdrive-audio-player/types'],
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/nagara-giki' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/nagara-giki' : '',
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  },
}

module.exports = nextConfig 