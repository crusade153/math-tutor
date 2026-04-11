// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["bcryptjs"],
  images: { 
    unoptimized: true // Vercel 이미지 최적화 한도 초과 방지용 (지침 반영)
  },
};

export default nextConfig;