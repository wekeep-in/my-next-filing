# Playwright capture options

Researched 11 September 2026 for a short signed-out search-to-guide recording. These are capture-tool options, not application dependencies. Open-source status does not itself determine whether a browser session will be challenged.

| Option | Playwright fit | Mechanism and tradeoff |
| --- | --- | --- |
| Stock Playwright with full Chromium or Chrome | Native API; lowest integration cost | `channel: 'chromium'` uses the newer headless implementation; headed Chrome is also supported. More representative browser rendering, but not an anti-detection guarantee. |
| Patchright for Node.js | Playwright-compatible replacement | Patches driver-level automation signals, including Runtime/Console behavior and launch flags. Chromium only; console events and some Playwright contracts differ. Best candidate for an isolated capture experiment. |
| `playwright-extra` plus `puppeteer-extra-plugin-stealth` | Wrapper around Playwright; familiar locators and recording | Applies JavaScript/browser fingerprint evasions through the plugin system. Chromium-oriented stealth plugin. Adds compatibility surface; public detector success does not establish Google success. |
| Rebrowser Playwright / patches | Replacement package or patches to Playwright | Targets automation leaks with configurable patches. Upstream explicitly describes source patching as fragile across versions. Avoid patching this repository's test installation in place. |
| Python `playwright-stealth` | Native to Playwright Python, not this TypeScript recorder | Extra Python runtime and separate capture implementation; little benefit for this repository. |

Recommendation: start with stock full Chromium, then try Patchright in a temporary installation with the existing browser binary. Keep ordinary Playwright for the local app, tests and deterministic recording. Use a fresh dedicated browser context, stable viewport, natural reading holds and visible clicks. Do not mix stealth packages without evidence; patches can conflict. Browser changes cannot guarantee success when a network is challenged.

Sources:

- [Playwright browser channels and headless modes](https://playwright.dev/docs/browsers)
- [Playwright persistent contexts and browser launch API](https://playwright.dev/docs/api/class-browsertype)
- [Patchright driver patches, limitations and compatibility](https://github.com/Kaliiiiiiiiii-Vinyzu/patchright)
- [Playwright Extra integration](https://github.com/berstend/puppeteer-extra/tree/master/packages/playwright-extra)
- [Stealth plugin and its stated detection limitations](https://github.com/berstend/puppeteer-extra/blob/master/packages/puppeteer-extra-plugin-stealth/readme.md)
- [Rebrowser patches and replacement packages](https://github.com/rebrowser/rebrowser-patches)
- [Python Playwright Stealth](https://github.com/Granitosaurus/playwright-stealth)

Local observations:

- Stock headless-shell Chromium: Google returned an unusual-traffic challenge.
- Stock full Chromium (`channel: 'chromium'`), homepage → search box → results: same challenge.
- The official Income Tax challan guide loaded successfully in stock Playwright.

A challenge page is not usable footage. If a capture experiment fails, keep that result visible in this document and do not publish it as result footage.
- Patchright 1.63.0 in a temporary installation, full installed Chromium, typed homepage search: Google still returned the unusual-traffic challenge. No result screenshots were retained. This demonstrates that swapping the driver alone did not solve this capture environment.

- Successful follow-up: Patchright 1.63.0 with full Chromium in **headed mode**, a fresh signed-out context and `en-IN` locale loaded real Google results. The subsequent recorder completed three queries and clicked the official guide, producing `comparison/search.webm`. This is the configuration used by the revised video; success on this run is not a general detection guarantee.

- Revised capture: ordinary queries without search operators, a general freelancer-tax article, a bank-specific tax-payment page, two returns to Google, and the official guide click. A real location prompt is dismissed with “Not now”; cookie preferences use “Allow Necessary”. The mouse path and click times are saved for the original Remotion cursor overlay. Headed retries can still encounter a challenge; failed runs do not replace published footage.

- The current cut replaces the bank-payment detour with “freelancer tax filing deadline” and a real Xflow ITR-filing article. The annotation identifies the topic as return-filing advice; it does not claim the article is inaccurate. This shows uncertainty about which obligation to research, without skipping an obvious payment result.
