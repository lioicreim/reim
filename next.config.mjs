/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔴 핵심: 정적 export 활성화
  output: "export",

  // next/image 사용 시 정적 export에서 필요
  images: {
    unoptimized: true,
  },

  // 기존 네 설정 유지
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ["**/node_modules/**", "**/.next/**"],
    };
    return config;
  },

  experimental: {},
  turbopack: {},
};

export default nextConfig;
