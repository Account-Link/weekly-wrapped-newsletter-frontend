/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ["@resvg/resvg-js"]
  },
  webpack: (config) => {
    config.externals.push("@resvg/resvg-js");
    return config;
  }
};

export default nextConfig;
