/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@resvg/resvg-js"],
  webpack: (config) => {
    config.externals.push("@resvg/resvg-js");
    config.module.rules.push({
      test: /\.ttf$/,
      type: "asset/resource"
    });
    return config;
  }
};

export default nextConfig;
