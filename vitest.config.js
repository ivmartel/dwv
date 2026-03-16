import {defineConfig} from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      './tests/**/*.test.js'
    ],
    outputFile: './build/test-results.json',
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text-summary', 'html'],
      exclude: ['tests/**'],
      thresholds: {
        statements: 30,
        branches: 30,
        functions: 30,
        lines: 30
      }
    }
  },
  assetsInclude: [
    '**/*.dcm',
    '**/DICOMDIR',
    '**/*.zip',
  ],
});
