// Flint Markdown Export guide collection: an index at /guides/markdown-export/ and task articles.
// Sample downloads live in assets/guides/markdown-export/ and come from the released exporter
// run over fictional pages; shared navigation and the global guides index are owned elsewhere.
const MARKETPLACE = 'https://marketplace.atlassian.com/apps/2342039359/flint-markdown-export-for-confluence';
const PRODUCT = '../../markdown-export/';
const DEMO = '../../markdown-export/demo/';
const SAMPLES = '../../assets/guides/markdown-export';
const STYLES = '<link rel="stylesheet" href="../../assets/guides/markdown-export/guides.css">';

const escapeCode = text => text.replace(/[&<>]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character]);
const pre = (text, label) => `<pre tabindex="0" aria-label="${label}"><code>${escapeCode(text.replace(/^\n|\n$/g, ''))}</code></pre>`;
const table = (label, head, rows, wide = false) => `<div class="guide-table${wide ? ' me-wide' : ''}" tabindex="0" role="region" aria-label="${label}"><table><thead><tr>${head.map(cell => `<th scope="col">${cell}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${cell}</th>` : `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const result = (heading, ...paragraphs) => `<section class="me-result" aria-label="${heading}"><h2>${heading}</h2>${paragraphs.map(text => `<p>${text}</p>`).join('')}</section>`;
const samples = items => `<ul class="me-samples">${items.map(([file, note]) => `<li><a href="${SAMPLES}/${file}" download>${file.split('/').pop()}</a><span>${note}</span></li>`).join('')}</ul>`;
const BOUNDARY = '<p class="me-boundary">Sample files on this page are fictional. They were produced by the released Flint Markdown Export exporter, using a simulated Confluence site instead of a live one. Interface labels come from the released app; this guide contains no app screenshots.</p>';
const related = links => `<aside class="related-guide" aria-label="Related help"><strong>Related help:</strong> <a href="../markdown-export/">All Markdown Export guides</a> · ${links.join(' · ')} · <a href="${MARKETPLACE}">Marketplace listing</a></aside>`;
const page = ({ kind, title, lede, body }) => `${STYLES}<article class="me-guide"><p class="eyebrow">FLINT MARKDOWN EXPORT · ${kind}</p><h1>${title}</h1><p class="lede">${lede}</p>${body}</article>`;
const link = (slug, text) => `<a href="../${slug}/">${text}</a>`;
const ref = (anchor, text) => `<a href="${PRODUCT}#${anchor}">${text}</a>`;

