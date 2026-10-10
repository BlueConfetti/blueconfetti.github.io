# BlueConfetti website

Public business website, privacy policy, support information, and Confluence app documentation. This repository contains only public website content. App source lives in separate private repositories.

Generate the static pages with `bun build.mjs`. GitHub Pages publishes the root of `main`. There are no third-party scripts, fonts, analytics, cookies, forms, or build dependencies.

Flint is the product family and BlueConfetti the publisher; the header keeps the BlueConfetti mark and the home page presents the Flint apps. The Table Glide guide, demo, and listing links keep the name Table Glide while its Marketplace submission is under review, because the deployed macro is still titled Table Glide and the guide must match it. Rename those pages to Flint Table Filter only when the rename ships. `markdown-export/` documents Flint Markdown Export, which is in development. `assets/flint.svg` is the Flint app icon. `table-filter/demo/` is an interactive demo: `assets/table-demo.js` builds a sample table and runs it through `assets/table.mjs`, a verbatim copy of `src/frontend/table.mjs` from the private `table-filter-lite` repo. Copy it again whenever the app's table logic changes, so the demo behaves like the app. Contact aliases were verified in Google Workspace before publication.
