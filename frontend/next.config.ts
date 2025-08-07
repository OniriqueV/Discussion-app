import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Xóa rewrites vì chúng ta sẽ gọi trực tiếp tới backend
  // Rewrites chỉ cần thiết khi muốn proxy trong cùng domain
};

export default nextConfig;