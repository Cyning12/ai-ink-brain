import path from "path";
import { fileURLToPath } from "url";

/** 配置文件所在目录 = 仓库根；勿在配置里 import @tailwindcss/postcss，否则 Turbopack 会打包 native 依赖导致构建失败 */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const postcssConfig = {
  plugins: {
    "@tailwindcss/postcss": {
      base: __dirname,
    },
  },
};

export default postcssConfig;
