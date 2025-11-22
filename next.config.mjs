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
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Exclude problematic packages from server components (moved from experimental in Next.js 16)
  serverComponentsExternalPackages: [
    'pino',
    'thread-stream',
    'tap',
    'desm',
    'fastbench',
    'pino-elasticsearch',
    'why-is-node-running',
    'tape',
    '@walletconnect/ethereum-provider',
    '@farcaster/miniapp-sdk',
    '@metamask/sdk',
  ],
}

export default nextConfig
