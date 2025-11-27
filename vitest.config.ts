import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // For better Copilot model support
    reporters: 'dot',
    include: ['test/**/*.ts'],
    globals: true,
    environment: 'node',
    printConsoleTrace: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'dist/', 'test/', 'docs/'],
    },
  },
});
