# BlueConfetti website

Public business website, privacy policy, support information, and Confluence app documentation. This repository contains only public website content. App source lives in separate private repositories.

Generate the static pages with `bun build.mjs`. GitHub Pages publishes the root of `main`. There are no third-party scripts, fonts, analytics, cookies, forms, or build dependencies.

The app display name is Table Glide. `table-filter/demo/` is an interactive demo: `assets/table-demo.js` builds a sample table and runs it through `assets/table.mjs`, a verbatim copy of `src/frontend/table.mjs` from the private `table-filter-lite` repo. Copy it again whenever the app's table logic changes, so the demo behaves like the app. Contact aliases were verified in Google Workspace before publication.
