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
    domains: ['api.coingecko.com', 'assets.coingecko.com'],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Enable compression and caching
  compress: true,
  poweredByHeader: false,
  // API route optimization
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=60, stale-while-revalidate=300',
          },
        ],
      },
    ]
  },
  // Redirect configuration
  async redirects() {
    return [
      {
        source: '/dashboard',
        destination: '/',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
