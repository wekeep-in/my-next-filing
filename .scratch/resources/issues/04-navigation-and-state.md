# Integrate resources without changing journey state

Status: implemented and verified locally. The real-shell browser checks cover personal/example/workspace preservation, history, failed storage writes and failed screen imports; see [verification](../verification.md).

## Result

Resources is reachable from the landing and every plan state. Public entry works without accessing saved answers, and internal browsing preserves the visitor's current personal/example/workspace state.

## Work

1. Register `/resources` under the existing AppFrame. Keep resources out of the numbered questionnaire and fixed mobile actions.
2. Own one temporary query/Topic/Task state object in AppFrame and expose it through AppOutletContext. It survives internal navigation and is never persisted.
3. Implement the five bounded AppFrame changes in the plan's [routing section](../implementation-plan.md#routing-session-preservation-and-privacy): recognize resources with the router's matcher and retain example mode; skip fresh initialization; skip example reconciliation; delay storage-listener attachment; and render the resources outlet independently. Existing route-owned example banners already unmount on resources. Reserve the shared notice height on reference pages so retained failure notices cannot obscure navigation.
4. Leave useRecoveryLifecycle and codecs unchanged. Preserve pending writes, recoverability, and legitimate storage-event handling after normal initialization.
5. Add plain resource Links in the landing hero and plan-main outside renderPlan. Avoid the mobile-hidden journey-note.
6. Use plain return Links. Preserve the fixed synthetic example flag only when returning to an existing example route; keep the resources URL generic. Do not call actions that reset/select sessions merely to navigate.
7. Add a small `scripts/verify-resources-browser.tsx` mounted/browser-console check following existing repository scripts, so the actual shell effects are exercised, not just copied predicates.

## Acceptance

- Fresh resources visits do not attempt storage reads, writes, migrations, recovery cleanup, or legacy deletion, including after a storage event. Denied storage does not prevent browsing.
- Leaving fresh resources for the normal app performs the existing initialization once and before synchronization.
- Personal answers, edited examples, personal return sessions, and workspace selection survive resource round trips and Back/Forward.
- Typing/search/filter changes create no additional persistence writes or evaluation calls.
- Internal navigation retains browse controls; reload resets only their temporary values and does not delete stored answers.
- The generic resources page does not display the fictional-example banner as if its official documents were fictional.
- Search text and filters never enter URL, title, logs, storage, history payload, clipboard, requests, or external links.
- Landing and plan links remain visible on mobile and in unavailable result states.

Performance verification also required on-demand loading of landing, questionnaire and Plan modules. The loader resolves failed imports to a recoverable screen inside AppFrame; a rejected module must not remove the route outlet or discard unsaved answers. The browser script includes a separate failure check for an intentionally blocked landing-module request.

Verification: run the mounted/browser-console check with isolated synthetic storage, plus the normal deterministic tests. Record its actual execution separately from `pnpm test`.
