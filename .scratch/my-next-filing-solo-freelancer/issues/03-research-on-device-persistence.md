# Research privacy and security for on-device persistence

Type: research
Status: resolved
Blocked by: none
Research branch: `research/on-device-persistence`

## Question

Against current browser-platform documentation, the application's actual third-party scripts, and current official Indian privacy sources, what privacy and security constraints must govern opt-in on-device storage of a Profile and Completion records? Compare the smallest viable browser storage choices, access by same-origin and third-party code, retention, consent, deletion, corruption, version migration, private browsing, shared-device risks, backup behavior, Analytics separation, and the claims the interface may safely make. Write the findings to `../research/on-device-persistence.md` with primary-source citations.

## Answer

[On-device persistence privacy and security research](../research/on-device-persistence.md) recommends one namespaced, versioned `localStorage` envelope for the small Profile and Completion record set. Saving must be explicit and optional. Restore must validate stored data as untrusted input, reject unknown versions, migrate only known versions, and re-run Evaluation with current valid Rules. A write failure leaves the current work in memory and must never display a false saved state.

The interface must warn that anyone using the same browser profile may see the data and that there is no account, sync, backup, or recovery. Deletion removes only the filing-workspace key, clears in-memory state, coordinates other tabs, and avoids claims such as securely erased or deleted everywhere. Keep names, identifiers, bank or client details, free text, calculated results, rule copies, and Analytics identifiers out of storage.

The current remote Google Analytics script executes with first-party page privileges and can technically read origin storage. IndexedDB would not change that trust boundary. The product must settle Analytics isolation and a restrictive Content Security Policy before saving financial data. Current SPDI and future DPDP applicability to browser-only income and tax values requires qualified Indian privacy review before public release.
