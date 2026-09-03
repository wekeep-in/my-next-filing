# On-device persistence privacy and security research

Reviewed 2 September 2026 against repository commit `faae3be56b924754aa9a18b2dad0076f46952037`.

## Answer

Use `localStorage` for the first saved workspace, provided the product first resolves its Google Analytics boundary. The data is small and read as a unit. `sessionStorage` cannot support a later visit, while IndexedDB adds asynchronous database and migration machinery that this scope does not yet need.

Store one versioned, namespaced JSON envelope containing only the user's Profile inputs and Completion records. Never store calculated results, display strings, rule copies, names, bank details, government identifiers, client details, free text, or Analytics identifiers. Validate the envelope as untrusted input before using any value. Re-run evaluation with the current valid Rules after restore.

Saving must be an explicit, optional action. The interface must explain what will be stored, that anyone using the same browser profile may see it, and that there is no account, sync, backup, or recovery. It must offer an equally usable path without saving and a nearby control that deletes the saved filing data.

The present Analytics setup is not technically isolated from future saved data. Production downloads `gtag.js` and executes it in the application page. Cross-origin scripts loaded through `script.src` run in the current page's context and can do what first-party application code can do, including reading origin storage. Moving Profile data from `localStorage` to IndexedDB would not change that trust boundary. Before persistence ships, either remove remote third-party JavaScript from the storage origin, put the saved workspace on an origin where it never runs, or accept and accurately disclose that third-party execution risk. A route allowlist alone is insufficient because the Google tag remains loaded as the user moves between routes in the same single-page application. [MDN documents the privilege of a fetched script](https://developer.mozilla.org/en-US/docs/Web/API/HTMLScriptElement/src#security_considerations), and web.dev gives the same warning for third-party scripts and bundled dependencies in its [third-party privacy guidance](https://web.dev/learn/privacy/third-parties/#executing-cross-site-javascript).

This is product and engineering research, not a legal opinion. The India-law applicability questions listed below need counsel before public release.

## What the repository does today

