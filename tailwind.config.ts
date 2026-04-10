import type { Config } from "tailwindcss";

/**
 * v4：由 app/globals.css 中 @config 引用。
 * content 覆盖 App Router 与 components，满足 class 扫描。
 */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
} satisfies Config;
