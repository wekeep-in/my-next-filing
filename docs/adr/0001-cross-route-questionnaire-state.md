---
status: accepted
---

# Keep questionnaire state in a cross-route reducer

The Application keeps transient questionnaire state in one reducer above `/check/*` and `/plan`, with null for no active session and tagged editing or complete states. Intent events own every cascading Draft change; errors are derived, inactive branch values are cleared, and the URL owns the visible group. `AppFrame` retains an in-memory return snapshot during examples so storage failures cannot lose personal answers; Evaluation, persistence, routing, and browser or visual effects remain outside the reducer.