- [`src/current-check.ts`](../../../src/current-check.ts) holds the Profile only in a module variable. A reload loses it. Repository source has no application use of `localStorage`, `sessionStorage`, IndexedDB, cookies, a service worker, or a storage binding.
- [`src/analytics.ts`](../../../src/analytics.ts) loads `https://www.googletagmanager.com/gtag/js` on any production visit to `/`, `/check`, or `/plan`. It sends manual events with fixed titles and route-only locations. It disables Google Signals and advertising-personalization signals, but does not configure Analytics consent mode. Google says GA4 tags use first-party `_ga` and `_ga_<container-id>` cookies by default and can transmit measurements even without cookies. [Google's GA4 cookie reference](https://support.google.com/analytics/answer/11397207) and [consent-mode reference](https://developers.google.com/tag-platform/security/concepts/consent-mode) describe that behavior.
- [`src/routes/landing.tsx`](../../../src/routes/landing.tsx) bundles `@mux/mux-player-react`, serves the video, poster, and captions from the application origin, and sets `disableTracking`, `noMutedPref`, and `noVolumePref`. Its Media Chrome 4.19.2 dependency can still read and write the same-origin key `media-chrome-pref-subtitles-lang` when captions are selected. See the dependency's tagged [read path](https://github.com/muxinc/media-chrome/blob/v4.19.2/src/js/media-store/util.ts#L28-L36) and [write path](https://github.com/muxinc/media-chrome/blob/v4.19.2/src/js/media-store/request-map.ts#L148-L155). Deleting filing data must therefore call `removeItem` for the application's own key, never `localStorage.clear()`.
- [`public/_headers`](../../../public/_headers) sets only the HLS MIME type. It has no Content Security Policy or other security headers that constrain script or network destinations. A CSP can reduce injection and exfiltration paths, but it cannot sandbox a remote script that the policy allows to run.
- The production hostname is a dedicated HTTPS origin, `mynextfiling.wekeep.in`. Keep saved data on that exact origin. Web Storage has no path isolation, so every application later hosted on that scheme, host, and port would share access. The HTML Standard describes [origin-wide storage and the lack of path restriction](https://html.spec.whatwg.org/multipage/webstorage.html#security-storage).

The current statement that application code never passes questionnaire values to Analytics is supported by the implementation. The stronger FAQ sentence that Analytics "never receives" those values is a promise, not an enforced boundary, once valuable data persists in storage beside remotely supplied JavaScript.

## Browser storage choice

| Choice | Fit | Relevant behavior |
| --- | --- | --- |
| `sessionStorage` | Reject | It is scoped to an origin and tab session, and private or ordinary tab closure ends the required revisit behavior. |
| `localStorage` | Use for this phase | It is widely supported, origin-scoped, synchronous, string-only, and normally survives browser restarts. A Profile plus Completion records is far below its usual 5 MiB per-origin allowance. |
| IndexedDB | Defer | It supports structured values, asynchronous access, version upgrades, and transactions. Use it when the product needs many independently updated records, concurrent transactional changes, documents, or enough data that synchronous serialization is measurable. |
| Cookies | Reject | Browsers attach cookies to HTTP requests. Sending Profile data with static-asset requests would violate the product boundary and serves no client-only need. |

MDN's [Web Storage guide](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API#concepts_and_usage) describes origin and session scope, synchronous access, and private-browsing behavior. Its [quota and eviction guide](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria) documents the Web Storage limit, `QuotaExceededError`, best-effort eviction, and user-initiated clearing. IndexedDB provides transactions and an `onupgradeneeded` version mechanism, but even a completed transaction has a small power-loss window in common implementations. [MDN's IndexedDB guide](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB#creating_or_updating_the_version_of_the_database) records those trade-offs.

The first implementation should use a stable key such as `mynextfiling.workspace`, with a numeric `schemaVersion` inside the value. One whole-envelope `setItem` avoids a partially updated set of keys. The HTML Standard makes one `setItem` either throw before storing or replace its value, but it does not provide a transaction spanning reads and writes across tabs. [The Storage method algorithms](https://html.spec.whatwg.org/multipage/webstorage.html#the-storage-interface) and the standard's [shared-state warning](https://html.spec.whatwg.org/multipage/webstorage.html#the-localstorage-attribute) are the relevant limits.

Completion changes are rare and user-declared, so localStorage's cross-tab limit is tolerable only if the implementation listens for the `storage` event and refreshes or blocks a stale editor before its next write. If the product requires concurrent tabs to merge independent changes without any lost update, choose IndexedDB instead.

Do not request `navigator.storage.persist()` in the first release. It may reduce automatic eviction, but it is not a backup, does not defeat private-browsing cleanup, and does not stop users from clearing site data. The product should not imply stronger durability than it has.

## Consent and data minimisation

The save control should start off. Do not persist partial answers, example data, or the current in-memory Profile before the user chooses it. At that point, show a short standalone notice that lists:

- Profile inputs, including money values, location, scope answers, and tax-year identity;
- Completion records, including the obligation, period, date marked complete, and the fact that completion is only the user's declaration;
- the sole purpose, restoring the user's current and archived filing workspace in this browser;
- the same-browser visibility, loss, shared-device, and no-recovery limits;
- how to continue without saving and how to delete saved filing data;
- a contact for privacy questions.

Do not bundle storage consent with Analytics consent or make one conditional on the other. Store no Analytics client ID, campaign value, page history, device information, or storage-derived event. Keep Analytics code unable to import or call persistence code. "Saved," "saving on," and similar success states may appear only after a storage write succeeds.

The forthcoming DPDP framework supports this conservative shape. The Act defines processing to include storage and defines a Data Fiduciary as a person who determines its purpose and means. It requires clear, specific, informed consent limited to necessary personal data, comparable ease of withdrawal, reasonable safeguards, and erasure when consent is withdrawn or the purpose ends. [Digital Personal Data Protection Act, 2023, sections 2 and 4 to 8](https://www.meity.gov.in/static/uploads/2024/02/Digital-Personal-Data-Protection-Act-2023.pdf). Rule 3 will require a standalone, plain-language notice with an itemised data description, purpose, and paths to withdraw consent, exercise rights, and complain. [Digital Personal Data Protection Rules, 2025, rule 3](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf#page=24).

## Current Indian legal position and open questions

As of the review date, the DPDP Act's definitions and Board provisions are in force, but its substantive processing, consent, security, erasure, and rights provisions in sections 3 to 17 are scheduled for 13 May 2027. Most matching Rules, including Rules 3 and 5 to 16, start on the same date. The Government's [commencement notification, G.S.R. 843(E)](https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf) and [Rules notification, G.S.R. 846(E)](https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf#page=24) set the phased dates.

Until section 44(2) takes effect with those substantive provisions, section 43A of the Information Technology Act and the 2011 SPDI Rules remain relevant. The Rules classify bank-account and payment-instrument details as sensitive personal data, require a published privacy policy, purpose limitation, prior consent and opt-out for covered collection, limited retention, correction, and security. [India Code's official copy of G.S.R. 313(E)](https://upload.indiacode.nic.in/showfile?actid=AC_CEN_45_76_00001_200021_1517807324077&filename=GSR313E_10511%281%29_0.pdf&type=rule). A 2011 MeitY clarification says electronic communication can supply the consent and that the Rules apply to a body corporate or person located in India. [Press Information Bureau clarification](https://www.pib.gov.in/newsite/erelcontent.aspx?lang=2&reg=48&relid=74990).

Two applicability questions remain genuinely uncertain here:

1. The Profile contains receipts, profit, interest, tax paid, and tax withheld, but no bank account or payment-instrument identifier. Counsel should decide whether these values fall within the 2011 Rules' "financial information" category.
2. The application author chooses the code and purpose, but the Profile stays in a browser that the user controls and is not intentionally available to the operator. Counsel should decide when that local processing is in the operator's possession or control under current law and whether it makes the operator a Data Fiduciary once the DPDP substantive provisions start.

These questions do not justify weaker product protection. Treat the Profile and Completion records as personal data. Do not claim legal compliance until counsel has reviewed the implemented flow, privacy text, Analytics setup, and release date. A purely local consent record may also be insufficient by itself if the operator must later prove that a particular user received notice and consented under DPDP section 6(10).

## Retention, deletion, and recovery

`localStorage` has no application-level expiration. The browser treats it as best-effort site data unless stronger persistence is granted. It may disappear when the user clears site data, storage pressure causes eviction, the browser profile is reset, or a private session ends. The app cannot promise a backup or restore it on another browser or device. The platform also does not promise what an operating-system or browser-profile backup may copy, so the interface should not claim that no copy can exist elsewhere.

The product needs an explicit retention rule. Archived tax years are an ongoing user-selected purpose, but "forever unless deleted" should not be an accidental consequence of using `localStorage`. Record enough local metadata to enforce the chosen rule, and do not retain a Profile merely because a Completion record exists. Legal retention duties imposed on the freelancer do not automatically require My Next Filing to keep its convenience copy.

Deletion must:

- remove only the namespaced workspace key;
- clear the current in-memory Profile and Completion records in the deleting tab;
- notify or react in other open same-origin tabs through the `storage` event;
- return the application to the unsaved state and confirm that result only after `removeItem` succeeds;
- leave unrelated site data, such as the media preference and Analytics cookies, alone unless the control is explicitly labelled as clearing all site data.

The claim should be "Removed My Next Filing's saved profile and completion records from this browser." Do not say "securely erased" or "deleted everywhere." The HTML Standard tells browsers to delete persistent storage promptly, but the application cannot inspect flash remnants, browser backups, other devices, data already sent to Analytics, or a value still present in another tab's memory. [HTML Standard, sensitivity of persistent data](https://html.spec.whatwg.org/multipage/webstorage.html#sensitivity-of-data).

Without export or cloud sync, there is no application backup. If the roadmap describes archived Completion records as dependable records rather than a convenience, it needs a user-controlled export and restore decision. A plain JSON export would move financial data outside browser protections, so it should not appear by default without a clear warning and an import validator.

## Corruption and migration rules

Browser storage is not trusted input. A user, extension, XSS flaw, old release, or interrupted migration can alter it. OWASP specifically warns that XSS can read or corrupt client storage and that local machine access defeats any authorization assumed by the application. [OWASP HTML5 Security Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage).

On every load:

1. Catch `SecurityError`, malformed JSON, unsupported `schemaVersion`, missing fields, extra fields, invalid dates, unexpected obligation IDs, non-finite or negative money values, and values outside existing Profile limits.
2. If no valid saved envelope exists, keep the calculator usable in memory. If a value exists but is invalid, do not silently overwrite it or feed any part into evaluation. Show a saved-data error with a deliberate delete-and-start-again action.
3. Migrate only known older versions through explicit, ordered functions. Validate the migration output before replacing the stored value. Leave the original untouched if migration or the replacement write fails.
4. Reject a newer unknown schema instead of guessing. This can happen after a user opens the workspace in an older deployed build or browser tab.
5. Keep storage schema version separate from tax period and Rules version. Stored user inputs survive a rules update only after current Profile validation. Stored calculations never survive it.
6. Catch `QuotaExceededError` and other write failures. Keep the current work in memory, tell the user that it was not saved, and never display a saved state optimistically.

One focused automated check should cover malformed data, an unsupported version, a known migration, a failed write, deletion, and the rule that an invalid restore never reaches evaluation.

## Shared-device and application security constraints

On-device storage is not access control. Anyone who can use the same unlocked browser profile can open the site and see the workspace. Developer tools, privileged extensions, malware, XSS, and every trusted or compromised dependency executing in the page are also relevant. IndexedDB has the same page-script problem. HTTPS protects data in transit but does not make local storage confidential from those actors.

For this phase:

- warn before opt-in: "Do not save on a shared or public browser";
- keep direct identifiers, government IDs, bank details, client details, invoices, and free text out of the schema;
- do not add cosmetic PIN or hard-coded-key encryption. Either offers a false security claim because page code can recover the key;
- treat a user-supplied encryption passphrase as a separate product with password entry, loss, migration, and recovery consequences;
- ship a restrictive Content Security Policy and related headers after the Analytics-origin decision, audit dependencies on upgrade, and keep all non-Analytics assets self-hosted;
- render restored values as data through React. Never put them into HTML, URLs, titles, logs, error reporting, external links, or dynamically selected network destinations.

The safest implementation language is precise and modest:

> Save this profile and the filing completions you mark in this browser. Anyone using this browser profile may be able to see them. There is no account, sync, backup, or recovery. Private browsing or clearing site data may remove them.

After the Analytics execution issue is resolved, the privacy notice may add:

> My Next Filing does not upload these saved values or include them in Analytics.

Keep the established Completion record caveat wherever status appears:

> Marked complete by you. My Next Filing has not verified government acceptance.

Avoid "private," "anonymous," "encrypted," "permanent," "only you can access it," "never leaves this device," "securely erased," and "DPDP compliant."

## Decisions now sharp enough for Wayfinder tickets

1. **Choose the Analytics isolation boundary for saved filing data.** Decide among removing remote Analytics JavaScript, serving the saved workspace from a separate origin without it, or accepting and disclosing remote-script access. This blocks an enforceable "Analytics never receives saved values" promise and the final CSP.
2. **Set the saved-workspace retention and recovery contract.** Choose how long active and archived tax years remain, whether inactivity expires them, whether users can delete one year or everything, and whether a local export and restore is required because browser storage is not a backup.
3. **Choose the shared-browser confidentiality boundary.** Decide whether an opt-in warning and data minimisation are sufficient for the target audience or whether a user-held passphrase is required. Do not substitute a cosmetic PIN.
4. **Obtain an India privacy applicability review.** Ask counsel to settle the SPDI classification of income and tax values, possession or control of browser-only processing, the DPDP Data Fiduciary analysis, proof of consent, and breach or grievance duties for a service with no account or user contact channel.
