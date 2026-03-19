import { defineConfig } from 'tsup'

export default defineConfig({
  outDir: 'build',
  entry: ['src/main/index.ts'],
  minify: false,
  splitting: false,
  sourcemap: true,
  clean: true
})