const guides = [
  {
    slug: 'confluence-to-git', group: 'use', card: 'Export a page tree with ID-based paths, review it on a branch, and see exactly what a refresh changes.',
    title: 'How to move Confluence docs into a Git repository',
    heading: 'Move a Confluence documentation tree into a Git repository',
    description: 'Export a Confluence page tree with the Git documentation preset, review the Markdown on a branch, and see exactly what changes after an edit.',
    lede: 'Turn a Confluence page tree into Markdown files you can review, diff and commit like the rest of your documentation.',
    body: () => `${result('Finished result', 'A <code>docs/handbook/</code> folder on a review branch, with one Markdown file per page, page-ID paths, relative links, a local image and a manifest. In the sample, one edit in Confluence changes exactly three files: the edited page, <code>all-pages.md</code> and <code>manifest.json</code>.')}
    <h2>Before you start</h2><ul><li>Flint Markdown Export installed with an active license, and permission to read the pages.</li><li>A Git repository you can commit to, and your team’s usual review process. Flint creates a ZIP; it does not commit, push or open pull requests.</li><li>Git on your computer. The commands below were run with Git 2.54.</li></ul>
    <h2>Example: a five-page engineering handbook</h2><p>The sample uses the same fictional handbook as the <a href="${DEMO}">interactive demo</a>: <strong>Engineering Handbook</strong> (page 1001) with <strong>Onboarding</strong> (1002) and its child <strong>First week</strong> (1003), <strong>Architecture overview</strong> (1004) with a diagram and a merged-cell table, and <strong>Release checklist</strong> (1005), which contains a Jira issue list.</p>
    <h2>Export the tree</h2><ol><li>Open Engineering Handbook in Confluence and choose <strong>Apps → Export to Markdown</strong>. In <strong>Source</strong>, choose <strong>This page and descendants</strong>. Every accessible page in the tree starts selected; keep all five.</li><li>Under <strong>Where will this Markdown go?</strong>, choose <strong>Git documentation</strong>. It uses relative Markdown links, page-ID filenames and blockquote panels, and leaves the export time out of each page’s frontmatter.</li><li>Choose <strong>Review selection → Prepare full preview</strong>. Release checklist shows one conversion warning, <code>Jira issue list not exported (JQL: project = ENG AND resolution = Unresolved)</code>; decide whether that is acceptable before you continue.</li><li>Choose <strong>Build ZIP from preview</strong>, then <strong>Download ZIP</strong>. The sample archive is <code>ENG-1001-2026-11-02.zip</code>: the space key, the top folder and the export date.</li></ol>
    <h2>Extract it on a review branch</h2><p>Run these from the repository root, replacing the ZIP path with wherever you saved the download. Keep the ZIP itself outside the repository.</p>${pre(`
git switch -c confluence-export-2026-11-02
mkdir -p docs
unzip -q ~/Downloads/ENG-1001-2026-11-02.zip -d docs
mv docs/1001 docs/handbook
git add docs/handbook
git status --short`, 'Commands to extract the first export on a branch')}<p>Git lists eight new files:</p>${pre(`
A  docs/handbook/1001.md
A  docs/handbook/1001/1002.md
A  docs/handbook/1001/1002/1003.md
A  docs/handbook/1001/1004.assets/system-overview.svg
A  docs/handbook/1001/1004.md
A  docs/handbook/1001/1005.md
A  docs/handbook/all-pages.md
A  docs/handbook/manifest.json`, 'git status output for the first export')}<p>Each directory matches a parent page and each filename is a page ID, so a title change does not rename the file. Links between the exported pages are relative to the file that contains them. In <code>1001.md</code>, the handbook links to <code>[Onboarding](1001/1002.md)</code>; in <code>1001/1004.md</code>, the diagram is <code>![System overview](1004.assets/system-overview.svg)</code>.</p><p>Commit the branch and review it the way you review other documentation changes:</p>${pre('git commit -m "Import Engineering Handbook from Confluence (2026-11-02)"', 'Commit command')}
    <h2>Refresh after a change in Confluence</h2><p>In the sample, someone edits First week in Confluence, which publishes version 5. Once the import branch has been reviewed and merged into <code>main</code>, export the same tree with the same settings, then replace the exported folder on a new branch. Replacing the whole folder matters: pages that are no longer in the export show up as deletions instead of lingering in the repository. Start with a clean working tree and keep only generated export files in <code>docs/handbook</code>. The <code>git rm</code> command below removes tracked files and refuses to discard modified ones.</p>${pre(`
git switch main
git switch -c confluence-export-2026-11-03
git rm -r -- docs/handbook
unzip -q ~/Downloads/ENG-1001-2026-11-03.zip -d docs
mv docs/1001 docs/handbook
git add -A docs/handbook
git diff --cached --stat`, 'Commands to refresh the export on a new branch')}${pre(`
 docs/handbook/1001/1002/1003.md | 11 ++++++-----
 docs/handbook/all-pages.md      |  7 ++++---
 docs/handbook/manifest.json     |  8 ++++----
 3 files changed, 14 insertions(+), 12 deletions(-)`, 'Diff summary after the refresh')}<p>The four untouched pages are byte-for-byte identical, because the Git documentation preset omits the per-page export timestamp. The edited page shows its new body and metadata:</p>${pre(`
-last_updated_by: "Sam Lee"
+last_updated_by: "Mei Tanaka"
 created: "2026-09-01T09:00:00.000Z"
-updated: "2026-10-08T15:30:00.000Z"
-version: 4
+updated: "2026-11-03T09:12:00.000Z"
+version: 5
 ...
-- Day 3 to 5: pair on the current sprint
+- Day 3 to 4: pair on the current sprint
+- Day 5: demo your first change at the team review
 ...
-npm test
+npm run check`, 'Excerpt of the diff for the edited page')}<p><code>manifest.json</code> changes too: its <code>exported</code> time and the page’s version entry. <code>all-pages.md</code> repeats the edited text because it combines every page. Commit with a message that records the export date.</p>
    <h2>Sample files</h2>${samples([
      ['git-handbook/ENG-1001-2026-11-02.zip', 'First export: five pages, Git documentation preset.'],
      ['git-handbook/ENG-1001-2026-11-03.zip', 'Second export after the First week edit.'],
      ['git-handbook/handbook-2026-11-02-to-2026-11-03.diff', 'The complete Git diff between the two commits.'],
    ])}
    <h2>Limits that affect this workflow</h2><ul><li><strong>It is a snapshot, not a sync.</strong> Each refresh is a new export you run and commit. Flint does not watch Confluence, schedule exports or push to Git.</li><li><strong>Keep hand edits out of the exported folder.</strong> A refresh replaces the folder, so edits made there appear as reversions in the next diff. Fix content in Confluence instead.</li><li><strong>Moves change paths.</strong> Page-ID filenames survive renames, but moving a page under a different parent moves its file to a different directory. See <a href="../confluence-markdown-links-filenames/">how links and filenames behave across exports</a>.</li><li><strong>Links to unselected pages stay in Confluence.</strong> Only links between exported pages become relative paths.</li><li><strong>Complex tables stay HTML.</strong> The merged-cell table in Architecture overview is HTML inside the Markdown. Check how your repository host or site generator displays it; the <a href="../confluence-markdown-to-mkdocs/">MkDocs guide</a> shows one renderer where a link inside such a table needs attention.</li><li><strong>Repository access replaces Confluence permissions.</strong> Exported files do not keep page restrictions. Only commit pages that everyone with repository access may read.</li><li><strong>Collection limits still apply.</strong> A tree larger than 500 pages must be split; see <a href="../export-large-confluence-space/">exporting a large space in batches</a>.</li></ul>
    <p>This guide checked that every relative link in the samples resolves to a file in the export. It did not observe how a particular Git hosting service renders these files.</p>
    ${related([link('compare-confluence-markdown-exports', 'Compare two exports'), link('markdown-export-profiles', 'Save export profiles'), ref('presets', 'Output presets reference')])}${BOUNDARY}`,
  },
  {
    slug: 'confluence-to-ai-context', group: 'use', card: 'Package a project brief for an AI tool and understand which files the destination needs.',
    title: 'How to prepare Confluence pages as AI assistant context',
    heading: 'Prepare selected Confluence pages as context for an AI assistant',
    description: 'Export a Confluence project brief with the AI context preset, then check metadata, warnings, all-pages.md and image files before using it in an AI tool.',
    lede: 'Package a small set of project pages as Markdown an assistant can read, and know exactly what you are handing over.',
    body: () => `${result('Finished result', 'A four-page project brief exported as Markdown, with plain-text panels, a combined <code>all-pages.md</code> of 2,436 bytes and one recorded warning. You will know which parts the combined file carries on its own and which still depend on the adjacent files.')}
    <p>Flint Markdown Export does not send content to an AI provider, and it has no built-in AI integration. It prepares files in your browser, or in Atlassian-hosted functions for a background export. Choosing a destination, and following your organization’s rules for what may be shared with it, is a separate step that you control.</p>
    <h2>Example: a project brief</h2><p>The fictional Harbor Lights brief (page 2001) has three child pages: <strong>Scope and goals</strong> (2002) with a flow diagram, <strong>Decision log</strong> (2003) with a dated table, and <strong>Open questions</strong> (2004) with a task list, a Jira issue key and a Jira issue list. The brief also links to a <strong>Visitor policy</strong> page that is not part of the export.</p>
    <h2>Export the brief</h2><ol><li>Open the brief and choose <strong>Apps → Export to Markdown</strong>, then <strong>This page and descendants</strong>. Keep the four pages selected.</li><li>Choose <strong>AI context</strong>. It uses relative Markdown links, filenames with titles and page IDs, and plain-text panels.</li><li>Decide what metadata travels with each page. Open <strong>Advanced settings</strong> and clear any <strong>Frontmatter fields</strong> the destination does not need. Clearing <code>author</code> and <code>last_updated_by</code> keeps those names out of page frontmatter, but they remain in <code>manifest.json</code> and any @mentions in the text stay as names.</li><li>Choose <strong>Review selection → Prepare full preview</strong>. In <strong>Preview file</strong>, pick <code>all-pages.md</code> and switch between <strong>Rendered</strong> and <strong>Markdown source</strong>. Open Open questions to see its conversion warning.</li><li>Choose <strong>Build ZIP from preview → Download ZIP</strong>.</li></ol>
    <h2>What the export contains</h2>${pre(`
harbor-lights-project-brief-2001/
  harbor-lights-project-brief-2001.md
  harbor-lights-project-brief-2001/
    scope-and-goals-2002.md
    scope-and-goals-2002.assets/check-in-flow.svg
    decision-log-2003.md
    open-questions-2004.md
  all-pages.md
  manifest.json`, 'Files in the AI context export')}<p>One warning is recorded for Open questions: <code>Jira issue list not exported (JQL: project = HL AND statusCategory != Done)</code>. The issue key HL-12 on the same page becomes an ordinary link to Jira; the live issue list becomes an HTML comment marker. If the assistant needs those issues, add a summary to the page or provide the list separately.</p>
    <h3>The combined file</h3><p><code>all-pages.md</code> joins the selected pages in tree order. Each page starts with a comment, its title and a source line, but the YAML frontmatter appears only in the individual files:</p>${pre(`
<!-- page 2001: harbor-lights-project-brief-2001.md -->

# Harbor Lights project brief

Source: https://example.atlassian.net/wiki/spaces/PRJ/pages/2001/Harbor+Lights+project+brief · Updated: 2026-10-08
...
Figures in this brief are planning estimates, not approved budget.

Background reading: the [visitor policy](https://example.atlassian.net/wiki/spaces/PRJ/pages/2900/Visitor+policy) and the [Scope and goals](harbor-lights-project-brief-2001/scope-and-goals-2002.md) page.`, 'Excerpt of all-pages.md')}<p>Three details in that excerpt matter for an assistant:</p><ul><li>The note panel became an ordinary sentence. With plain-text panels, nothing marks it as a caveat. If emphasis matters, change <strong>Panels</strong> to <strong>Blockquotes</strong> in Advanced settings.</li><li>The Visitor policy link still points to Confluence because that page was not selected. A destination without Confluence access cannot follow it.</li><li>The Scope and goals link and the diagram (<code>![Check-in flow](harbor-lights-project-brief-2001/scope-and-goals-2002.assets/check-in-flow.svg)</code>) are paths to other files in the ZIP. Uploading only <code>all-pages.md</code> sends the text, not the image or the separate page files.</li></ul>
    <h3>Trimmed frontmatter</h3><p>With <code>title</code>, <code>page_id</code>, <code>source_url</code>, <code>labels</code> and <code>updated</code> kept, the brief’s file starts like this:</p>${pre(`
---
title: "Harbor Lights project brief"
page_id: "2001"
source_url: "https://example.atlassian.net/wiki/spaces/PRJ/pages/2001/Harbor+Lights+project+brief"
labels: ["project-brief", "harbor-lights"]
updated: "2026-10-08T15:30:00.000Z"
---`, 'Trimmed YAML frontmatter')}
    <h2>Match the files to the destination</h2><p>Check the destination’s own documentation for the file types, number of files and sizes it accepts, and whether it reads folders, ZIP archives or images. Then choose:</p><ul><li><strong>One text file accepted:</strong> use <code>all-pages.md</code> (2,436 bytes, 311 words in the sample). Expect links to other files and images to be paths only.</li><li><strong>Several files accepted:</strong> provide the individual page files with their <code>.assets</code> folders, so each page keeps its own metadata and images.</li><li><strong>Neither fits:</strong> narrow the selection or split the brief into topics rather than trimming the Markdown by hand.</li></ul>
    <h2>Sample files</h2>${samples([
      ['ai-context/PRJ-harbor-lights-project-brief-2001-2026-11-03.zip', 'The complete AI context export.'],
      ['ai-context/all-pages.md', 'The combined file on its own, for inspection.'],
      ['ai-context/manifest.json', 'Page paths, metadata, options and the recorded warning.'],
    ])}
    <h2>Limits that affect this task</h2><ul><li>Only pages you can read are exported. The files do not keep Confluence permissions once they leave the app.</li><li>The export is a snapshot. Re-export when the brief changes; the assistant does not see later edits.</li><li>Macros that Flint cannot convert or render leave markers and warnings. Read <a href="../confluence-markdown-export-warnings/">how to fix export warnings</a> before relying on the content.</li></ul>
    ${related([link('confluence-markdown-yaml-metadata', 'Customize YAML metadata'), link('choose-markdown-export-preset', 'Choose a preset'), ref('files', 'ZIP contents reference')])}${BOUNDARY}`,
  },
  {
    slug: 'compare-confluence-markdown-exports', group: 'check', card: 'Load an earlier manifest to count added, changed, moved and missing pages, then list them.',
    title: 'How to compare two Confluence Markdown exports',
    heading: 'Compare two Confluence exports to see what changed',
    description: 'Load an earlier manifest.json into Flint Markdown Export to count added, changed, moved and missing pages, then list the exact pages with jq.',
    lede: 'Check what changed between two snapshots of the same pages before you replace the older copy.',
    body: () => `${result('Finished result', 'Flint reports <strong>Compared with previous export: 1 added, 2 changed, 1 paths changed, 1 missing.</strong> A short jq command then names each page and explains every count.')}
    <h2>How the comparison works</h2><p>Every export includes <code>manifest.json</code>, which lists each exported page’s ID, version and file path. When you load an earlier manifest, Flint compares it with the export you are preparing:</p>${table('Comparison categories', ['Result', 'Rule', 'Common causes'], [
      ['Added', 'The page ID is new', 'A new page, a page newly selected, or newly readable to you'],
      ['Changed', 'The version number differs', 'An edit was published in Confluence, including a rename'],
      ['Paths changed', 'The file path differs', 'A rename with title filenames, a move, or a different filename pattern'],
      ['Missing', 'The page ID is no longer present', 'Not selected, outside the scope, no longer readable to you, moved elsewhere, or deleted'],
    ])}<p>A missing page does not prove deletion. The comparison also ignores attachment contents, warnings and settings.</p>
    <h2>Example: one day of changes</h2><p>The first sample export, made on 2026-11-02, contains the five-page handbook in <strong>Standard Markdown</strong>. Before the second export, four controlled changes happened:</p><ul><li><strong>First week</strong> (1003) was edited and published as version 5.</li><li><strong>Architecture overview</strong> (1004) was renamed <strong>System architecture</strong> and published as version 5.</li><li><strong>Incident response</strong> (1006) was created.</li><li><strong>Release checklist</strong> (1005) was left unselected.</li></ul>
    <h2>Run the comparison</h2><ol><li>Keep the earlier export’s <code>manifest.json</code>. It is in the ZIP’s top folder.</li><li>Open the same root page, choose <strong>Apps → Export to Markdown</strong> and <strong>This page and descendants</strong>, then select the pages and preset for the new export.</li><li>Open <strong>Compare with a previous export</strong> and choose the file under <strong>Previous manifest.json</strong>. Wait for <strong>Previous manifest loaded.</strong> A manifest from another Confluence site is rejected with <code>Choose a Flint manifest from the same Confluence site.</code></li><li>Choose <strong>Review selection → Prepare full preview</strong>, or <strong>Export ZIP</strong>. The comparison notice appears above the preview or the export summary.</li></ol>
    <p>The notice gives counts only. To see which pages they are, compare the two manifests. This jq command (tested with jq 1.7.1) prints one line per difference:</p>${pre(`
jq -c -n --slurpfile old manifest-2026-11-02.json --slurpfile new manifest-2026-11-03.json '
  ($old[0].pages | INDEX(.page_id)) as $a
  | ($new[0].pages | INDEX(.page_id)) as $b
  | ($b | to_entries[] | .value as $p | $a[.key] as $q
      | if $q == null then {change: "added", id: $p.page_id, title: $p.title}
        else (if $q.version != $p.version then {change: "changed", id: $p.page_id, title: $p.title, version: "\\($q.version) -> \\($p.version)"} else empty end),
             (if $q.path != $p.path then {change: "path changed", id: $p.page_id, path: "\\($q.path) -> \\($p.path)"} else empty end)
        end),
    ($a | to_entries[] | select($b[.key] == null) | {change: "missing", id: .key, title: .value.title})'`, 'jq command that lists manifest differences')}${pre(`
{"change":"changed","id":"1003","title":"First week","version":"4 -> 5"}
{"change":"changed","id":"1004","title":"System architecture","version":"4 -> 5"}
{"change":"path changed","id":"1004","path":"engineering-handbook/architecture-overview.md -> engineering-handbook/system-architecture.md"}
{"change":"added","id":"1006","title":"Incident response"}
{"change":"missing","id":"1005","title":"Release checklist"}`, 'jq output for the sample manifests')}<p>The rename counts twice: as changed, because it published a new version, and as a changed path, because Standard Markdown names files by title. With the Git documentation preset’s page-ID filenames the same rename keeps its path, while a move to another parent still changes it.</p>
    <h2>Decide what each result means</h2><ul><li><strong>Changed:</strong> review the page’s diff or open it in Confluence.</li><li><strong>Paths changed:</strong> update anything that links to the old file path, such as a site navigation file.</li><li><strong>Missing:</strong> check before treating it as removed. Confirm the page is still in scope, still selected and still readable to you. Here, Release checklist still exists; it was simply not selected.</li><li><strong>Every page changed path:</strong> you probably compared exports with different presets or filename patterns. Compare like with like.</li></ul>
    <h2>Sample files</h2>${samples([
      ['compare/manifest-2026-11-02.json', 'Manifest from the first export (load this as the previous manifest).'],
      ['compare/manifest-2026-11-03.json', 'Manifest from the second export.'],
      ['compare/handbook-2026-11-02.zip', 'First export, Standard Markdown.'],
      ['compare/handbook-2026-11-03.zip', 'Second export after the four changes.'],
    ])}
    <h2>Limits</h2><ul><li>The manifest must come from the same Confluence site and be under 5,000,000 bytes.</li><li>The comparison reports page IDs, versions and paths. It does not compare text, attachments or warnings; use a file diff for that, as in <a href="../confluence-to-git/">the Git workflow</a>.</li><li>Comparison is a review aid, not synchronization. Nothing is updated automatically.</li></ul>
    ${related([link('check-confluence-markdown-snapshot', 'Check a snapshot before relying on it'), link('confluence-markdown-links-filenames', 'Predictable links and filenames'), ref('history', 'History and comparison reference')])}${BOUNDARY}`,
  },
  {
    slug: 'confluence-markdown-export-warnings', group: 'check', card: 'Read each kind of export warning, find it in the files and fix the scope or the source page.',
    title: 'How to fix warnings and missing content in Markdown exports',
    heading: 'Understand export warnings and fix missing or changed content',
    description: 'Read Flint Markdown Export warnings for Jira lists, unrendered macros, missing images and complex tables, then fix the scope or the source page.',
    lede: 'Find out what a warning means, where it shows up in the files, and what to change before you export again.',
    body: () => `${result('Finished result', 'A runbook page exported with four warnings and one HTML table. For each, you will know the exact message, what ended up in the Markdown and the most likely fix.')}
    <h2>Example: a service desk runbook</h2><p>The fictional <strong>Service desk runbook</strong> page (4001) has a dashboard screenshot, an escalation matrix with a merged cell, a status board from another app, a Jira issue list and a wiring diagram image. Exported alone in Standard Markdown, the export summary reads <strong>Export completed with 4 warnings. Review the details below before using the files.</strong></p>
    <h2>Where warnings appear</h2><ul><li><strong>The full preview.</strong> After <strong>Review selection → Prepare full preview</strong>, each file with problems shows a <strong>Conversion warnings</strong> box. Switch to <strong>Markdown source</strong> to see the exact output.</li><li><strong>The export summary.</strong> Expand the warning count under <strong>Your export is ready</strong>. Pages that could not be read, items that are not pages and files over the size limits are listed separately there.</li><li><strong>manifest.json.</strong> Each page has a <code>warnings</code> list. The top-level <code>skipped</code> and <code>limits</code> lists record unread pages, non-page items and size-limit omissions.</li></ul><p>To check one page quickly, click its title in the page list and choose <strong>Prepare page preview</strong>. That preview prepares the page alone; use the full preview for links between pages and the final ZIP layout.</p>
    <h2>The four warnings and the table</h2>${table('Warnings in the sample export', ['Warning text', 'What the file contains', 'What to do'], [
      ['<code>Jira issue list not exported (JQL: project = DESK AND priority = High AND resolution = Unresolved)</code>', 'An HTML comment: <code>&lt;!-- macro: jira jql="…" --&gt;</code>', 'Jira issue lists are not exported in this release. Keep the live list in Confluence, or add the issues the export needs to the page as text or a table.'],
      ['<code>Macro "status-board" not rendered: could not be rendered</code>', 'A marker: <code>&lt;!-- macro: status-board --&gt;</code>', 'Flint asks Confluence to render macros it does not convert itself. When that fails, the marker remains. Export again later; if it persists, treat the content as a known gap or replace the macro with page content.'],
      ['<code>queue-dashboard.png could not be downloaded</code>', 'The image still points to the Confluence attachment: <code>![Queue dashboard](https://example.atlassian.net/wiki/pages/viewpageattachments.action?pageId=4001&amp;preview=queue-dashboard.png)</code>', 'Check the file opens for you in Confluence, then export again. Until then the image only displays for readers who can open Confluence.'],
      ['<code>Attachment not found: Desk phone wiring</code>', 'The image’s alt text as plain text: <code>Desk phone wiring</code>', 'The page refers to a file that is not among its attachments, for example an image that belongs to another page or was removed. Re-insert or attach the image on this page.'],
      ['No warning', 'The escalation matrix is an HTML <code>&lt;table&gt;</code> with <code>rowspan="2"</code>', 'Merged cells and complex cells keep HTML structure. Confirm your destination displays HTML tables; otherwise simplify the table in Confluence.'],
    ], true)}<p>The rendering message can also end in <code>rendering timed out</code>, <code>no rendered output</code> or <code>render limit reached</code>. Each still leaves a marker in the file.</p>
    <h3>The page, as exported</h3>${pre(`
## Queue dashboard

![Queue dashboard](https://example.atlassian.net/wiki/pages/viewpageattachments.action?pageId=4001&preview=queue-dashboard.png)

## Escalation matrix

<table><tr><th><p>Severity</p></th><th><p>First response</p></th><th><p>Escalate to</p></th></tr><tr><td rowspan="2"><p>High</p></td>…</table>

## Team status board

<!-- macro: status-board -->

## Open escalations

<!-- macro: jira jql="project = DESK AND priority = High AND resolution = Unresolved" -->

## Wiring diagram

Desk phone wiring`, 'Excerpt of the exported runbook page')}
    <h2>Fix, then export again</h2><ol><li>Decide which warnings matter for this copy. A runbook binder may need the escalation issues; an archive may accept a marker.</li><li>Fix the source in Confluence (restore the image, replace the macro, add the issues), or change the scope if a page should not be in the export.</li><li>Export again with the same settings. To confirm which pages changed, load the previous <code>manifest.json</code> under <strong>Compare with a previous export</strong>; see <a href="../compare-confluence-markdown-exports/">comparing exports</a>.</li><li>Check the new <code>warnings</code> lists before replacing the earlier copy.</li></ol>
    <h2>Other messages in the summary</h2><ul><li><strong>Pages that could not be read</strong> are named in the summary and listed under <code>skipped</code> with the reason <code>could not be read</code>. They are not counted as exported. See <a href="../check-confluence-markdown-snapshot/">checking a snapshot</a>.</li><li><strong>Items that are not pages</strong>, such as whiteboards and databases, are skipped and listed.</li><li><strong>Files too large to include</strong> appear as <code>… not included: over the 75 MB file limit</code> or the export limit. See <a href="../confluence-markdown-images-attachments/">images and attachments</a>.</li></ul>
    <h2>Sample files</h2>${samples([
      ['warnings/OPS-service-desk-runbook-2026-11-03.zip', 'The runbook export with all four warnings.'],
      ['warnings/manifest.json', 'The page entry with its warnings list.'],
    ])}
    ${related([link('confluence-markdown-images-attachments', 'Keep images and attachments working'), ref('files', 'Formatting and macros reference'), ref('limits', 'Limits and recovery')])}${BOUNDARY}`,
  },
  {
    slug: 'confluence-onboarding-handoff-export', group: 'use', card: 'Export an onboarding branch with its files and hand over a dated snapshot with a clear scope.',
    title: 'How to hand over a Confluence onboarding guide as Markdown',
    heading: 'Create a portable onboarding handbook or project handoff',
    description: 'Export an onboarding branch with its images and attachments, check its links and warnings, and hand over a dated Markdown snapshot with a clear scope.',
    lede: 'Give a new team, contractor or partner a portable copy of the pages they need, with the files, the date and the boundaries spelled out.',
    body: () => `${result('Finished result', 'A ZIP with four onboarding pages, a site map image and a safety-briefing PDF beside the page that uses them, plus a short note that states what the snapshot covers and what stays in Confluence.')}
    <h2>Example: an operations onboarding branch</h2><p>The fictional <strong>Operations onboarding</strong> page (6001) has three children: <strong>Your first day</strong> (6002), with a site map image and an attached safety briefing; <strong>Tools and access</strong> (6003); and <strong>Who to call</strong> (6004). It links to an <strong>Expense policy</strong> that should remain in Confluence.</p>
    <h2>Export the branch</h2><ol><li>Open Operations onboarding and choose <strong>Apps → Export to Markdown</strong>, then <strong>This page and descendants</strong>. Only this branch is collected, not the rest of the space.</li><li>Choose <strong>Standard Markdown</strong>. Title-based filenames such as <code>your-first-day.md</code> are easy for people to browse.</li><li>Under <strong>Output details</strong>, turn on <strong>Include other attachments</strong>. Images are always included; this setting adds the PDF.</li><li>Choose <strong>Review selection</strong>. The summary line reads <strong>4 pages · Standard Markdown · Images and other attachments · Frontmatter on</strong>. Choose <strong>Prepare full preview</strong>.</li><li>Inspect the links. The three child-page links became relative links; the expense policy still opens Confluence. Check the summary for warnings; the sample has none.</li><li>Choose <strong>Build ZIP from preview → Download ZIP</strong>.</li></ol>
    <h2>What the recipient gets</h2>${pre(`
operations-onboarding/
  operations-onboarding.md
  operations-onboarding/
    your-first-day.md
    your-first-day.assets/
      safety-briefing.pdf
      site-map.svg
    tools-and-access.md
    who-to-call.md
  all-pages.md
  manifest.json`, 'Files in the onboarding export')}<p>The PDF is linked from the page that uses it, so it opens from the extracted folder:</p>${pre(`
![Site map](your-first-day.assets/site-map.svg)

The safety briefing is attached:

[safety-briefing.pdf](your-first-day.assets/safety-briefing.pdf)`, 'Excerpt of your-first-day.md')}<p>The panel on the root page keeps its Confluence link, because that page was not exported:</p>${pre(`
> [!NOTE]
> Travel and purchases follow the [expense policy](https://example.atlassian.net/wiki/spaces/OPS/pages/6900/Expense+policy), which stays in Confluence.`, 'Excerpt of operations-onboarding.md')}
    <h2>Package it as a dated snapshot</h2><p>The archive name already includes the export date: <code>OPS-operations-onboarding-2026-11-03.zip</code>. Add a short note of your own beside the ZIP so the recipient knows what they have:</p><ul><li>The export time from <code>manifest.json</code> and the source page link.</li><li>The pages and files included, and anything deliberately left out.</li><li>That Confluence remains the source of truth, and who to tell about corrections.</li></ul><p>The sample note below was written for this guide; Flint does not create it.</p>
    <h2>Sample files</h2>${samples([
      ['handoff/OPS-operations-onboarding-2026-11-03.zip', 'The onboarding export with its image and PDF.'],
      ['handoff/HANDOFF-NOTE.md', 'An illustrative handoff note written by the sending team.'],
    ])}
    <h2>Before you send it</h2><ul><li><strong>Check who may read it.</strong> The files do not keep Confluence permissions. Mentions become people’s display names, and frontmatter can include authors and editors. Remove unneeded frontmatter fields under <strong>Advanced settings</strong>, then inspect <code>manifest.json</code> and the page text too: frontmatter choices do not remove names from those files.</li><li><strong>Expect it to go stale.</strong> The copy does not update. Send a new snapshot when the pages change.</li><li><strong>Keep the folders together.</strong> Moving a page file without its <code>.assets</code> folder breaks its images and attachment links.</li><li><strong>Check the size limits.</strong> Files over 75 MiB, or attachments beyond 300 MiB for the export, are left out with a message. See <a href="../confluence-markdown-images-attachments/">images and attachments</a>.</li></ul>
    ${related([link('check-confluence-markdown-snapshot', 'Check a snapshot before relying on it'), link('confluence-to-obsidian', 'Export to Obsidian'), ref('files', 'ZIP contents reference')])}${BOUNDARY}`,
  },
  {
    slug: 'export-large-confluence-space', group: 'how', card: 'Plan branch-sized batches under the 500-page cap and check manifests for overlaps and gaps.',
    title: 'How to export a large Confluence space in batches',
    heading: 'Break a large Confluence space into manageable exports',
    description: 'Plan branch-sized Markdown exports under the 500-page collection cap, record each batch’s scope, and check the manifests for overlaps and gaps.',
    lede: 'When a space is too large for one export, split it into branches you can track, repeat and reconcile.',
    body: () => `${result('Finished result', 'A batch plan with one export per branch, a manifest for each batch, and a duplicate-page check and a way to investigate gaps while the space changes.')}
    <h2>Why one export is not enough</h2><p>Flint collects up to 500 pages for one export. The cap applies while the page list is being collected, before you can choose pages. When a tree or space is larger, collection stops and the workspace shows <strong>Could not complete the request</strong> with this message:</p>${pre('This section has more than 500 pages; the limit is 500. Export a smaller section.', 'Page cap message')}<p>Narrowing the selection afterwards is not possible, because the list never loads. Start from a smaller branch instead. The other limits are per export too: 75 MiB per file and 300 MiB of attachments. Background exports share these limits and also have a 15-minute execution limit, so running in the background does not lift the cap.</p>
    <h2>Plan the batches</h2><ol><li>Use the space’s page tree to list its top-level branches. Each branch root becomes the starting page of a batch.</li><li>Export the space home page on its own with <strong>This page only</strong>; exporting it with descendants collects its tree and can exceed the cap.</li><li>If a branch stops with the page cap message, split it into its child branches.</li><li>Keep attachments in mind. A branch with many large files may need splitting even when it has fewer than 500 pages.</li><li>Use one saved profile for every batch so the files are consistent; see <a href="../markdown-export-profiles/">export profiles</a>.</li></ol>
    ${table('Example batch plan', ['Batch', 'Start page', 'Source option', 'Notes'], [
      ['Home', 'Customer Support (7000)', 'This page only', 'Space home page only'],
      ['A', 'Product guides (7100)', 'This page and descendants', '7 pages'],
      ['B', 'Troubleshooting (7200)', 'This page and descendants', '7 pages after a move, see below'],
      ['C', 'Release notes (7300)', 'This page and descendants', 'Export last'],
    ])}<p>The plan is illustrative. For each finished batch, record the archive name, the root page ID and page count from <code>manifest.json</code>, and the export time.</p>
    <h2>Run each batch</h2><ol><li>Open the batch’s start page and choose <strong>Apps → Export to Markdown</strong>.</li><li>Choose the source option from the plan and keep the collected pages selected.</li><li>Open <strong>Saved profiles</strong>, choose <strong>Use profile</strong>, and set <strong>Include other attachments</strong>, which a profile does not store.</li><li>Export, then download the ZIP and keep its manifest with the batch record.</li></ol>
    <h2>Check for overlaps and gaps</h2><p>A space can change while you work through the batches. In the sample, Batch A was exported at 16:00. At 16:10 an editor moved <strong>Product guide 1</strong> (7101) into Troubleshooting, so Batch B, exported at 16:30, contains it again. These commands were tested with jq 1.7.1 on the sample manifests:</p>${pre(`
jq -r '"\\(input_filename): root \\(.root_page_id), \\(.pages | length) pages, exported \\(.exported)"' batch-a-manifest.json batch-b-manifest.json
jq -r '.pages[].page_id' batch-a-manifest.json batch-b-manifest.json | sort | uniq -d
jq -r --arg id 7101 '.pages[] | select(.page_id == $id) | "\\(input_filename): \\(.path)"' batch-a-manifest.json batch-b-manifest.json`, 'Commands that summarize batches and find duplicate pages')}${pre(`
batch-a-manifest.json: root 7100, 7 pages, exported 2026-11-03T16:00:00Z
batch-b-manifest.json: root 7200, 7 pages, exported 2026-11-03T16:30:00Z
7101
batch-a-manifest.json: 7100/7101.md
batch-b-manifest.json: 7200/7101.md`, 'Output for the sample batches')}<p>The duplicate is easy to spot. The opposite case is harder: a page moved from a branch you have not exported yet into one you already finished appears in neither batch. Count the pages you expect per branch before you start, compare each manifest with that count, and re-export any branch that changed during the run.</p>
    <h2>Sample files</h2>${samples([
      ['batches/batch-a-manifest.json', 'Batch A: Product guides, before the move.'],
      ['batches/batch-b-manifest.json', 'Batch B: Troubleshooting, after the move.'],
    ])}
    <h2>Limits</h2><ul><li>The 500-page figure is a safeguard, not a guarantee that every 500-page mix of content and attachments will finish on every device or within the background time limit.</li><li>Links from one batch to pages in another batch remain Confluence links; each export only rewrites links between its own pages.</li><li><strong>Pages from a space</strong> collects every current page in the space, so it only works for spaces within the cap.</li></ul>
    ${related([link('background-confluence-export', 'Run an export in the background'), link('check-confluence-markdown-snapshot', 'Check a snapshot'), ref('limits', 'Limits reference')])}${BOUNDARY}`,
  },
  {
    slug: 'confluence-markdown-images-attachments', group: 'how', card: 'Compare image-only and attachment exports, keep .assets folders with pages, and read size omissions.',
    title: 'How to keep images and attachments in a Markdown export',
    heading: 'Keep images and attachments working after a Markdown export',
    description: 'Compare image-only and full-attachment Markdown exports, keep .assets folders beside their pages, and read size-limit omissions in the manifest.',
    lede: 'Decide which files travel with your pages, and keep the paths working after you move the export.',
    body: () => `${result('Finished result', 'Two exports of the same page: one with images only, and one that also brings a PDF and a spreadsheet. The second export leaves out an 80 MiB video with an explicit message.')}
    <h2>Example: a site survey page</h2><p>The fictional <strong>Site survey</strong> page (5001) shows two images (<code>floor-plan.svg</code> and <code>Entrance photo.svg</code>) and links a <code>Signed survey.pdf</code>. Two more files are attached but not shown on the page: <code>equipment-list.csv</code> and an 80 MiB <code>walkthrough.mp4</code>.</p>
    <h2>Export twice and compare</h2><ol><li>Open the page, choose <strong>Apps → Export to Markdown</strong> and <strong>This page only</strong>, and choose <strong>Standard Markdown</strong>.</li><li>Leave <strong>Include other attachments</strong> off and export. The footer reads <strong>Images included</strong>.</li><li>Choose <strong>Export again</strong>, turn on <strong>Include other attachments</strong>, and export once more. The footer reads <strong>Images + attachments</strong>.</li><li>Open the summary of the second export: <strong>Export completed with 1 warning and 1 file skipped by size limits.</strong></li></ol>
    ${table('Attachment handling in the two exports', ['Attachment', 'Images only', 'With other attachments'], [
      ['<code>floor-plan.svg</code> (shown on page)', '<code>site-survey.assets/floor-plan.svg</code>', 'Same'],
      ['<code>Entrance photo.svg</code> (shown on page)', '<code>site-survey.assets/entrance-photo.svg</code>', 'Same'],
      ['<code>Signed survey.pdf</code> (linked on page)', 'Link to the Confluence attachment', '<code>site-survey.assets/signed-survey.pdf</code>, linked locally'],
      ['<code>equipment-list.csv</code> (attached only)', 'Not included', '<code>site-survey.assets/equipment-list.csv</code>, not linked from the page'],
      ['<code>walkthrough.mp4</code>, 80 MiB', 'Not included', 'Left out: <code>walkthrough.mp4 not included: over the 75 MB file limit</code>'],
    ], true)}<p>Attachment filenames become lowercase and hyphenated, so <code>Entrance photo.svg</code> becomes <code>entrance-photo.svg</code>. The Markdown uses the new name. In the first export the PDF stays a Confluence link:</p>${pre(`
[Signed survey.pdf](https://example.atlassian.net/wiki/pages/viewpageattachments.action?pageId=5001&preview=Signed%20survey.pdf)`, 'PDF link in the image-only export')}<p>With other attachments included, the same link points to the local copy:</p>${pre('[Signed survey.pdf](site-survey.assets/signed-survey.pdf)', 'PDF link in the full export')}<p>The omitted video is recorded in <code>manifest.json</code>, both as a page warning and in the top-level <code>limits</code> list:</p>${pre(`
"limits": [
  {
    "page_id": "5001",
    "file": "walkthrough.mp4",
    "size": 83886080,
    "reason": "over the 75 MB file limit"
  }
]`, 'Size-limit entry in manifest.json')}<p>The message says MB; the limit is 75 MiB, or 78,643,200 bytes, for each file. Across one export, included attachments may total 300 MiB.</p>
    <h2>Keep paths working</h2><p>Each page’s files sit in a <code>.assets</code> folder beside the page’s Markdown file, and the links are relative. Keep the extracted hierarchy together:</p><ul><li>Move or copy the page file and its <code>.assets</code> folder together.</li><li>Do not flatten the folders into one directory; relative paths depend on them.</li><li>To list the local files a page refers to, from the export’s top folder: <code>grep -o '](site-survey.assets/[^)]*)' site-survey.md</code>.</li></ul><p>The in-app preview displays common raster image formats. Check SVG images and other files in the downloaded ZIP.</p>
    <h2>Sample files</h2>${samples([
      ['attachments/OPS-site-survey-images-only-2026-11-03.zip', 'Images only: two SVG images, PDF linked to Confluence.'],
      ['attachments/OPS-site-survey-with-attachments-2026-11-03.zip', 'With other attachments: adds the PDF and CSV; the video is left out.'],
    ])}
    <h2>Limits and recovery</h2><ul><li>Only attachments you can read are included. A file that fails to download keeps a Confluence link and a warning; see <a href="../confluence-markdown-export-warnings/">export warnings</a>.</li><li>Large files are left out, not split. Share them separately, or export the page without them.</li><li>Images from external URLs stay external and are not downloaded.</li><li>Browser exports need enough device memory for the prepared files and the ZIP. For large attachment sets, consider a <a href="../background-confluence-export/">background export</a>; it has the same size limits.</li></ul>
    ${related([link('confluence-onboarding-handoff-export', 'Hand over an onboarding guide'), ref('limits', 'Limits reference'), ref('files', 'ZIP contents reference')])}${BOUNDARY}`,
  },
  {
    slug: 'choose-markdown-export-preset', group: 'how', card: 'Compare the four presets on the same five pages: filenames, links, panels and metadata.',
    title: 'How to choose a Markdown export preset for Confluence pages',
    heading: 'Choose the right Markdown export preset',
    description: 'Compare Standard Markdown, Obsidian vault, Git documentation and AI context output from the same five Confluence pages: filenames, links, panels and metadata.',
    lede: 'See how the same pages come out in each preset, then pick the one that matches where the files are going.',
    body: () => `${result('Finished result', 'A side-by-side view of real output from the four presets for the same five fictional pages, and a short rule for choosing between them.')}
    <p>These examples come from the four downloads offered by the <a href="${DEMO}">interactive demo</a>, with all five handbook pages selected and other attachments off. Apart from export timestamps, they match the output of the released exporter.</p>
    <h2>Filenames</h2>${table('Filenames by preset', ['Page', 'Standard Markdown', 'Obsidian vault and AI context', 'Git documentation'], [
      ['Engineering Handbook', '<code>engineering-handbook.md</code>', '<code>engineering-handbook-1001.md</code>', '<code>1001.md</code>'],
      ['Onboarding', '<code>engineering-handbook/onboarding.md</code>', '<code>engineering-handbook-1001/onboarding-1002.md</code>', '<code>1001/1002.md</code>'],
      ['First week', '<code>engineering-handbook/onboarding/first-week.md</code>', '<code>engineering-handbook-1001/onboarding-1002/first-week-1003.md</code>', '<code>1001/1002/1003.md</code>'],
    ], true)}<p>Title filenames are easiest to read but change when a page is renamed. Page IDs never change. Title plus ID is both readable and unique.</p>
    <h2>Links between pages</h2><p>The handbook’s first paragraph links to two other pages. Standard Markdown and AI context use relative Markdown links (with their own filenames); Git documentation does the same with page IDs; Obsidian vault uses wikilinks:</p>${pre(`
Standard:  Start with [Onboarding](engineering-handbook/onboarding.md), then read the …
Obsidian:  Start with [[engineering-handbook-1001/onboarding-1002|Onboarding]], then read the …
Git:       Start with [Onboarding](1001/1002.md), then read the …
AI:        Start with [Onboarding](engineering-handbook-1001/onboarding-1002.md), then read the …`, 'Link syntax by preset')}<p>Inside HTML tables, Obsidian output adds navigation attributes so the link works in a vault: <code>class="internal-link" data-href="engineering-handbook-1001/onboarding-1002#Before day one"</code>.</p>
    <h2>Panels</h2><p>The handbook has an info panel. Each preset writes it differently:</p>${pre(`
Standard and Obsidian (callout):
> [!NOTE]
> This handbook is the source of truth. If something here is wrong, fix it.

Git documentation (blockquote):
> **Info:**
> This handbook is the source of truth. If something here is wrong, fix it.

AI context (plain text):
This handbook is the source of truth. If something here is wrong, fix it.`, 'Panel output by preset')}<p>Callouts use the <code>&gt; [!NOTE]</code> form that Obsidian recognizes; other Markdown tools may show it as an ordinary quote. Blockquotes work almost everywhere. Plain text removes the panel’s emphasis entirely.</p>
    <h2>Frontmatter</h2><p>All four presets add YAML frontmatter with the same page fields. The difference is the export time: Git documentation leaves out <code>exported</code>, so unchanged pages stay byte-for-byte identical between exports. The other presets end their frontmatter with a line such as <code>exported: "2026-10-11T16:00:00Z"</code>.</p>
    <h2>Which preset to choose</h2>${table('Choosing a preset', ['Destination', 'Preset', 'Why'], [
      ['An Obsidian vault', 'Obsidian vault', 'Wikilinks and unique note names'],
      ['A Git repository or documentation site', 'Git documentation', 'Stable page-ID paths and clean diffs'],
      ['An AI tool or other text pipeline', 'AI context', 'Readable unique names and no panel syntax'],
      ['Another Markdown editor, or not sure yet', 'Standard Markdown', 'Readable names and common Markdown'],
    ])}<p>A preset is a starting point. <strong>Advanced settings</strong> changes page links, panels, filename pattern and frontmatter fields. When you have changed them, the heading shows <strong>Customized settings</strong>, and choosing a preset again replaces those settings; custom metadata text is kept.</p>
    <h2>Sample files</h2><ul class="me-samples"><li><a href="${DEMO}variants/standard-31-0/export.zip" download>Standard Markdown ZIP</a><span>Five pages, from the demo.</span></li><li><a href="${DEMO}variants/obsidian-31-0/export.zip" download>Obsidian vault ZIP</a><span>Five pages, from the demo.</span></li><li><a href="${DEMO}variants/git-31-0/export.zip" download>Git documentation ZIP</a><span>Five pages, from the demo.</span></li><li><a href="${DEMO}variants/context-31-0/export.zip" download>AI context ZIP</a><span>Five pages, from the demo.</span></li></ul>
    ${related([link('confluence-to-obsidian', 'Export to Obsidian'), link('confluence-to-git', 'Export to a Git repository'), link('confluence-to-ai-context', 'Prepare AI context'), ref('presets', 'Presets reference')])}${BOUNDARY}`,
  },
  {
    slug: 'confluence-markdown-yaml-metadata', group: 'how', card: 'Choose frontmatter fields, add custom team and project fields, and check the result.',
    title: 'How to customize YAML frontmatter in Confluence Markdown exports',
    heading: 'Customize YAML metadata for documentation and knowledge ingestion',
    description: 'Choose which Confluence page fields appear in YAML frontmatter, add custom team and project fields, and check the result in real exported Markdown.',
    lede: 'Keep the page metadata your documentation or ingestion process uses, add your own fields, and leave the rest out.',
    body: () => `${result('Finished result', 'Every exported page starts with six Confluence fields and three custom fields, the same in every export that uses the settings.')}
    <h2>Available fields</h2>${table('Frontmatter fields', ['Field', 'Value'], [
      ['<code>title</code>, <code>page_id</code>', 'The page title and Confluence page ID'],
      ['<code>source_url</code>', 'The page’s Confluence address'],
      ['<code>space_key</code>, <code>parent_id</code>, <code>breadcrumb</code>', 'Where the page sits; the breadcrumb lists titles from the export root'],
      ['<code>labels</code>', 'The page’s labels'],
      ['<code>author</code>, <code>last_updated_by</code>', 'Display names of the creator and the latest editor'],
      ['<code>created</code>, <code>updated</code>, <code>version</code>', 'When the page was created and last updated in Confluence, and its version number'],
      ['<code>exported</code>', 'When this export ran; the same for every page'],
    ])}<p><code>updated</code> belongs to the page. <code>exported</code> belongs to the export. The Git documentation preset leaves <code>exported</code> out so repeated exports do not change unedited files.</p>
    <h2>Example: documentation fields for a platform team</h2><p>A platform team ingests its handbook into a documentation index. It needs the title, ID, source link, labels, last update and version, plus three fields of its own.</p><ol><li>Export the handbook and choose <strong>Git documentation</strong>.</li><li>Keep <strong>Add YAML frontmatter</strong> on and open <strong>Advanced settings</strong>.</li><li>Under <strong>Frontmatter fields</strong>, clear <code>space_key</code>, <code>parent_id</code>, <code>breadcrumb</code>, <code>author</code>, <code>last_updated_by</code> and <code>created</code>.</li><li>In <strong>Custom metadata (one key=value per line)</strong>, enter the team’s fields:</li></ol>${pre(`
team=Platform
project=Engineering handbook
review_cycle=quarterly`, 'Custom metadata entry')}<p>Prepare the full preview and open any page in <strong>Markdown source</strong>. Architecture overview starts like this:</p>${pre(`
---
title: "Architecture overview"
page_id: "1004"
source_url: "https://example.atlassian.net/wiki/spaces/ENG/pages/1004/Architecture+overview"
labels: ["architecture"]
updated: "2026-10-08T15:30:00.000Z"
version: 4
team: "Platform"
project: "Engineering handbook"
review_cycle: "quarterly"
---

# Architecture overview`, 'Frontmatter with trimmed and custom fields')}<p>Values are written as quoted YAML strings, and custom fields follow the page fields. If you clear a field and turn it back on later, it moves to the end of the page fields. Custom values are the same on every page in the export.</p>
    <h2>Rules for custom fields</h2><ul><li>Up to 20 fields. Keys start with a letter and use letters, digits, underscores or hyphens, up to 64 characters.</li><li>Built-in field names such as <code>title</code> cannot be reused.</li><li>Values are text up to 1,000 characters.</li><li>A line without <code>=</code> or a repeated key stops preparation with a message such as <code>Custom metadata must use key=value, one field per line.</code> or <code>Duplicate custom metadata key: team</code>. Return to selection to correct it.</li></ul>
    <h2>Turn frontmatter off</h2><p>Clear <strong>Add YAML frontmatter</strong> and each file starts directly with its <code># Title</code> heading. <code>manifest.json</code> still records every page field, including author and editor names, whichever frontmatter fields you choose. <code>all-pages.md</code> keeps a source line for each page.</p>
    <h2>Keep the settings</h2><p>Open <strong>Saved profiles</strong>, enter a <strong>Profile name</strong> such as “Platform docs metadata” and choose <strong>Save current output settings</strong>. Profiles store custom metadata values, so do not put secrets in them. See <a href="../markdown-export-profiles/">export profiles</a>.</p>
    <h2>Sample files</h2>${samples([
      ['metadata/ENG-1001-custom-metadata-2026-11-02.zip', 'Five pages with trimmed fields and three custom fields.'],
    ])}
    ${related([link('confluence-to-ai-context', 'Prepare AI context'), link('confluence-markdown-to-mkdocs', 'Build an MkDocs site'), ref('presets', 'Presets and metadata reference')])}${BOUNDARY}`,
  },
  {
    slug: 'markdown-export-profiles', group: 'how', card: 'Save named output settings, reuse them for monthly exports, and replace or delete them.',
    title: 'How to save Markdown export profiles for repeat exports',
    heading: 'Save export profiles for repeatable monthly or project exports',
    description: 'Save named Flint Markdown Export output settings, reuse them for monthly or project exports, and replace or delete profiles you no longer need.',
    lede: 'Set up output settings once, give them a name, and get the same files every time you export.',
    body: () => `${result('Finished result', 'Two named profiles, “Engineering Git” and “Project context”, that restore output settings in one step. You still choose the pages each time.')}
    <h2>What a profile keeps</h2>${table('Profile contents', ['Saved in a profile', 'Chosen each time'], [
      ['Preset, page links, panels and filename pattern', 'Source, space and selected pages'],
      ['Add YAML frontmatter and the frontmatter fields', '<strong>Include other attachments</strong>'],
      ['Custom metadata values', '<strong>In this window</strong> or <strong>In background</strong>'],
      ['', 'A previous manifest for comparison'],
    ])}<p>Profiles do not schedule exports. A recurring export is a task you repeat, using the profile to keep its output consistent.</p>
    <h2>Create the profiles</h2><ol><li>Open <strong>Apps → Export to Markdown</strong> on any page. Choose <strong>Git documentation</strong> and, in <strong>Advanced settings</strong>, enter <code>team=Platform</code> under <strong>Custom metadata</strong>.</li><li>Choose <strong>Saved profiles</strong> in the header. Under <strong>My output profiles</strong>, enter <strong>Profile name</strong> “Engineering Git” and choose <strong>Save current output settings</strong>.</li><li>Choose <strong>Back to selection</strong>, choose <strong>AI context</strong>, clear <code>author</code> and <code>last_updated_by</code> under <strong>Frontmatter fields</strong>, and save a second profile named “Project context”.</li></ol>
    <h2>Use a profile next month</h2><ol><li>Open the root page, choose <strong>Apps → Export to Markdown</strong> and the source you need.</li><li>Choose <strong>Saved profiles</strong>, then <strong>Use profile</strong> beside “Engineering Git”. The workspace returns to selection with the saved settings and custom metadata restored.</li><li>Set <strong>Include other attachments</strong>, which the profile does not store.</li><li>Optionally load last month’s <code>manifest.json</code> under <strong>Compare with a previous export</strong>; see <a href="../compare-confluence-markdown-exports/">comparing exports</a>.</li><li>Export as usual.</li></ol><p>If you choose a preset after loading a profile, the preset replaces the loaded output settings; custom metadata text is kept.</p>
    <h2>Replace or delete a profile</h2><ul><li><strong>Replace:</strong> change the settings, enter the same profile name and choose <strong>Save current output settings</strong>. The profile with that name is replaced.</li><li><strong>Delete:</strong> choose <strong>Delete</strong> beside it. Other profiles are unaffected.</li></ul>
    <h2>Limits</h2><ul><li>Each person can keep up to 20 profiles. Saving a 21st shows <code>Keep up to 20 profiles. Delete one before adding another.</code></li><li>Names are 1 to 60 printable characters.</li><li>Profiles belong to you. Colleagues do not see your profiles; to share settings, agree the values and save the same profile in each account.</li><li>Profiles stay until you delete them and are stored in Atlassian-hosted Forge storage. They include custom metadata values, so keep secrets out of them.</li></ul>
    <p class="me-tested">This guide describes the released profile controls; it does not include downloadable output, because a profile changes settings rather than files.</p>
    ${related([link('confluence-markdown-yaml-metadata', 'Customize YAML metadata'), link('confluence-to-git', 'Export to a Git repository'), ref('history', 'History and profiles reference')])}`,
  },
  {
    slug: 'background-confluence-export', group: 'how', card: 'Queue a background job, keep its job ID, and come back to download or cancel it within an hour.',
    title: 'How to run a Confluence Markdown export in the background',
    heading: 'Start a background export and retrieve it later',
    description: 'Queue a Flint Markdown Export background job, keep its job ID, and return through History to refresh, download or cancel it within one hour.',
    lede: 'Let a larger export run on Atlassian infrastructure while you close the window, then come back for the ZIP.',
    body: () => `${result('Finished result', 'A queued job whose ID you saved, a status you can refresh, and a ZIP downloaded before the job expires, one hour after it was created.')}
    <h2>When to use it</h2><p>A browser export prepares everything in the current window and needs your device’s memory for the files and the ZIP. A background export runs in Atlassian-hosted Forge functions as you, using your Confluence permissions, so you can close the window. It does not raise any limit: the 500-page collection cap, 75 MiB per file and 300 MiB of attachments still apply, and each job has a 15-minute execution limit.</p>
    <h2>Start the job</h2><ol><li>Choose the source, pages and output settings as usual.</li><li>In the footer, change <strong>Run export</strong> from <strong>In this window</strong> to <strong>In background</strong>.</li><li>Choose <strong>Start background export</strong>. The footer shows <strong>Queueing background export…</strong>, then the <strong>Background export</strong> view opens.</li><li>Copy the value in <strong>Export job ID</strong> and keep it somewhere you can find it. It is the only way back to this job.</li></ol><p><strong>Prepare full preview</strong> always runs in the current window. Preview there first if you need to inspect the output, then start the background job.</p>
    <h2>Come back to it</h2><ol><li>Open <strong>Apps → Export to Markdown</strong> again and choose <strong>History</strong>, then <strong>Find background export</strong>.</li><li>Paste the job ID into <strong>Export job ID</strong> and choose <strong>Refresh status</strong>.</li><li>The status is <code>queued</code>, <code>running</code>, <code>ready</code>, <code>failed</code> or <code>cancelled</code>. While it runs, refresh again; Flint does not send a notification.</li><li>When the status is <code>ready</code>, the view shows the page and warning counts and the expiry time. Choose <strong>Download ZIP</strong>, then inspect <code>manifest.json</code> for warnings and omissions.</li></ol><p>To stop a queued or running job, choose <strong>Cancel export</strong>. Cancelling deletes any file the job had started to create.</p>
    <h2>Expiry, access and failures</h2>${table('Background export outcomes', ['Situation', 'What you see', 'What to do'], [
      ['More than one hour since you started the job', '<code>Export job is not available.</code>', 'Start a new export. Download soon after a job is ready.'],
      ['The job could not finish', '<code>Export could not be completed. Check permissions and try a smaller scope.</code>', 'Check you can read the pages, then retry with fewer pages or attachments.'],
      ['The job ran out of time', '<code>Export was interrupted before it completed. Try again with a smaller scope.</code>', 'Split the export into smaller branches; see <a href="../export-large-confluence-space/">batch exports</a>.'],
      ['You lost access to an exported page', 'The download is refused', 'Restore access or export again without that page.'],
    ])}<p>Only the person who started a job can use its ID; administrators cannot open someone else’s job. Before a download, Flint checks again that you can still see each exported page and pages inlined by include macros. Rendered macros can reference additional sources beyond those checks. A ZIP you have already downloaded cannot be revoked; handle it under your organization’s policies.</p>
    <h2>In your history</h2><p>A finished background export is recorded in <strong>History</strong> with the source <code>server-generated</code>. History keeps the details, not the ZIP; after the job expires the archive is gone. See <a href="../markdown-export-history/">export history</a>.</p>
    <p class="me-tested">This guide describes the released background controls and messages. It does not include a recorded job; job IDs and expiry times are specific to each request.</p>
    ${related([link('export-large-confluence-space', 'Export a large space in batches'), link('markdown-export-history', 'Find export history'), ref('background', 'Background exports reference')])}`,
  },
  {
    slug: 'confluence-markdown-links-filenames', group: 'how', card: 'See how title, ID and title-plus-ID filenames behave after a rename and a move.',
    title: 'How to keep Markdown links and filenames stable across exports',
    heading: 'Keep page links and filenames predictable across repeat exports',
    description: 'Compare title, page-ID and title-plus-ID filenames before and after a Confluence rename and move, and see how links to unselected pages behave.',
    lede: 'Pick a filename pattern whose paths survive the changes your pages actually go through.',
    body: () => `${result('Finished result', 'Real paths for four filename patterns before and after one rename and one move, so you can see which pattern keeps which path stable.')}
    <h2>The example changes</h2><p>The five-page handbook was exported twice in Standard Markdown with different <strong>Filename pattern</strong> values under <strong>Advanced settings</strong>. Between the exports, <strong>Architecture overview</strong> (1004) was renamed <strong>System architecture</strong>, and <strong>First week</strong> (1003) moved from Onboarding to the handbook root.</p>
    ${table('Paths before and after a rename and a move', ['Pattern', 'Renamed page 1004', 'Moved page 1003'], [
      ['<code class="me-token">{title}</code>', '<code>engineering-handbook/architecture-overview.md</code> → <code>engineering-handbook/system-architecture.md</code>', '<code>engineering-handbook/onboarding/first-week.md</code> → <code>engineering-handbook/first-week.md</code>'],
      ['<code class="me-token">{id}</code>', '<code>1001/1004.md</code> (unchanged)', '<code>1001/1002/1003.md</code> → <code>1001/1003.md</code>'],
      ['<code class="me-token">{title}-{id}</code>', '<code>…/architecture-overview-1004.md</code> → <code>…/system-architecture-1004.md</code>', '<code>…/onboarding-1002/first-week-1003.md</code> → <code>…/first-week-1003.md</code>'],
      ['<code class="me-token">{date}-{title}</code>', '<code>…/2026-10-08-architecture-overview.md</code> → <code>…/2026-11-03-system-architecture.md</code>', '<code>…/2026-10-08-onboarding/2026-10-08-first-week.md</code> → <code>…/2026-10-08-first-week.md</code>'],
    ], true)}<p>What the table shows:</p><ul><li><strong>Page IDs survive renames.</strong> Only <code>{id}</code> kept the renamed page’s path.</li><li><strong>Every pattern follows the hierarchy.</strong> A move changes the directory, so the moved page’s path changed in all four patterns.</li><li><strong><code>{date}</code> changes on every edit.</strong> It uses the page’s last-updated date, so an edit renames the file. Use it for dated snapshots, not for stable paths.</li><li><strong>Title plus ID stays unique</strong> and readable, but still changes on rename.</li></ul><p>Loading the first manifest under <strong>Compare with a previous export</strong> reports these as paths changed; see <a href="../compare-confluence-markdown-exports/">comparing exports</a>.</p>
    <h2>Links to pages you did not select</h2><p>Only links between pages in the same export become relative. In a second sample, only the handbook and Architecture overview were selected. The handbook’s link to Onboarding stayed in Confluence:</p>${pre(`
Everything a new engineer needs, in one place. Start with [Onboarding](https://example.atlassian.net/wiki/spaces/ENG/pages/1002/Onboarding), then read the [Architecture overview](engineering-handbook-1001/architecture-overview-1004.md).`, 'Mixed links in a partial export')}<p>To list the links that still point to Confluence, search the extracted files for your site address, for example <code>grep -rn '](https://example.atlassian.net/wiki/' --include='*.md' .</code>. Links inside HTML tables use <code>href=</code> instead.</p>
    <h2>Filename rules</h2><ul><li>The pattern must contain <code>{title}</code> or <code>{id}</code>, may add <code>{date}</code> and fixed text, and cannot contain <code>/</code> or <code>\\</code>. An invalid pattern shows <code>Filename pattern must use {title} or {id}, with no path separators or unknown tokens.</code></li><li>Names become lowercase with hyphens, up to 80 characters, keeping letters from any script.</li><li>Siblings with the same name get the page ID appended, so two pages called Notes become <code>notes-&lt;id&gt;.md</code>.</li><li>The page list shows each page’s filename under its title as you edit the pattern.</li><li>Unselected parent pages remain as directories without their own file.</li></ul>
    <h2>Choose for your destination</h2><ul><li><strong>Git repository or documentation site:</strong> <code>{id}</code>, as in the Git documentation preset. Diffs stay small and renames do not break links.</li><li><strong>Obsidian or a folder people browse:</strong> <code>{title}-{id}</code>. Readable and unique.</li><li><strong>One-off handoff:</strong> <code>{title}</code>. Easiest to read when nobody depends on the paths later.</li></ul><p>Destinations still render links their own way: Obsidian follows wikilinks, and MkDocs turns <code>.md</code> links into page addresses. Test the destination after a change of pattern.</p>
    <h2>Sample files</h2>${samples([
      ['filenames/handbook-partial-title-id.zip', 'Two of five pages selected, title plus ID filenames, with a link that stays in Confluence.'],
    ])}
    ${related([link('confluence-to-git', 'Export to a Git repository'), link('confluence-markdown-to-mkdocs', 'Build an MkDocs site'), ref('presets', 'Filename tokens reference')])}${BOUNDARY}`,
  },
  {
    slug: 'select-confluence-pages-to-export', group: 'how', card: 'Use branch checkboxes, search, Select all matches and Selected only, then verify the page IDs.',
    title: 'How to select exactly the Confluence pages to export',
    heading: 'Select exactly the Confluence pages you want to export',
    description: 'Use branch checkboxes, title search, Select all matches and Selected only in Flint Markdown Export, then confirm the final page IDs in the manifest.',
    lede: 'Choose pages from a branching tree without accidentally adding, or missing, the pages under them.',
    body: () => `${result('Finished result', 'Five chosen pages from a nine-page tree, including one page that search hid, confirmed by page ID in <code>manifest.json</code>.')}
    <h2>Example tree</h2>${pre(`
Release handbook (3001)
  Planning (3002)
    Release calendar (3003)
    Capacity notes (3004)
  Shipping (3005)
    Release checklist (3006)
      Rollback steps (3007)
    Hotfix releases (3008)
  Retrospectives (3009)`, 'Example page tree')}<p>The goal: export the release-related pages and the rollback steps under the checklist, but not Planning, Shipping, Capacity notes or Retrospectives.</p>
    <h2>Walk through the selection</h2><ol><li>Open Release handbook, choose <strong>Apps → Export to Markdown</strong> and <strong>This page and descendants</strong>. All nine pages start selected. Choose <strong>Clear selection</strong>.</li><li>Type <code>release</code> in <strong>Search pages…</strong>. The tree shows Release handbook, Planning, Release calendar, Shipping, Release checklist and Hotfix releases. Planning and Shipping do not match; they stay visible as parents. Rollback steps is hidden, and branches cannot be collapsed while a search is active.</li><li>Choose <strong>Select all matches</strong>. It adds the four matching titles only: 3001, 3003, 3006 and 3008. Hidden Rollback steps is not added.</li><li>Release checklist’s checkbox now shows a mixed state, because one page in its branch is unselected. Tick it: branch checkboxes include descendants, even those hidden by search, so Rollback steps (3007) is added.</li><li>Clear the search and turn on <strong>Selected only</strong>. The tree shows the five selected pages with Planning and Shipping as context. The footer reads <strong>5 pages selected</strong>.</li><li>Click a title, such as Rollback steps, to inspect it. Inspecting does not change the selection; <strong>Prepare page preview</strong> prepares that page alone.</li><li>Choose <strong>Review selection</strong> to see the list of selected titles, then export.</li></ol>
    <h2>Check the result</h2><p>The manifest lists exactly the selected pages: <code>jq -r '.pages[].page_id' manifest.json</code> prints 3001, 3003, 3006, 3007 and 3008. Planning and Shipping were not selected, so they appear only as directories that keep the hierarchy:</p>${pre(`
release-handbook/
  release-handbook.md
  release-handbook/
    planning/
      release-calendar.md
    shipping/
      hotfix-releases.md
      release-checklist.md
      release-checklist/
        rollback-steps.md
  all-pages.md
  manifest.json`, 'Files in the selected export')}
    <h2>Useful details</h2><ul><li>Search matches page titles, not page content.</li><li>With an empty search, the button reads <strong>Select all pages</strong>.</li><li>Unticking a branch checkbox removes the whole branch, including hidden pages. Use <strong>Selected only</strong> to review before exporting.</li><li>For a space, choose <strong>Pages from a space</strong> and the space in <strong>Space</strong>. Confluence folders appear with their page counts; they provide hierarchy rather than exported content.</li><li>The page list includes only pages you can read, and collecting more than 500 pages stops before selection. See <a href="../export-large-confluence-space/">batch exports</a>.</li></ul>
    <h2>Sample files</h2>${samples([
      ['selection/ENG-release-handbook-2026-11-03.zip', 'The five selected pages from the example tree.'],
      ['selection/manifest.json', 'Its manifest, with the five page IDs.'],
    ])}
    ${related([link('confluence-markdown-links-filenames', 'Links and filenames'), link('check-confluence-markdown-snapshot', 'Check a snapshot'), ref('choose', 'Choose pages reference')])}${BOUNDARY}`,
  },
  {
    slug: 'markdown-export-history', group: 'how', card: 'Search loaded history, inspect settings and warnings, and understand admin views and retention.',
    title: 'How to find and manage Confluence Markdown export history',
    heading: 'Find and manage export history as a user or Confluence administrator',
    description: 'Search loaded Flint Markdown Export history, load older entries, inspect settings and warnings, and understand administrator views and 90-day retention.',
    lede: 'Find out who exported what, with which settings, and clear the records you no longer need.',
    body: () => `${result('Finished result', 'You can find a past export by page, space or exporter, read its settings and warning count, and delete entries, knowing what history does and does not keep.')}
    <h2>Open your history</h2><ol><li>In the export window, choose <strong>History</strong> in the header. The <strong>Export history</strong> view lists your exports, newest first.</li><li>Each row shows <strong>Date / exporter</strong>, <strong>Space / scope</strong>, <strong>Pages / files</strong> with the archive size, and <strong>Details</strong>.</li><li>Type in <strong>Search loaded history</strong> to filter by page title, page ID, space, exporter or source. The count line reads, for example, <strong>3 matching entries from 20 loaded. Load more to search older entries.</strong></li><li>Search only covers loaded entries. Choose <strong>Load more</strong> to fetch the next 20, then search again.</li></ol>
    <h2>Read an entry’s details</h2><p>Expand <strong>Details</strong>. The summary shows the warning count and the source. An entry for the handbook export in the <a href="../confluence-to-git/">Git guide</a> would contain:</p>${table('Illustrative history entry', ['Detail', 'Example'], [
      ['Summary', '1 warning · browser-reported'],
      ['Root', 'Root: 1001. ZIP export.'],
      ['Settings', 'Markdown links · blockquote panels · Front matter on · Other attachments excluded'],
      ['Filename', '<code>{id}</code>'],
      ['Metadata', 'The frontmatter field names, and the names (not values) of custom fields'],
      ['Pages', 'Engineering Handbook (1001) · ENG, and the other four pages'],
    ])}<p>This table is illustrative, assembled from the fields history records; it is not a screenshot.</p><p>Exports built in the browser are labeled <code>browser-reported</code>; background exports are <code>server-generated</code>. A browser export is recorded when the ZIP is built, not when you only prepare a preview. If recording fails, the summary says <strong>The export is ready, but its history entry could not be saved.</strong></p>
    <h2>What history keeps</h2><ul><li><strong>Kept:</strong> your account and display name, time, scope and root, page titles and IDs, space, output settings, counts, archive size, warning count and source.</li><li><strong>Not kept:</strong> page content, attachment files, custom metadata values or the ZIP. History is activity metadata, not an archive and not a complete audit log.</li><li><strong>Shortened:</strong> very long titles and space names can be shortened in history; <strong>Long titles or space keys are shortened in history. The export retains the full values.</strong></li><li><strong>Older entries:</strong> some may say <strong>Settings were not recorded for this older export.</strong></li></ul>
    <h2>Delete entries</h2><ul><li><strong>Delete entry</strong> removes one row.</li><li><strong>Clear my history</strong> asks you to confirm: <strong>Delete your history entries, including entries not loaded here? Profiles and downloaded files are kept. This cannot be undone.</strong> Choose <strong>Confirm clear history</strong> or <strong>Keep history</strong>.</li></ul>
    <h2>For Confluence administrators</h2><p>Administrators also see <strong>Show exports from all users (administrator)</strong>. Turning it on loads everyone’s entries, which an administrator can inspect and delete. The clear button then reads <strong>Clear all users’ history</strong>. Other users do not see this control and only ever see their own entries.</p>
    <h2>Retention</h2><p>Entries become unavailable after 90 days and are removed by scheduled cleanup. To keep a longer record of an export, keep its <code>manifest.json</code> with your own records; see <a href="../check-confluence-markdown-snapshot/">checking a snapshot</a>. Saved profiles are separate and remain until deleted.</p>
    <p class="me-tested">This guide describes the released history view. It does not include screenshots or downloadable history, because entries belong to each site and person.</p>
    ${related([link('background-confluence-export', 'Background exports'), link('markdown-export-profiles', 'Export profiles'), ref('history', 'History reference'), '<a href="../../privacy/">Privacy policy</a>'])}`,
  },
  {
    slug: 'check-confluence-markdown-snapshot', group: 'check', card: 'Reconcile intended pages with the manifest, test links and files, and record the snapshot.',
    title: 'How to check a Confluence Markdown export before relying on it',
    heading: 'Check a Markdown export before treating it as a dependable snapshot',
    description: 'Reconcile intended pages with manifest.json, investigate skipped pages and omissions, test links and files, and record the snapshot’s date and scope.',
    lede: 'Confirm an export contains what you meant to keep before you file it as the copy of record.',
    body: () => `${result('Finished result', 'A short record showing that four of five intended pages were exported, that one could not be read, and that the snapshot was not accepted until it is exported again.')}
    <h2>Example: one page missing</h2><p>A maintainer means to keep all five handbook pages (1001 to 1005). When the export runs, Release checklist (1005) cannot be read, so the summary names it as a page that could not be read and it is not in the ZIP. It is easy to miss in a quick glance at the files, which is why the checks below start from the manifest.</p>
    <h2>Run the checks</h2><p>Run these from the export’s top folder. They were tested with jq 1.7.1 in zsh and bash.</p><ol><li><strong>Count the pages.</strong> <code>jq '.pages | length' manifest.json</code> prints <code>4</code>.</li><li><strong>Compare with what you intended.</strong> List the page IDs you meant to export and compare:</li></ol>${pre(`
comm -23 <(printf '%s\\n' 1001 1002 1003 1004 1005 | sort) <(jq -r '.pages[].page_id' manifest.json | sort)`, 'Compare intended and exported page IDs')}<p>The output, <code>1005</code>, is the intended page that is not in the export.</p><ol start="3"><li><strong>Read the skipped and limits lists.</strong> <code>jq -c '.skipped[]' manifest.json</code> explains the gap:</li></ol>${pre('{"id":"1005","title":"Release checklist","type":"page","reason":"could not be read"}', 'Skipped entry in manifest.json')}<p><code>jq -c '.limits[]' manifest.json</code> lists files left out for size; here it prints nothing.</p><ol start="4"><li><strong>Read page warnings.</strong> <code>jq -r '.pages[] | select(.warnings | length > 0) | "\\(.title): \\(.warnings | join("; "))"' manifest.json</code> prints any conversion warnings by page. Read <a href="../confluence-markdown-export-warnings/">what each warning means</a>.</li><li><strong>Check that listed files exist.</strong></li></ol>${pre(`
jq -r '.pages[].assets[]' manifest.json | while read -r f; do test -f "$f" && echo "ok $f" || echo "missing $f"; done`, 'Check asset files exist')}${pre('ok engineering-handbook/architecture-overview.assets/system-overview.svg', 'Asset check output')}<ol start="6"><li><strong>Find links that still open Confluence.</strong> Search for your site address, for example <code>grep -rn '](https://example.atlassian.net/wiki/' --include='*.md' .</code>. These lead to unselected pages and need Confluence access.</li><li><strong>Open representative files</strong> in the tool you will use: one with images, one with a table, one deep in the hierarchy. Follow a few links.</li><li><strong>Look for permission-sensitive content.</strong> The export contains what the exporting person could read. Check nothing is included that the snapshot’s readers should not see.</li></ol>
    <h2>Record the snapshot</h2><p>Write down what you checked, next to the ZIP. Useful facts from <code>manifest.json</code> are <code>exported</code>, <code>site</code>, <code>root_page_id</code>, <code>scope</code> and <code>options</code>. Its <code>generator</code> value identifies the export format, not the Marketplace version. The record below was written for this guide; Flint does not create it.</p>
    <h2>Sample files</h2>${samples([
      ['snapshot-check/ENG-engineering-handbook-2026-11-03.zip', 'The export with one page that could not be read.'],
      ['snapshot-check/manifest.json', 'Its manifest, including the skipped entry.'],
      ['snapshot-check/snapshot-record.md', 'An illustrative record of the checks and the decision.'],
    ])}
    <h2>A snapshot is not a backup</h2><p>A Markdown export is a readable copy of page content, not a way to restore Confluence. Flint does not import files back into Confluence. The export does not contain page history, comments or page restrictions. Some macros become markers, attachments are subject to size limits, and whiteboards and databases are skipped. Use your site’s own backup arrangements for recovery, and keep snapshots for reading, review and handoff.</p>
    ${related([link('compare-confluence-markdown-exports', 'Compare two exports'), link('confluence-onboarding-handoff-export', 'Hand over a dated snapshot'), ref('limits', 'Limits reference'), ref('data', 'Where your data goes')])}${BOUNDARY}`,
  },
  {
    slug: 'confluence-markdown-to-mkdocs', group: 'use', card: 'Build and preview an MkDocs site from a Git documentation export, and test the details that break.',
    title: 'How to turn Confluence Markdown into an MkDocs site',
    heading: 'Turn exported Confluence Markdown into a documentation website',
    description: 'Build an MkDocs documentation site from a Flint Markdown Export Git documentation export, with tested navigation, assets, YAML, links and complex tables.',
    lede: 'Use a Git documentation export as the source of a static documentation site, and test the parts that need attention.',
    body: () => `${result('Finished result', 'A local MkDocs site with the five handbook pages in a navigation menu, working page links and images, task-list checkboxes, and one known link to fix inside a merged-cell table.')}
    <p class="me-tested">Tested on 2026-11-03 with MkDocs 1.6.1, pymdown-extensions 12.3 and Python-Markdown 3.11.2, following the <a href="https://www.mkdocs.org/user-guide/configuration/">MkDocs configuration documentation</a>. Flint does not install, configure or publish MkDocs; those steps belong to MkDocs and your hosting.</p>
    <h2>Part 1: export with Flint</h2><ol><li>Export the handbook tree with the <strong>Git documentation</strong> preset, as in <a href="../confluence-to-git/">moving Confluence docs into Git</a>. Page-ID paths keep the site’s addresses stable when titles change.</li><li>Review the warnings. The sample’s Release checklist has a Jira issue list that is not exported.</li><li>Download the ZIP. The sample is <code>ENG-1001-2026-11-03.zip</code>.</li></ol>
    <h2>Part 2: set up MkDocs</h2><p>Arrange the project so the exported folder can be replaced on each refresh while your own files stay outside it:</p>${pre(`
mkdocs.yml            your configuration
docs/
  index.md            your home page
  handbook/           the extracted export (replace on refresh)
    1001.md
    1001/1002.md
    1001/1002/1003.md
    1001/1004.md
    1001/1004.assets/system-overview.svg
    1001/1005.md
    all-pages.md
    manifest.json`, 'MkDocs project layout')}${pre(`
mkdir -p docs
unzip -q ~/Downloads/ENG-1001-2026-11-03.zip -d docs
mv docs/1001 docs/handbook`, 'Commands to extract the export into docs')}<p>The <code>mkdocs.yml</code> used for the test gives the pages readable titles in the menu, keeps the combined file and manifest out of the site, turns on task-list checkboxes and reports broken links:</p>${pre(`
site_name: Team documentation
nav:
  - Home: index.md
  - Engineering Handbook:
      - Overview: handbook/1001.md
      - Onboarding: handbook/1001/1002.md
      - First week: handbook/1001/1002/1003.md
      - Architecture overview: handbook/1001/1004.md
      - Release checklist: handbook/1001/1005.md
exclude_docs: |
  /handbook/all-pages.md
  /handbook/manifest.json
markdown_extensions:
  - pymdownx.tasklist
validation:
  links:
    not_found: warn
    anchors: warn
    unrecognized_links: warn`, 'mkdocs.yml used in the test')}<p>Build with strict checking, then preview locally. The test ran MkDocs through uv without a permanent install; with MkDocs and pymdown-extensions installed another way, run <code>mkdocs build --strict</code> and <code>mkdocs serve</code> directly.</p>${pre(`
uvx --from mkdocs --with pymdown-extensions mkdocs build --strict
uvx --from mkdocs --with pymdown-extensions mkdocs serve`, 'Build and preview commands')}<p>The strict build finished without warnings, and <code>mkdocs serve</code> serves the preview at <code>http://127.0.0.1:8000/</code>.</p>
    <h2>What worked, and what needs attention</h2>${table('MkDocs test results', ['Exported content', 'Result in MkDocs'], [
      ['YAML frontmatter', 'Read as page metadata and not shown on the page. Titles in the menu come from <code>nav</code>.'],
      ['Relative Markdown links', 'Rewritten to page addresses, such as <code>1002/</code>. Broken ones are reported by the strict build.'],
      ['Images in <code>.assets</code> folders', 'Displayed; the relative paths are adjusted for each page’s address.'],
      ['Blockquote panels', 'Displayed as quotes with a bold label, such as <strong>Warning:</strong>.'],
      ['Task lists', 'Checkboxes with <code>pymdownx.tasklist</code>; without it, <code>[x]</code> and <code>[ ]</code> appear as text.'],
      ['Merged-cell HTML table', 'The table displays, but the link inside it keeps <code>href="1002.md#before-day-one"</code>. MkDocs does not rewrite links in raw HTML, so it leads to a missing page, and the strict build does not report it.'],
      ['Jira issue list', 'An HTML comment marker, not visible on the page.'],
    ])}<p>Find links inside HTML before you publish, from the project root: <code>grep -rn 'href="[^"]*\\.md' docs/handbook</code>. Then either simplify the table in Confluence so it exports as a Markdown table, whose links MkDocs does rewrite, or accept that the link needs fixing after each export.</p>
    <h2>Refreshing the site</h2><ul><li>Replace <code>docs/handbook</code> with each new export; keep <code>mkdocs.yml</code> and <code>index.md</code> outside it.</li><li>A new page that is not in <code>nav</code> still builds; MkDocs mentions it in an informational message. Add it to the menu.</li><li>When a page moves in Confluence, its path changes and the old <code>nav</code> entry points to a missing file. The strict build stops with a warning until you update <code>nav</code>.</li><li>Use <a href="../compare-confluence-markdown-exports/">export comparison</a> to see added, moved and missing pages before you edit the menu.</li></ul>
    <h2>Sample files</h2>${samples([
      ['git-handbook/ENG-1001-2026-11-03.zip', 'The Git documentation export used for the site.'],
      ['mkdocs/mkdocs.yml', 'The MkDocs configuration from the test.'],
      ['mkdocs/index.md', 'The home page placed outside the exported folder.'],
    ])}
    <h2>Limits</h2><ul><li>Publishing the built site, access control and hosting are outside Flint. A public site exposes everything in the export; Confluence permissions do not carry over.</li><li>Only MkDocs with the configuration above was tested. Themes, plugins and other site generators handle HTML tables, callouts and links differently.</li><li>Page-ID addresses such as <code>/handbook/1001/1002/</code> are stable but not descriptive. A title-based filename pattern gives readable addresses that change on rename.</li></ul>
    ${related([link('confluence-to-git', 'Export to a Git repository'), link('confluence-markdown-links-filenames', 'Links and filenames'), ref('presets', 'Presets reference')])}${BOUNDARY}`,
  },
];

const groups = [
  ['use', 'Use cases', 'Complete workflows for a destination or audience.'],
  ['how', 'How-tos', 'Techniques you can reuse across exports.'],
  ['check', 'Checks and troubleshooting', 'Make sure an export contains what you expect.'],
];
const obsidianCard = '<a class="guide-card" href="../confluence-to-obsidian/"><h3>Take Confluence pages into Obsidian</h3><p>Choose pages, review a Markdown export, and check the notes in a vault.</p><span class="text-link">Read the guide <span aria-hidden="true">→</span></span></a>';
const card = guide => `<a class="guide-card" href="../${guide.slug}/"><h3>${guide.heading}</h3><p>${guide.card}</p><span class="text-link">Read the guide <span aria-hidden="true">→</span></span></a>`;

export const markdownExportGuides = {
  'guides/markdown-export/index.html': {
    title: 'Flint Markdown Export guides',
    description: 'Use cases and how-tos for Flint Markdown Export: Confluence to Git, AI context, MkDocs, handoffs, metadata, comparisons, warnings and large spaces.',
    ogImage: '/assets/social/markdown-export.png',
    body: `${STYLES}<article class="me-guide me-index product-page"><p class="eyebrow">FLINT MARKDOWN EXPORT · GUIDES</p><h1>Markdown export guides</h1><p class="lede">Practical walkthroughs for taking Confluence pages into Git, AI tools, documentation sites and handoffs, with sample files you can download.</p><p>Each guide uses fictional pages and the released app’s labels. For every setting and limit in one place, read the <a href="${PRODUCT}">Flint Markdown Export guide</a>, or <a href="${DEMO}">try the interactive demo</a>.</p>
    ${groups.map(([key, heading, intro]) => `<section class="me-group" aria-labelledby="group-${key}"><h2 id="group-${key}">${heading}</h2><p>${intro}</p><div class="guide-cards">${key === 'use' ? obsidianCard : ''}${guides.filter(guide => guide.group === key).map(card).join('')}</div></section>`).join('')}
    <p class="related-guide">Working with tables instead? See <a href="../filter-confluence-tables/">how to filter a Confluence table</a> or <a href="../">all guides</a>.</p></article>`,
  },
  ...Object.fromEntries(guides.map(guide => [`guides/${guide.slug}/index.html`, {
    title: guide.title,
    description: guide.description,
    ogImage: '/assets/social/markdown-export.png',
    body: page({ kind: { use: 'USE CASE', how: 'HOW-TO', check: 'CHECK' }[guide.group], title: guide.heading, lede: guide.lede, body: guide.body() }),
  }])),
};
