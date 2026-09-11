/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "**.r2.cloudflarestorage.com" },
      // Uncomment and edit when you set up a custom image domain:
      // { protocol: "https", hostname: "images.al-fateh-leather-garments.store" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

module.exports = nextConfig;