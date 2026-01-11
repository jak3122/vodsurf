/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3"],
    outputFileTracingIncludes: {
      "/api/**/*": ["./data/**/*"], // Include everything in data folder for API routes
    },
  },
};

export default nextConfig;
