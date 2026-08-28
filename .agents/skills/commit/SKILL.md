---
name: commit
description: Format a conventional commit for My Next Filing. Use when creating a git commit in this repository.
---

# Commit

Use a conventional commit:

```
<type>(<scope>): <description>
```

Use `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`, or `style`. A scope is optional. When it helps, use `app`, `rules`, `sources`, `docs`, or `tooling`.

Start the description with a lowercase imperative verb. Keep it under 72 characters and omit the final period. Use a body only when the change needs context.

Stage only the paths that belong to the commit. Keep unrelated work in separate commits. Add `Closes #NN` when a local or hosted issue identifies the work.
