/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "prestigious-donkey-523.convex.cloud",
      },
      {
        hostname: "images.unsplash.com",
      },
      {
        hostname: "res.cloudinary.com",
      },
      {
        hostname: "img.clerk.com",
      },
      {
        hostname: "files.edgestore.dev",
      },
    ],
  },
}

export default nextConfig
