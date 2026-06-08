/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "images.unsplash.com",
      "ukmjnhvivrzdtvkhftpq.supabase.co", // ✅ add this
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  experimental: {
    cpus: 1,
  },
};

module.exports = nextConfig;