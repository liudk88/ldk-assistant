import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'intent/index': 'src/intent/index.ts',
    'phone/index': 'src/phone/index.ts',
    'voice-input/index': 'src/voice-input/index.ts',
  },
  format: ['esm'],
  target: 'node22',
  outDir: 'dist',
  clean: true,
  dts: false,
  sourcemap: true,
  // ws 是外部依赖，不打包进来
  external: ['ws'],
  // 打包完成后复制静态资源
  onSuccess: 'mkdir -p dist/phone/static && cp src/phone/static/index.html dist/phone/static/',
});
