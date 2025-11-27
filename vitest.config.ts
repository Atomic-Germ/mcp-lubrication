import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // For better Copilot model support
    include: ['test/**/*.ts'],
    globals: true,
    environment: 'node',
    reporters: ['default', 'json'],
    printConsoleTrace: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'test/', 'docs/'],
    },
  },
});
