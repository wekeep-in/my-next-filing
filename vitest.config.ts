import { playwright } from '@vitest/browser-playwright'
import { defineConfig, mergeConfig } from 'vitest/config'
import viteConfig from './vite.config.ts'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      allowOnly: false,
      reporters: ['default', 'junit'],
      outputFile: { junit: 'artifacts/vitest/results.xml' },
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}'],
        exclude: ['src/vite-env.d.ts'],
        reporter: ['text', 'html', 'json-summary'],
        reportsDirectory: 'artifacts/coverage',
      },
      projects: [
        {
          extends: true,
          test: {
            name: 'unit',
            environment: 'node',
            include: ['tests/unit/**/*.test.ts'],
            setupFiles: ['./tests/setup.ts'],
          },
        },
        {
          extends: true,
          test: {
            name: 'browser',
            include: ['tests/browser/**/*.test.tsx'],
            setupFiles: ['./tests/setup.ts', './tests/browser/setup.ts'],
            browser: {
              enabled: true,
              headless: true,
              provider: playwright(),
              instances: [{ browser: 'chromium' }],
              viewport: { width: 1280, height: 800 },
              screenshotDirectory: 'artifacts/vitest/screenshots',
            },
          },
        },
      ],
    },
  }),
)
