import { applyView, paginateRows, parseTable } from './table.mjs';

const TASKS = [
  ['Pricing page copy', 'Marketing'], ['Release notes', 'Docs'], ['Security review', 'Engineering'],
  ['Product demo video', 'Marketing'], ['Onboarding guide', 'Docs'], ['Fix login redirect', 'Engineering'],
  ['Translate help docs', 'Docs'], ['Status page setup', 'Support'], ['Support macros', 'Support'],
  ['Search load test', 'Engineering'], ['Launch email', 'Marketing'], ['Accessibility audit', 'Design'],
  ['Empty states', 'Design'], ['New screenshots', 'Design'], ['Billing alerts', 'Finance'],
  ['Trial reconciliation', 'Finance'], ['Support training', 'Support'], ['Publish FAQ', 'Docs'],
  ['Analytics events', 'Engineering'], ['Launch webinar', 'Marketing'], ['Brand guidelines', 'Design'],
  ['Feature flag cleanup', 'Engineering'], ['Legal terms review', 'Finance'], ['Social posts', 'Marketing'],
  ['Beta feedback triage', 'Support'], ['Page performance', 'Engineering'], ['API changelog', 'Docs'],
  ['Release banner', 'Design'], ['Tax settings', 'Finance'], ['Regression suite', 'Engineering'],
  ['Customer quotes', 'Marketing'], ['Ticket cleanup', 'Support'], ['Mobile layout check', 'Design'],
  ['Roadmap page', 'Marketing'], ['Rotate API keys', 'Engineering'], ['Refund policy', 'Finance'],
  ['Proofread listing', 'Docs'], ['Partner briefing', 'Marketing'], ['Error monitoring', 'Engineering'],
  ['Retro action items', 'Support'], ['Webhook retries', 'Engineering'], ['Pricing FAQ', 'Docs'],
  ['Invoice templates', 'Finance'], ['Holiday coverage plan', 'Support'], ['Dark mode review', 'Design'],
  ['Press kit', 'Marketing'], ['Data export test', 'Engineering'], ['Glossary update', 'Docs'],
  ['Discount codes', 'Finance'], ['Escalation runbook', 'Support'], ['Icon refresh', 'Design'],
  ['Case study draft', 'Marketing'], ['Backup restore drill', 'Engineering'], ['Video captions', 'Docs'],
  ['Revenue dashboard', 'Finance'], ['Chat widget setup', 'Support'], ['Onboarding emails', 'Marketing'],
  ['Color contrast fixes', 'Design'], ['Dependency upgrades', 'Engineering'], ['Admin guide', 'Docs'],
];
const PHASES = ['Beta', 'Launch'];
const STATUSES = [['Done', 'green'], ['In progress', 'blue'], ['To do', 'neutral'], ['Blocked', 'red'], ['In review', 'purple']];
const PRIORITIES = ['High', 'Medium', 'Low'];
const START = Date.UTC(2026, 9, 1);
const DAY = 86400000;
const SEARCH_DELAY_MS = 250;

const text = (value, bold = false) => ({ type: 'text', text: value, ...(bold ? { marks: [{ type: 'strong' }] } : {}) });
const cell = (type, ...inline) => ({ type, content: [{ type: 'paragraph', content: inline }] });

// The sample table uses the document structure Confluence hands the macro, so the app's own parser reads it unchanged.
function sampleDocument() {
  const header = { type: 'tableRow', content: ['Task', 'Phase', 'Status', 'Team', 'Priority', 'Due'].map((h) => cell('tableHeader', text(h))) };
  const rows = [];
  PHASES.forEach((phase, p) => {
    TASKS.forEach(([task, team], t) => {
      const n = rows.length;
      const [label, color] = p === 0 ? STATUSES[n % 4 ? 0 : 4] : STATUSES[(n * 2) % 5];
      const priority = PRIORITIES[(t * 5 + p) % 3];
      rows.push({ type: 'tableRow', content: [
        cell('tableCell', text(task)),
        cell('tableCell', text(phase)),
        cell('tableCell', { type: 'status', attrs: { text: label, color } }),
        cell('tableCell', text(team)),
        cell('tableCell', text(priority, priority === 'High')),
        cell('tableCell', { type: 'date', attrs: { timestamp: String(START + (p * 35 + (t % 30)) * DAY) } }),
      ] });
    });
  });
  return { type: 'doc', version: 1, content: [{ type: 'table', content: [header, ...rows] }] };
}

const el = (tag, props = {}, ...children) => {
  const node = Object.assign(document.createElement(tag), props);
  node.append(...children.filter((c) => c !== null && c !== undefined));
  return node;
};
const dateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

function renderInline(node) {
  if (node.type === 'status') return el('span', { className: `lozenge lozenge-${node.attrs.color}`, textContent: node.attrs.text });
  if (node.type === 'date') return el('span', { className: 'date', textContent: dateFormat.format(new Date(Number(node.attrs.timestamp))) });
  const bold = node.marks?.some((m) => m.type === 'strong');
  return bold ? el('strong', { textContent: node.text }) : document.createTextNode(node.text ?? '');
}

