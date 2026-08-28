# Choose the application and module organization

Type: grilling
Status: resolved
Blocked by: none

## Question

Within the fixed React, TypeScript, Vite, React Router, Tailwind CSS, shadcn/ui, and Cloudflare stack, what is the smallest route and module organization that keeps evaluation pure, legal logic behind the agreed evaluation and rule-validation seams, browser storage replaceable, Analytics isolated, and rule and source maintenance local? Treat the resolved official-shadcn-first component policy as a constraint; decide whether the Questionnaire dependency and optional prose-only Typeset CSS earn their place. Decide only the minor organization that `SPEC.md` delegates to this wayfinder.

## Answer

Use this seam-first tree:

```text
src/
  routes/               # one flat file per public route; route-local UI stays here
  evaluation/index.ts   # evaluate and Evaluation-owned interface types
  rules/index.ts        # validation, current rules, source registry, and Rules-owned types
  components/ui/        # official shadcn components
  app.tsx
  saved-profile.ts
  analytics.ts
```

Evaluation is one deep, pure in-process module. Its public interface accepts a validated Profile, a current date, and a validated Rule dataset, and returns one Evaluation result. It owns `EvaluationResult` and related interface types. Rules owns `RuleDataset`, its validator, the current TypeScript dataset, and the read-only Source registry. Author the dataset and registry as TypeScript objects with `satisfies`; runtime validation still checks dates, duplicate identities, expiry, provenance, and cross-references. Evaluation returns Source identities rather than copied Source metadata.

Use one route file for each public route. `/plan` uses a client-side React Router loader to load the saved Profile, validate current rules, pass the current date into Evaluation, and redirect to `/check` when no Profile exists. The Evaluation module handles India Standard Time status behavior. Keep product UI inside its route until a second route needs it.

`saved-profile.ts` owns browser storage, schema versioning, corrupt-data detection, deletion, update time, and the in-memory fallback. Questionnaire state stays route-local. Do not add React context, a state library, a storage adapter, or URL state. `analytics.ts` remains independent from Evaluation and Profile data.

Use the official shadcn Questionnaire and official Field, Input, Checkbox, Select, Button, Progress, disclosure, and card components before writing an owned equivalent. Keep generated shadcn code in `components/ui/`. Skip Typeset initially; the short prose routes use semantic markup and the shared minor-third tokens. Review and pin a community registry item only when the official registry has no suitable component.

Only Evaluation and Rules expose `index.ts` because they own real seams. Do not add a central `types/` folder, broad barrel files, `services/`, `hooks/`, `utils/`, an interface with one adapter, or a dependency-enforcement plugin.
