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
        statements: 50,
        branches: 50,
        functions: 50,
        lines: 50
      }
    }
  },
  assetsInclude: [
    '**/*.dcm',
    '**/DICOMDIR',
    '**/*.zip',
  ],
});
