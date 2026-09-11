/** @type {import('next').NextConfig} */
const nextConfig = {
  // Image optimization disabled on the server due to Render memory limits.
  // Images are served directly from Cloudflare R2 in original format.
};

module.exports = nextConfig;