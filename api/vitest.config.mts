import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Resolves the `@/*` alias declared in tsconfig.json. Requires Vite 8.
  resolve: { tsconfigPaths: true },
  test: {
    root: './',
    include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
  },
});
