# BlueConfetti website

Public business website, privacy policy, support information, and Confluence app documentation. This repository contains only public website content. App source lives in separate private repositories.

Generate the static pages with `bun build.mjs`. GitHub Pages publishes the root of `main`. There are no third-party scripts, fonts, analytics, cookies, or build dependencies. Demo controls do not submit visitor data; the Markdown sample uses only static same-origin files.

Flint is the product family and BlueConfetti the publisher. The Table Glide guide, demo and listing links keep the name Table Glide while its Marketplace submission is under review, because the deployed macro still uses that name. Rename those pages to Flint Table Filter only when the rename ships. Flint Markdown Export is submitted for Marketplace review. Public pages describe the apps without pre-release availability notices; publishing this website does not approve or publish a Marketplace listing.

## Markdown Export guide and demo

`content/markdown-export.mjs` supplies the guide, demo introduction and Markdown Export privacy section. `build.mjs` generates the pages and combines that privacy section with the other app/website disclosures. Keep limits, processing, storage and retention synchronized with the private app's current source.

The demo follows the selection workspace: search and select fictional handbook pages, choose one of four presets, opt into other attachments, inspect source/rendered/Markdown views, review the selection, browse the prepared files and download the matching ZIP. It cannot access Confluence, run background jobs, save profiles/history, or accept private content. Errors offer retry; unavailable data is not presented as a successful export.

Generate the sample artifacts from the private `markdown-export` repository:

```sh
node scripts/build-site-demo.mjs /path/to/blueconfetti.github.io/markdown-export/demo
```

Then run `bun build.mjs` here. The generator runs the actual exporter and sanitized preview renderer over fictional content. It produces 248 variants: 31 nonempty page selections, four presets and two attachment modes. Each variant contains a ZIP and its text/rendered-output JSON; `sample.json` is the catalog. `assets/md-demo.js` selects and displays those outputs. No converter code or application source is published. `sample/` retains the extracted complete Standard Markdown export for direct inspection. The older dated ZIP is retained for existing links.

The sample covers hierarchy, completed tasks, code, an SVG image, a text attachment, a merged-cell table and links. Release checklist deliberately contains an unsupported JQL macro; exports containing it show a warning. Site downloads are small fixtures, not performance or maximum-capacity demonstrations. `assets/flint-markdown-export.svg` is the original approved product icon.

When updating the demo, check exact selected IDs and options in downloaded manifests, link/path validity, source/ZIP identity, warnings, keyboard focus and modal behavior, error/loading recovery, and narrow/desktop layouts. A local HTTP server is needed for static JSON requests. Do not publish local screenshots, evidence records, private code, credentials or real customer content.

## Table Glide demo

`assets/table-demo.js` builds a sample table and runs it through `assets/table.mjs`, a verbatim copy of `src/frontend/table.mjs` from the private `table-filter-lite` repository. Copy it again whenever that app's table logic changes, so the demo behaves like the app.

Contact aliases were verified in Google Workspace before publication.
