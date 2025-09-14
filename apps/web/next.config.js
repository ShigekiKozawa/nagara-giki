/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@gdrive-audio-player/ui', '@gdrive-audio-player/types'],
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  assetPrefix: process.env.NODE_ENV === 'production' ? '/nagara-giki/' : '',
  basePath: process.env.NODE_ENV === 'production' ? '/nagara-giki' : '',
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  },
  async generateBuildId() {
    return 'build'
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig 