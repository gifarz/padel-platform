/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Cover/logo URLs are admin-entered (news, clubs, organization members) and
    // can point anywhere — allow any https host rather than hardcoding a CDN.
    remotePatterns: [{ protocol: 'https', hostname: '**' }],
  },
}
export default nextConfig
