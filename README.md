# BlueConfetti website

Public website for BlueConfetti’s Atlassian Cloud app portfolio, with product pages, interactive demos, practical guides, support information and policies. This repository contains only public website content. App source lives in separate private repositories.

Generate the static pages with `bun build.mjs`. GitHub Pages publishes the root of `main`. There are no third-party scripts, fonts, analytics, cookies, or build dependencies. Demo controls do not submit visitor data; the Markdown sample uses only static same-origin files.

Flint is the product family and BlueConfetti the publisher. Keep the homepage broad enough for the Atlassian Cloud portfolio. Product pages describe the currently public apps and link to their Marketplace listings. Preserve established product URLs. Change product claims only when the described version is released; a local development candidate does not establish public availability. Publishing this website does not deploy an app or publish a Marketplace listing.

## Page sources and search metadata

Edit `build.mjs` for the homepage, Flint Table Filter pages, shared navigation and page renderer. `content/markdown-export.mjs` owns the Markdown Export pages and privacy section; `content/seo-guides.mjs` owns the guides index and task walkthroughs. Update source modules, then run `bun build.mjs` and commit the generated HTML, `sitemap.xml` and `robots.txt` together with the source changes.

The renderer adds a page title, description, absolute directory canonical, Open Graph and Twitter metadata to every page. `siteUrl` is the canonical origin. The homepage includes factual Organization JSON-LD. Social previews live in `assets/social/` as editable 1200 × 630 SVGs and matching PNGs; the build prefers PNGs when present. Regenerate a PNG whenever its SVG changes. Guide pages can choose a product preview with `ogImage`; other pages use their product or the BlueConfetti preview.

The sitemap includes the homepage, current product pages, demos, guides and support. Legal and dated policy documents remain accessible and receive their own canonicals, but are omitted from the sitemap. No page is blocked from indexing. Before publishing, check internal links and anchors, metadata, preview files, and desktop and narrow layouts.

The root `google90aa970f484d11ca.html` file verifies this GitHub Pages origin in Google Search Console. Keep the public verification file when rebuilding or reorganizing the site.

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

## Flint Table Filter demo

`assets/table-demo.js` builds a sample table and runs it through `assets/table.mjs`, a verbatim copy of `src/frontend/table.mjs` from the private `table-filter-lite` repository. Copy it only from the app version currently published to customers, so the demo and guide describe the same behavior. The current public version uses 50-row pagination and dropdown filters for repeated values in columns with no more than 50 distinct values. Pending development changes must not appear here before release.

Contact aliases were verified in Google Workspace before publication.
