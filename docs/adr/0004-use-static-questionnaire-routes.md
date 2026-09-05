---
status: accepted
---

# Use static questionnaire routes

Each questionnaire group has a static `/check/{ProfileGroup}` route, and the URL is the sole owner of the visible group. The Draft remains private reducer state. Route guards permit access through the first incomplete group, while navigation uses push for forward or sidebar moves and replace for corrective redirects and the interface Back control. This gives refresh and browser-history behavior without placing Profile or money values in the URL.
