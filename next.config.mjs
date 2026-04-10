import path from "path";
import { fileURLToPath } from "url";

/** 配置文件所在目录 = 仓库根目录（避免 Turbopack 误判到 Desktop/Projects） */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = __dirname;

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: projectRoot,
  /** 将 /api/py/* 代理到本地 FastAPI（默认 8000），部署时设置 PY_API_URL */
  async rewrites() {
    const pyBase = (process.env.PY_API_URL ?? "http://127.0.0.1:8000").replace(
      /\/$/,
      "",
    );
    return [
      {
        source: "/api/py/:path*",
        destination: `${pyBase}/api/py/:path*`,
      },
    ];
  },
  turbopack: {
    root: projectRoot,
    resolveAlias: {
      tailwindcss: path.join(projectRoot, "node_modules", "tailwindcss"),
    },
  },
};

export default nextConfig;
