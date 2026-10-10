const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
// Columns above this many distinct values get no dropdown; the search box covers them.
const MAX_FILTER_VALUES = 50;
const TEXTBLOCKS = new Set(['paragraph', 'heading', 'codeBlock', 'taskItem', 'decisionItem']);

function isoDate(timestamp) {
  const date = new Date(Number(timestamp));
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
}

// Inline atoms are padded with spaces so adjacent atoms stay separate words; cellText collapses the extra whitespace.
function nodeText(node) {
  // Null nodes in malformed ADF read as empty, so one bad cell cannot crash the macro.
  if (!node) return '';
  const attrs = node.attrs ?? {};
  switch (node.type) {
    case 'text':
      return node.text ?? '';
    case 'status':
    case 'mention':
      return ` ${attrs.text ?? ''} `;
    case 'date':
      return ` ${isoDate(attrs.timestamp)} `;
    case 'emoji':
      return ` ${attrs.text || attrs.shortName || ''} `;
    case 'inlineCard':
    case 'blockCard':
    case 'embedCard':
      return ` ${attrs.url ?? ''} `;
    case 'hardBreak':
      return ' ';
  }
  const separator = TEXTBLOCKS.has(node.type) ? '' : ' ';
  return (node.content ?? []).map(nodeText).join(separator);
}

export function cellText(node) {
  return nodeText(node).replace(/\s+/g, ' ').trim();
}

const isMerged = (cell) => (cell?.attrs?.colspan ?? 1) > 1 || (cell?.attrs?.rowspan ?? 1) > 1;
// Malformed rows (no content, or null cells) read as empty instead of crashing the macro.
const cellsOf = (row) => row.content ?? [];

export function parseTable(body) {
  const content = body?.content ?? [];
  const tableIndex = content.findIndex((node) => node?.type === 'table');
  if (tableIndex === -1) return null;
  const [header, ...rest] = content[tableIndex].content ?? [];
  if (!header) return null;
  // Null rows have no cells to show, and keeping them would hand null to the renderer.
  const rowNodes = rest.filter(Boolean);

  const width = cellsOf(header).length;
  const rows = rowNodes.map((node) => ({
    node,
    cells: Array.from({ length: width }, (_, i) => (cellsOf(node)[i] ? cellText(cellsOf(node)[i]) : '')),
  }));
  const columns = cellsOf(header).map((cell, i) => {
    const values = [...new Set(rows.map((row) => row.cells[i]))].sort(collator.compare);
    const filterable = values.length < rows.length && values.length <= MAX_FILTER_VALUES;
    return { name: cellText(cell) || `Column ${i + 1}`, filterValues: filterable ? values : null };
  });
  const hasMergedCells = [header, ...rowNodes].some((row) => cellsOf(row).some(isMerged));

  return { tableIndex, columns, rows, hasMergedCells };
}

// Comma groups must be exactly three digits, so "1,5" (a decimal comma) stays text rather than reading as 15.
const NUMBER = /^[-+]?[$€£]?(\d{1,3}(,\d{3})+|\d+)(\.\d+)?%?$/;
const toNumber = (text) => (NUMBER.test(text) ? Number(text.replace(/[^\d.-]/g, '')) : null);

// Numeric cells order by value and come before text cells, which keeps the order total in mixed columns.
function compareCells(a, b) {
  const x = toNumber(a);
  const y = toNumber(b);
  if (x !== null && y !== null) return x - y;
  if (x !== null || y !== null) return x !== null ? -1 : 1;
  return collator.compare(a, b);
}

export function applyView(parsed, { search = '', filters = {}, sort = null } = {}) {
  const needle = search.trim().replace(/\s+/g, ' ').toLowerCase();
  const active = Object.entries(filters).filter(([, values]) => values.length > 0);
  const visible = parsed.rows.filter(
    (row) =>
      (!needle || row.cells.some((cell) => cell.toLowerCase().includes(needle))) &&
      active.every(([column, values]) => values.includes(row.cells[column])),
  );
  if (sort) {
    const direction = sort.direction === 'DESC' ? -1 : 1;
    visible.sort((a, b) => {
      const x = a.cells[sort.column];
      const y = b.cells[sort.column];
      // Blank cells stay at the bottom in both directions, as spreadsheets do.
      if (!x || !y) return (x ? 0 : 1) - (y ? 0 : 1);
      return direction * compareCells(x, y);
    });
  }
  return visible;
}

// Apply search, filters and sorting to all rows before taking the current page.
export function paginateRows(rows, requestedIndex = 0) {
  const pageSize = 50;
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const index = Number.isFinite(requestedIndex) ? Math.trunc(requestedIndex) : 0;
  const pageIndex = Math.min(Math.max(0, index), pageCount - 1);
  const offset = pageIndex * pageSize;
  return {
    rows: rows.slice(offset, offset + pageSize),
    pageIndex,
    pageCount,
    start: rows.length === 0 ? 0 : offset + 1,
    end: Math.min(offset + pageSize, rows.length),
  };
}

export function toDoc(body, parsed, rows) {
  const table = body.content[parsed.tableIndex];
  const content = [...body.content];
  content[parsed.tableIndex] = { ...table, content: [table.content[0], ...rows.map((row) => row.node)] };
  return { ...body, content };
}
