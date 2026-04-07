import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
  },
  format: ['esm'],
  target: 'node22',
  outDir: 'dist',
  clean: true,
  sourcemap: true,
  // core 包通过 workspace 引用，打包时标记为外部
  // 部署时 node_modules 里有 core 的编译产物
  external: ['@ldk-assistant/core', '@ldk-assistant/core/*', 'ws'],
  noExternal: [],
});
