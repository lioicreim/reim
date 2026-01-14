/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔴 핵심: 정적 export 활성화
  output: "export",

  // next/image 사용 시 정적 export에서 필요
  images: {
    unoptimized: true,
  },

  // ✅ dev 환경에서만: 다른 기기에서 접속 허용 (모바일 테스트용)
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://121.140.36.204:3000",
    "http://reim.kr", // 필요 없으면 빼도 됨
    "https://reim.kr", // 필요 없으면 빼도 됨
  ],

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
