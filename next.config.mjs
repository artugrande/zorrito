/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'generativelanguage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
    ],
  },
  experimental: {
    // Temporarily disable optimizePackageImports to fix initialization errors
    // optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Note: serverComponentsExternalPackages moved to top level in Next.js 16
  // Keeping for compatibility but may show warning
}

export default nextConfig
