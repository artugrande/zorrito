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
    // Exclude problematic packages from server components
    serverComponentsExternalPackages: ['pino', 'thread-stream'],
  },
  // Use webpack instead of turbopack for build to avoid test file issues
  webpack: (config) => {
    // Ignore test files and directories
    config.resolve = config.resolve || {}
    config.resolve.alias = config.resolve.alias || {}
    
    // Ignore test directories
    config.module = config.module || {}
    config.module.rules = config.module.rules || []
    config.module.rules.push({
      test: /node_modules\/thread-stream\/test/,
      use: 'ignore-loader',
    })
    
    return config
  },
}

export default nextConfig
