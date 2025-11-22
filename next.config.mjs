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
    // Exclude problematic packages from server components
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
      '@farcaster/auth-kit',
      '@farcaster/auth-client',
      '@metamask/sdk',
    ],
  },
  // Webpack configuration to handle CSS imports
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ignore CSS imports on server side
      config.module.rules.push({
        test: /\.css$/,
        use: 'ignore-loader',
      })
    }
    return config
  },
}

export default nextConfig
