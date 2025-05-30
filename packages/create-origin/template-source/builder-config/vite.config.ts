const _default = `
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
<%- builderConfig.frameImport %>

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    <%= builderConfig.pluginUseCode %><%= builderConfig.pluginNeedCall ? '()' : '' %>,
  ],
  // 设置路径别名
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
`.trimStart();

export default {
  default: _default,
};
