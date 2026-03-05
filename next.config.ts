import type { NextConfig } from "next";

// Disable setupDevPlatform when building for production (Pages handles this natively at runtime)
// But we *do* need it locally to test KV bindings. We use a dynamic import so it doesn't 
// crash the production build looking for wrangler.
if (process.env.NODE_ENV === 'development') {
  import('@cloudflare/next-on-pages/next-dev').then(({ setupDevPlatform }) => {
      setupDevPlatform().catch(console.error);
  }).catch(console.error);
}

const nextConfig: NextConfig = {
  // Performance optimizations
  reactStrictMode: true,
  poweredByHeader: false,

  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // NOTE: Do NOT use output: 'standalone' - it's incompatible with @cloudflare/next-on-pages
  // The Pages adapter generates its own output format.

  images: {
    remotePatterns: [
      // Douban images
      {
        protocol: 'https',
        hostname: 'img3.doubanio.com',
      },
      {
        protocol: 'https',
        hostname: 'img1.doubanio.com',
      },
      {
        protocol: 'https',
        hostname: 'img2.doubanio.com',
      },
      {
        protocol: 'https',
        hostname: 'img9.doubanio.com',
      },
      // Video source images - allow all subdomains with wildcards
      {
        protocol: 'http',
        hostname: '**.com',
      },
      {
        protocol: 'https',
        hostname: '**.com',
      },
      {
        protocol: 'http',
        hostname: '**.cn',
      },
      {
        protocol: 'https',
        hostname: '**.cn',
      },
      {
        protocol: 'http',
        hostname: '**.net',
      },
      {
        protocol: 'https',
        hostname: '**.net',
      },
      {
        protocol: 'http',
        hostname: '**.org',
      },
      {
        protocol: 'https',
        hostname: '**.org',
      },
      {
        protocol: 'http',
        hostname: '**.tv',
      },
      {
        protocol: 'https',
        hostname: '**.tv',
      },
      {
        protocol: 'http',
        hostname: '**.io',
      },
      {
        protocol: 'https',
        hostname: '**.io',
      },
      {
        protocol: 'http',
        hostname: '**.xyz',
      },
      {
        protocol: 'https',
        hostname: '**.xyz',
      },
      {
        protocol: 'http',
        hostname: '**.online',
      },
      {
        protocol: 'https',
        hostname: '**.online',
      },
      {
        protocol: 'http',
        hostname: '**.top',
      },
      {
        protocol: 'https',
        hostname: '**.top',
      },
    ],
    // Add image optimization for better performance
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
};

export default nextConfig;
