import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // 显式指定 Turbopack 根目录，避免被其它 lockfile 干扰导致误判 workspace root
    root: path.join(__dirname),
  },
};

export default nextConfig;
