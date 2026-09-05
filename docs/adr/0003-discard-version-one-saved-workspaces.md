---
status: accepted
---

# Discard version-1 Saved workspaces

The redesigned Application keeps `my-next-filing:workspace`, writes an otherwise unchanged schema-version-2 envelope, and deletes encountered version-1 workspaces with verified removal and one temporary notice per document. The current user base does not justify migration complexity, so this accepted decision intentionally provides no migration, backup, or recovery. A verified remaining legacy value stays untouched; an unreadable post-removal outcome is reported as unverified without claiming preservation, and both outcomes block workspace writes, preserve in-memory work, and offer inspection retry.
