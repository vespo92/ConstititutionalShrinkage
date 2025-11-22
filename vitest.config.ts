import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'packages/**/tests/**/*.test.ts',
      'tests/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['packages/*/src/**/*.ts'],
      exclude: [
        'packages/*/src/index.ts',
        'packages/*/src/types.ts',
        'packages/*/src/types/**/*.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@constitutional-shrinkage/constitutional-framework': path.resolve(__dirname, 'packages/constitutional-framework/src'),
      '@constitutional-shrinkage/voting-system': path.resolve(__dirname, 'packages/voting-system/src'),
      '@constitutional-shrinkage/business-transparency': path.resolve(__dirname, 'packages/business-transparency/src'),
      '@constitutional-shrinkage/governance-utils': path.resolve(__dirname, 'packages/governance-utils/src'),
      '@constitutional-shrinkage/metrics': path.resolve(__dirname, 'packages/metrics/src'),
      '@constitutional-shrinkage/entity-registry': path.resolve(__dirname, 'packages/entity-registry/src'),
    },
  },
});
