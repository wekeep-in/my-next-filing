// Lighthouse CI loads configuration through CommonJS.
// oxlint-disable import/no-commonjs
// oxlint-disable-next-line typescript/no-unsafe-call -- LHCI requires a CommonJS config outside the TypeScript project.
const { chromium } = require('@playwright/test')

module.exports = {
  ci: {
    collect: {
      staticDistDir: 'dist',
      isSinglePageApplication: true,
      url: [
        'http://localhost/',
        'http://localhost/check/tax-year',
        'http://localhost/resources',
      ],
      numberOfRuns: 3,
      settings: {
        formFactor: 'mobile',
        onlyCategories: ['performance', 'accessibility'],
      },
      chromePath: chromium.executablePath(),
    },
    assert: {
      assertions: {
        'categories:performance': [
          'error',
          {
            minScore: 0.9,
            aggregationMethod: 'median',
          },
        ],
        'categories:accessibility': [
          'error',
          {
            minScore: 1,
            aggregationMethod: 'pessimistic',
          },
        ],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: 'artifacts/lighthouse',
    },
  },
}
