/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["@resvg/resvg-js"],
  webpack: (config) => {
    config.externals.push("@resvg/resvg-js");
    config.module.rules.push({
      test: /\.ttf$/,
      type: "asset/resource"
    });
    // 重要逻辑：允许 .riv 二进制资源参与打包，用于 Rive 动画
    config.module.rules.push({
      test: /\.riv$/,
      type: "asset/resource"
    });
    return config;
  },
  async redirects() {
    return [
      {
        source: "/invite",
        destination: "/invitation",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