const cellContent = (cellNode) => cellNode.content.flatMap((block) => (block.content ?? []).map(renderInline));

function mount(root) {
  const doc = sampleDocument();
  const parsed = parseTable(doc);
  const header = doc.content[0].content[0];
  const state = { search: '', filters: {}, sort: null, page: 0 };
  let searchTimer;

  const count = el('p', { className: 'demo-count' });
  count.setAttribute('aria-live', 'polite');
  const prev = el('button', { type: 'button', className: 'demo-button', textContent: 'Previous page' });
  const next = el('button', { type: 'button', className: 'demo-button', textContent: 'Next page' });
  const pageLabel = el('span', { className: 'demo-page-label' });
  const pager = el('div', { className: 'demo-pager' }, prev, pageLabel, next);
  const tbody = el('tbody');
  const table = el('table', { className: 'demo-table' },
    el('thead', {}, el('tr', {}, ...header.content.map((h) => el('th', { scope: 'col' }, ...cellContent(h))))), tbody);

  const search = el('input', { type: 'search', className: 'demo-input', placeholder: 'Search all columns', id: 'demo-search' });
  search.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => update({ search: search.value }), SEARCH_DELAY_MS);
  });

  const filterDetails = [];
  const filterFields = parsed.columns.flatMap((column, index) => {
    if (!column.filterValues) return [];
    const summary = el('summary', { className: 'demo-select' });
    const menu = el('div', { className: 'demo-menu' });
    column.filterValues.forEach((value) => {
      const box = el('input', { type: 'checkbox', value });
      box.addEventListener('change', () => {
        const chosen = [...menu.querySelectorAll('input:checked')].map((b) => b.value);
        update({ filters: { ...state.filters, [index]: chosen } });
      });
      menu.append(el('label', { className: 'demo-option' }, box, ` ${value || '(empty)'}`));
    });
    const details = el('details', { className: 'demo-filter' }, summary, menu);
    details.refresh = () => {
      const chosen = state.filters[index] ?? [];
      summary.replaceChildren(...(chosen.length
        ? chosen.map((v) => el('span', { className: 'demo-chip', textContent: v || '(empty)' }))
        : [el('span', { className: 'demo-any', textContent: 'Any' })]));
      summary.setAttribute('aria-label', `${column.name} filter: ${chosen.length ? chosen.join(', ') : 'Any'}`);
    };
    filterDetails.push(details);
    return [el('div', { className: 'demo-field' }, el('span', { className: 'demo-label', textContent: column.name }), details)];
  });

  const sortBy = el('select', { className: 'demo-input', id: 'demo-sort' },
    el('option', { value: '', textContent: 'Original order' }),
    ...parsed.columns.map((c, i) => el('option', { value: String(i), textContent: c.name })));
  const order = el('select', { className: 'demo-input', id: 'demo-order', disabled: true },
    el('option', { value: 'ASC', textContent: 'Ascending' }), el('option', { value: 'DESC', textContent: 'Descending' }));
  const sortChange = () => {
    order.disabled = sortBy.value === '';
    update({ sort: sortBy.value === '' ? null : { column: Number(sortBy.value), direction: order.value } });
  };
  sortBy.addEventListener('change', sortChange);
  order.addEventListener('change', sortChange);

  const field = (label, control) => el('div', { className: 'demo-field' },
    el('label', { className: 'demo-label', htmlFor: control.id, textContent: label }), control);
  const controls = el('div', { className: 'demo-controls' }, ...filterFields, field('Sort by', sortBy), field('Order', order));

  prev.addEventListener('click', () => update({ page: state.page - 1 }, false));
  next.addEventListener('click', () => update({ page: state.page + 1 }, false));
  document.addEventListener('click', (event) => {
    filterDetails.forEach((d) => { if (d.open && !d.contains(event.target)) d.open = false; });
  });

  // Any change to search, filters or sort returns to the first page, as the macro does.
  function update(change, resetPage = true) {
    Object.assign(state, change, resetPage ? { page: 0 } : {});
    const visible = applyView(parsed, state);
    const page = paginateRows(visible, state.page);
    state.page = page.pageIndex;
    count.textContent = `${visible.length} of ${parsed.rows.length} rows`;
    pager.hidden = page.pageCount < 2;
    pageLabel.textContent = `Page ${page.pageIndex + 1} of ${page.pageCount} · Rows ${page.start}–${page.end}`;
    prev.disabled = page.pageIndex === 0;
    next.disabled = page.pageIndex >= page.pageCount - 1;
    tbody.replaceChildren(...(page.rows.length
      ? page.rows.map((row) => el('tr', {}, ...row.node.content.map((c) => el('td', {}, ...cellContent(c)))))
      : [el('tr', {}, el('td', { colSpan: parsed.columns.length, className: 'demo-empty', textContent: 'No rows match. Clear a filter or the search.' }))]));
    filterDetails.forEach((d) => d.refresh());
  }

  root.replaceChildren(field('Search', search), controls, count, pager, el('div', { className: 'demo-scroll' }, table));
  update({});
}

const root = document.getElementById('table-glide-demo');
if (root) mount(root);
