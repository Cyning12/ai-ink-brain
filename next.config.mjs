import path from "path";
import { fileURLToPath } from "url";

/** 配置文件所在目录 = 仓库根目录（避免 Turbopack 误判到 Desktop/Projects） */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = __dirname;

/** @type {import('next').NextConfig} */
const nextConfig = {
  /** 生产 gzip（Next 默认开启，显式写出便于团队对齐） */
  compress: true,
  /** 缩短构建时间与产物体积；需要线上 source map 时再改为 true */
  productionBrowserSourceMaps: false,
  /**
   * 减小 Serverless trace 体积：不跳过类型检查/ESLint，仅减少打包追踪范围。
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/output
   */
  outputFileTracingExcludes: {
    "*": [
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
    ],
  },
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
