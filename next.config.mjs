/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // 경로에 공백이나 특수문자가 있어도 정상 작동하도록 설정
  webpack: (config, { isServer }) => {
    // 경로 처리 개선
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/.next/**'],
    };
    return config;
  },
  // 파일 시스템 감시 개선
  experimental: {
    // 파일 변경 감지 개선
  },
  // Turbopack 설정 (Next.js 16에서 기본 활성화)
  turbopack: {},
};

export default nextConfig;
