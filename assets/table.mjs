const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
// Larger value sets use the paged value picker instead of a dropdown.
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
const cellsOf = (row) => row?.content ?? [];
const isEmptyCell = (cell) => !cell || (cell.content ?? []).every((block) => !block ||
  (block.type === 'paragraph' && (block.content ?? []).every((node) => !node ||
    node.type === 'hardBreak' || (node.type === 'text' && String(node.text ?? '').trim() === ''))));

// Comma groups must be exactly three digits, so a decimal comma is never silently read as thousands.
const NUMBER = /^[-+]?[$€£]?(\d{1,3}(,\d{3})+|\d+)(\.\d+)?%?$/;

const COMMA_NUMBER = /^[-+]?[$€£]?(\d{1,3}(\.\d{3})+|\d+)(,\d+)?%?$/;

export function parseNumber(text, format = 'dot') {
  const value = String(text ?? '').trim();
  if (format !== 'dot' && format !== 'comma') return null;
  if (!(format === 'comma' ? COMMA_NUMBER : NUMBER).test(value)) return null;
  const canonical = format === 'comma' ? value.replace(/\./g, '').replace(',', '.') : value;
  const number = Number(canonical.replace(/[^\d.-]/g, ''));
  return Number.isFinite(number) ? number : null;
}

export function parseDate(text, format = 'iso') {
  const value = String(text ?? '').trim();
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const local = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value);
  let year, month, day;
  if (iso) {
    [, year, month, day] = iso.map(Number);
  } else if (local && (format === 'mdy' || format === 'dmy')) {
    year = Number(local[3]);
    month = Number(local[format === 'mdy' ? 1 : 2]);
    day = Number(local[format === 'mdy' ? 2 : 1]);
  } else return null;
  if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1) return null;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= days[month - 1] ? year * 10000 + month * 100 + day : null;
}

export function relativeDateRange(condition, today) {
  const invalid = (error) => ({ from: null, to: null, error });
  const current = typeof today === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(today) ? parseDate(today) : null;
  if (current === null) return invalid("Provide today's date as a valid YYYY-MM-DD calendar date.");
  // setUTCFullYear preserves years 1 through 99, which Date.UTC treats as 1901 through 1999.
  const date = new Date(0);
  date.setUTCFullYear(Math.trunc(current / 10000), Math.trunc(current / 100) % 100 - 1, current % 100);
  let first = 0;
  let last = 0;
  switch (condition?.preset) {
    case 'today': break;
    case 'yesterday': first = last = -1; break;
    case 'tomorrow': first = last = 1; break;
    case 'last7': first = -6; break;
    case 'next7': last = 6; break;
    case 'thisWeek':
      first = -((date.getUTCDay() + 6) % 7);
      last = first + 6;
      break;
    case 'thisMonth': {
      first = 1 - date.getUTCDate();
      const end = new Date(date.getTime());
      end.setUTCMonth(end.getUTCMonth() + 1, 0);
      last = end.getUTCDate() - date.getUTCDate();
      break;
    }
    case 'lastDays':
    case 'nextDays': {
      const value = condition.value;
      const count = typeof value === 'number' ? value :
        typeof value === 'string' && /^\d+$/.test(value.trim()) ? Number(value) : NaN;
      if (!Number.isInteger(count) || count < 1 || count > 3650) return invalid('Enter a whole number of days from 1 to 3650.');
      if (condition.preset === 'lastDays') first = 1 - count;
      else last = count - 1;
      break;
    }
    default: return invalid('Choose a supported relative date preset.');
  }
  const bound = (offset) => {
    const result = new Date(date.getTime());
    result.setUTCDate(result.getUTCDate() + offset);
    const year = result.getUTCFullYear();
    return year < 1 || year > 9999 ? null : year * 10000 + (result.getUTCMonth() + 1) * 100 + result.getUTCDate();
  };
  const from = bound(first);
  const to = bound(last);
  return from === null || to === null ? invalid('The relative date range must stay within years 0001 through 9999.') : { from, to, error: null };
}

function inferType(values) {
  const populated = values.filter(Boolean);
  if (populated.length === 0) return 'text';
  if (populated.every((value) => parseNumber(value) !== null)) return 'number';
  if (populated.every((value) => parseDate(value) !== null)) return 'date';
  return 'text';
}

export function normalizeHeaderMode(value) {
  return value === 'first-row' || value === 'none' ? value : 'auto';
}

export function parseTable(body, headerMode = 'auto', tableNumber = 1) {
  headerMode = normalizeHeaderMode(headerMode);
  const content = body?.content ?? [];
  if (!Number.isSafeInteger(tableNumber) || tableNumber < 1) return null;
  const tableIndex = content.map((node, index) => node?.type === 'table' ? index : -1).filter((index) => index >= 0)[tableNumber - 1];
  if (tableIndex === undefined) return null;
  // Null rows have no cells to show, and keeping them would hand null to the renderer.
  const originalRows = (content[tableIndex].content ?? []).filter(Boolean);
  const first = originalRows[0];
  if (!first) return null;
  const firstCells = cellsOf(first);
  const hasHeader = headerMode === 'first-row' || (headerMode === 'auto' &&
    firstCells.some((cell) => cell?.type === 'tableHeader') &&
    firstCells.every((cell) => cell?.type === 'tableHeader' || isEmptyCell(cell)));
  const rowNodes = hasHeader ? originalRows.slice(1) : originalRows;

  const width = originalRows.reduce((max, node) => Math.max(max, cellsOf(node).length), 0);
  const rows = rowNodes.map((node) => ({
    node,
    cells: Array.from({ length: width }, (_, i) => (cellsOf(node)[i] ? cellText(cellsOf(node)[i]) : '')),
  }));
  const columns = Array.from({ length: width }, (_, i) => {
    const values = [...new Set(rows.map((row) => row.cells[i]))].sort(collator.compare);
    const filterable = values.length > 0 && values.length <= MAX_FILTER_VALUES;
    return {
      name: (hasHeader ? cellText(firstCells[i]) : '') || `Column ${i + 1}`,
      filterValues: filterable ? values : null,
      type: inferType(values),
    };
  });
  const hasMergedCells = originalRows.some((row) => cellsOf(row).some(isMerged));

  return { tableIndex, columns, rows, hasHeader, hasMergedCells, headerMode };
}

// Numeric cells order by value and come before text cells, which keeps the order total in mixed columns.
function compareCells(a, b, numberFormat = 'dot') {
  const x = parseNumber(a, numberFormat);
  const y = parseNumber(b, numberFormat);
  if (x !== null && y !== null) return x - y;
  if (x !== null || y !== null) return x !== null ? -1 : 1;
  return collator.compare(a, b);
}

const OPERATORS = new Set(['contains', 'notContains', 'equals', 'notEquals', 'empty', 'notEmpty', 'gt', 'gte', 'lt', 'lte', 'between', 'before', 'after', 'on', 'relative']);
const COMPARISONS = new Set(['gt', 'gte', 'lt', 'lte', 'between']);
const DATE_OPERATORS = new Set(['before', 'after', 'on', 'relative']);
const normalized = (value) => String(value ?? '').trim().replace(/\s+/g, ' ');
export const MAX_ADVANCED_GROUPS = 5;
export const MAX_ADVANCED_RULES = 5;
export const MAX_ADVANCED_DEPTH = 4;
export const MAX_ADVANCED_NODES = 100;
const ADVANCED_OPERATORS = new Map([
  ['text', new Set(['contains', 'notContains', 'equals', 'notEquals', 'empty', 'notEmpty'])],
  ['number', new Set(['equals', 'notEquals', 'gt', 'gte', 'lt', 'lte', 'between', 'empty', 'notEmpty'])],
  ['date', new Set(['on', 'before', 'after', 'between', 'relative', 'empty', 'notEmpty'])],
]);
const isAdvancedObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const isAdvancedMatch = (value) => value === 'all' || value === 'any';

export function isConditionActive(condition) {
  if (!condition?.operator) return false;
  if (condition.operator === 'empty' || condition.operator === 'notEmpty' || condition.operator === 'relative') return true;
  return normalized(condition.value) !== '' ||
    (condition.operator === 'between' && normalized(condition.valueTo) !== '');
}

function conditionConfig(condition, columnConfig) {
  let type = condition.type ?? columnConfig.type ?? 'text';
  if (DATE_OPERATORS.has(condition.operator)) type = 'date';
  else if (COMPARISONS.has(condition.operator) && type !== 'date') type = 'number';
  return { type, dateFormat: condition.dateFormat ?? columnConfig.dateFormat ?? 'iso', numberFormat: condition.numberFormat !== undefined ? condition.numberFormat : columnConfig.numberFormat !== undefined ? columnConfig.numberFormat : 'dot' };
}

export function validateCondition(condition, columnConfig = {}, today) {
  if (!isConditionActive(condition)) return null;
  if (!OPERATORS.has(condition.operator)) return 'Choose a supported filter condition.';
  if (condition.operator === 'relative') return relativeDateRange(condition, today).error;
  if (condition.operator === 'empty' || condition.operator === 'notEmpty') return null;
  if (condition.operator === 'contains' || condition.operator === 'notContains') return null;
  const config = conditionConfig(condition, columnConfig);
  if (config.type === 'text') return null;
  if (config.type === 'number' && !['dot', 'comma'].includes(config.numberFormat)) return 'Choose a supported number format.';
  const parse = config.type === 'date' ? (value) => parseDate(value, config.dateFormat) : (value) => parseNumber(value, config.numberFormat);
  const values = condition.operator === 'between' ? [condition.value, condition.valueTo] : [condition.value];
  const present = values.filter((value) => normalized(value) !== '');
  if (present.some((value) => parse(value) === null)) {
    return config.type === 'date' ? 'Enter a valid date as YYYY-MM-DD or in the selected date format.' : 'Enter a valid number.';
  }
  if (condition.operator === 'between' && present.length === 2 && parse(condition.value) > parse(condition.valueTo)) {
    return 'The lower bound must not exceed the upper bound.';
  }
  return null;
}

function matchesCondition(text, condition, config, relativeRange) {
  const value = normalized(condition.value);
  const cell = normalized(text);
  switch (condition.operator) {
    case 'empty': return cell === '';
    case 'notEmpty': return cell !== '';
    case 'contains': return cell.toLowerCase().includes(value.toLowerCase());
    case 'notContains': return !cell.toLowerCase().includes(value.toLowerCase());
    case 'relative': {
      const date = parseDate(cell, config.dateFormat);
      return date !== null && date >= relativeRange.from && date <= relativeRange.to;
    }
  }
  let actual = cell.toLowerCase();
  let expected = value.toLowerCase();
  let upper = normalized(condition.valueTo).toLowerCase();
  if (config.type !== 'text') {
    const parse = config.type === 'date' ? (entry) => parseDate(entry, config.dateFormat) : (entry) => parseNumber(entry, config.numberFormat);
    actual = parse(cell);
    if (actual === null) return false;
    expected = value === '' ? null : parse(value);
    upper = upper === '' ? null : parse(upper);
  }
  switch (condition.operator) {
    case 'equals':
    case 'on': return actual === expected;
    case 'notEquals': return actual !== expected;
    case 'gt':
    case 'after': return actual > expected;
    case 'gte': return actual >= expected;
    case 'lt':
    case 'before': return actual < expected;
    case 'lte': return actual <= expected;
    case 'between': return (expected === null || actual >= expected) && (upper === null || actual <= upper);
    default: return false;
  }
}

function compileAdvancedRule(parsed, rule, today) {
  if (!isAdvancedObject(rule)) return { error: 'Provide a filter rule with a condition.' };
  const source = rule.condition;
  if (!isAdvancedObject(source)) return { error: 'Provide a filter rule with a condition.' };
  const column = rule.column;
  if (!Number.isInteger(column) || column < 0 || !Array.isArray(parsed?.columns) || column >= parsed.columns.length || !parsed.columns[column]) {
    return { error: 'Choose an existing column.' };
  }
  // Each rule keeps its own typed snapshot, independent of the basic column controls.
  const condition = { operator: source.operator, type: source.type, dateFormat: source.dateFormat ?? 'iso',
    value: source.value, valueTo: source.valueTo, preset: source.preset, numberFormat: source.numberFormat === undefined ? 'dot' : source.numberFormat };
  const operators = ADVANCED_OPERATORS.get(condition.type);
  if (!operators) return { error: 'Choose text, number or date for the rule type.' };
  if (condition.type === 'number' && !['dot', 'comma'].includes(condition.numberFormat)) return { error: 'Choose a supported number format.' };
  if (!operators.has(condition.operator)) return { error: 'Choose a supported condition for this rule type.' };
  if (!['iso', 'mdy', 'dmy'].includes(condition.dateFormat)) return { error: 'Choose a supported source date format.' };
  if ([condition.value, condition.valueTo, condition.preset].some((value) => value != null && typeof value !== 'string')) {
    return { error: 'Enter filter values as text.' };
  }
  if (!isConditionActive(condition)) return { error: 'Enter a value for this filter rule.' };
  const config = conditionConfig(condition, {});
  const relativeRange = condition.operator === 'relative' ? relativeDateRange(condition, today) : null;
  const error = relativeRange ? relativeRange.error : validateCondition(condition, {}, today);
  return { column, condition, config, relativeRange, error };
}

function compileAdvancedFilters(parsed, expression, today) {
  const compiled = { match: 'all', groups: [], errors: [] };
  if (expression == null) return compiled;
  let nodes = 0;
  const ancestors = new Set();
  const error = (group, rule, message) => compiled.errors.push({ group, rule, message });
  const visit = (group, groupIndex, depth, path) => {
    if (++nodes > MAX_ADVANCED_NODES || depth > MAX_ADVANCED_DEPTH || ancestors.has(group)) {
      error(groupIndex, null, 'Advanced filters exceed the supported nesting depth or total size.');
      return null;
    }
    if (!isAdvancedObject(group)) { error(groupIndex, null, 'Provide a filter group.'); return null; }
    ancestors.add(group);
    try {
      const match = group.match;
      if (!isAdvancedMatch(match)) error(groupIndex, null, 'Choose all or any for the rules in this group.');
      const rules = group.rules;
      if (!Array.isArray(rules) || !rules.length) { error(groupIndex, null, 'Provide at least one rule in this group.'); return null; }
      if (rules.length > MAX_ADVANCED_RULES) error(groupIndex, null, 'Use at most ' + MAX_ADVANCED_RULES + ' rules in each group.');
      const compiledRules = [];
      for (let ruleIndex = 0; ruleIndex < Math.min(rules.length, MAX_ADVANCED_RULES); ruleIndex++) {
        try {
          const source = rules[ruleIndex];
          if (isAdvancedObject(source) && Object.hasOwn(source, 'rules')) {
            if (Object.hasOwn(source, 'condition') || Object.hasOwn(source, 'column')) { error(groupIndex, ruleIndex, 'A subgroup cannot also be a column rule.'); continue; }
            const nested = visit(source, groupIndex, depth + 1, [...path, ruleIndex + 1]);
            if (nested) compiledRules.push(nested);
          } else {
            if (++nodes > MAX_ADVANCED_NODES) { error(groupIndex, ruleIndex, 'Advanced filters exceed the supported total size.'); break; }
            const rule = compileAdvancedRule(parsed, source, today);
            if (rule.error) error(groupIndex, ruleIndex, (depth > 1 ? 'Nested group ' + path.join('.') + ': ' : '') + rule.error);
            else compiledRules.push(rule);
          }
        } catch { error(groupIndex, ruleIndex, 'The filter rule could not be read.'); }
      }
      return { match, rules: compiledRules };
    } finally { ancestors.delete(group); }
  };
  try {
    if (!isAdvancedObject(expression)) { error(null, null, 'Provide an advanced filter expression.'); return compiled; }
    compiled.match = expression.match;
    if (!isAdvancedMatch(compiled.match)) error(null, null, 'Choose all or any for the advanced filter groups.');
    const groups = expression.groups;
    if (!Array.isArray(groups)) { error(null, null, 'Provide an array of advanced filter groups.'); return compiled; }
    if (groups.length > MAX_ADVANCED_GROUPS) error(null, null, 'Use at most ' + MAX_ADVANCED_GROUPS + ' advanced filter groups.');
    for (let index = 0; index < Math.min(groups.length, MAX_ADVANCED_GROUPS); index++) {
      try { const group = visit(groups[index], index, 1, [index + 1]); if (group) compiled.groups.push(group); }
      catch { error(index, null, 'The filter group could not be read.'); }
    }
  } catch { error(null, null, 'The advanced filter expression could not be read.'); }
  return compiled;
}

export function validateAdvancedFilters(parsed, expression, today) {
  return compileAdvancedFilters(parsed, expression, today).errors;
}

export function advancedFilterLeaves(expression) {
  const leaves = [];
  const ancestors = new Set();
  let nodes = 0;
  const visit = (group, depth) => {
    if (++nodes > MAX_ADVANCED_NODES || depth > MAX_ADVANCED_DEPTH || !isAdvancedObject(group) || ancestors.has(group)) return;
    ancestors.add(group);
    try {
      const rules = group.rules;
      if (!Array.isArray(rules)) return;
      for (const rule of rules.slice(0, MAX_ADVANCED_RULES)) {
        try { if (isAdvancedObject(rule) && Object.hasOwn(rule, 'rules')) visit(rule, depth + 1); else if (rule && ++nodes <= MAX_ADVANCED_NODES) leaves.push(rule); } catch { /* Unreadable rules cannot supply a condition. */ }
      }
    } finally { ancestors.delete(group); }
  };
  try { for (const group of (Array.isArray(expression?.groups) ? expression.groups : []).slice(0, MAX_ADVANCED_GROUPS)) { try { visit(group, 1); } catch { /* Other groups can still contain valid rules. */ } } } catch { /* Malformed expressions supply no readable groups. */ }
  return leaves;
}

export function hasRelativeAdvancedFilters(expression) {
  return advancedFilterLeaves(expression).some((rule) => { try { return rule.condition?.operator === 'relative'; } catch { return false; } });
}

export function applyView(parsed, { search = '', filters = {}, excludeFilters = {}, conditions = {}, columnTypes = {}, advancedFilters, sort = null, today } = {}) {
  const advanced = compileAdvancedFilters(parsed, advancedFilters, today);
  // Invalid branches fail the entire expression closed before any row predicate can short circuit.
  if (advanced.errors.length) return [];
  const matchesAdvancedGroup = (row, group) => group.rules[group.match === 'all' ? 'every' : 'some'](
    (rule) => rule.rules ? matchesAdvancedGroup(row, rule) : matchesCondition(row.cells[rule.column], rule.condition, rule.config, rule.relativeRange),
  );
  const needle = search.trim().replace(/\s+/g, ' ').toLowerCase();
  const active = Object.entries(filters).filter(([, values]) => Array.isArray(values) && values.length > 0).map(([column, values]) => [column, new Set(values)]);
  const excluded = Object.entries(excludeFilters).filter(([, values]) => Array.isArray(values) && values.length > 0).map(([column, values]) => [column, new Set(values)]);
  const activeConditions = Object.entries(conditions).filter(([, condition]) => isConditionActive(condition)).map(([column, condition]) => {
    const columnConfig = { type: parsed.columns[column]?.type ?? 'text', ...columnTypes[column] };
    const relativeRange = condition.operator === 'relative' ? relativeDateRange(condition, today) : null;
    return { column, condition, config: conditionConfig(condition, columnConfig), relativeRange,
      error: relativeRange ? relativeRange.error : validateCondition(condition, columnConfig, today) };
  });
  const visible = parsed.rows.filter(
    (row) =>
      (!needle || row.cells.some((cell) => cell.toLowerCase().includes(needle))) &&
      active.every(([column, values]) => values.has(row.cells[column])) &&
      excluded.every(([column, values]) => !values.has(row.cells[column])) &&
      activeConditions.every(({ column, condition, config, error, relativeRange }) => !error && matchesCondition(row.cells[column], condition, config, relativeRange)) &&
      (advanced.groups.length === 0 || advanced.groups[advanced.match === 'all' ? 'every' : 'some']((group) => matchesAdvancedGroup(row, group))),
  );
  const seen = new Set();
  const rules = (Array.isArray(sort) ? sort : sort ? [sort] : []).filter((rule) => {
    if (!Number.isInteger(rule?.column) || !parsed.columns[rule.column] || seen.has(rule.column)) return false;
    seen.add(rule.column);
    return true;
  }).map((rule) => ({ ...rule, direction: rule.direction === 'DESC' ? -1 : 1,
    type: columnTypes[rule.column]?.type ?? parsed.columns[rule.column].type,
    dateFormat: columnTypes[rule.column]?.dateFormat ?? 'iso', numberFormat: columnTypes[rule.column]?.numberFormat ?? 'dot' }));
  if (rules.length) visible.sort((a, b) => {
    for (const { column, direction, type, dateFormat, numberFormat } of rules) {
      const x = a.cells[column];
      const y = b.cells[column];
      let result = 0;
      // Blank cells stay at the bottom in both directions, as spreadsheets do.
      if (!x || !y) result = (x ? 0 : 1) - (y ? 0 : 1);
      else if (type === 'date') {
        const dateX = parseDate(x, dateFormat);
        const dateY = parseDate(y, dateFormat);
        if (dateX !== null && dateY !== null) result = direction * (dateX - dateY);
        // Malformed dates stay after valid dates in either direction, so they cannot masquerade as dates.
        else if (dateX !== null || dateY !== null) result = dateX !== null ? -1 : 1;
        else result = direction * compareCells(x, y, numberFormat);
      } else result = direction * (columnTypes[column]?.type === 'text' ? collator.compare(x, y) : compareCells(x, y, numberFormat));
      if (result) return result;
    }
    return 0;
  });
  return visible;
}

// Apply search, filters and sorting to all rows before taking the current page.
export function paginateRows(rows, requestedIndex = 0, requestedSize = 50) {
  const pageSize = [25, 50, 100].includes(requestedSize) ? requestedSize : 50;
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

export function normalizeColumnOrder(columnCount, order = []) {
  if (!Number.isSafeInteger(columnCount) || columnCount < 0) return [];
  const indexes = new Set(Array.isArray(order) ? order.filter((index) => Number.isInteger(index) && index >= 0 && index < columnCount) : []);
  for (let index = 0; index < columnCount; index++) indexes.add(index);
  return [...indexes];
}

export const MIN_COLUMN_WIDTH = 80;
export const MAX_COLUMN_WIDTH = 1000;

export function normalizeColumnWidths(widths, columnCount) {
  const normalized = {};
  if (!isAdvancedObject(widths) || !Number.isSafeInteger(columnCount) || columnCount < 1) return normalized;
  for (const key of Object.keys(widths)) {
    const index = Number(key);
    if (!Number.isInteger(index) || index < 0 || index >= columnCount || String(index) !== key) continue;
    const width = Object.getOwnPropertyDescriptor(widths, key)?.value;
    if (Number.isInteger(width) && width >= MIN_COLUMN_WIDTH && width <= MAX_COLUMN_WIDTH) normalized[key] = width;
  }
  return normalized;
}

export function toDoc(body, parsed, rows, hiddenColumns = [], columnOrder = [], columnWidths = {}) {
  const table = body.content[parsed.tableIndex];
  const content = [...body.content];
  const first = table.content.find(Boolean);
  const header = parsed.hasHeader ? first : null;
  const headerMode = normalizeHeaderMode(parsed.headerMode);
  if (!header && rows.length === 0) {
    content.splice(parsed.tableIndex, 1);
    return { ...body, content };
  }
  const hidden = new Set(hiddenColumns);
  const order = normalizeColumnOrder(parsed.columns.length, columnOrder);
  const columns = order.filter((index) => !hidden.has(index));
  // A display table needs at least one column, even if a stale view hides every index.
  if (columns.length === 0 && order.length > 0) columns.push(order[0]);
  const widths = normalizeColumnWidths(columnWidths, parsed.columns.length);
  const hasWidthOverrides = columns.some((index) => Object.hasOwn(widths, index));
  const unchanged = !hasWidthOverrides && columns.length === parsed.columns.length && columns.every((index, position) => index === position);
  const project = (node, isHeader = false) => {
    const cells = cellsOf(node);
    const promote = headerMode === 'first-row' && node === header;
    const demote = headerMode === 'none' && node === first;
    const changesTypes = cells.some((cell) => (promote && cell?.type === 'tableCell') || (demote && cell?.type === 'tableHeader'));
    if (unchanged && !changesTypes) return node;
    const projectCell = (cell, index) => {
      const type = promote && cell?.type === 'tableCell' ? 'tableHeader' : demote && cell?.type === 'tableHeader' ? 'tableCell' : cell?.type;
      const changeType = type !== cell?.type;
      const changeWidth = Object.hasOwn(widths, index);
      return changeType || changeWidth ? { ...cell, ...(changeType ? { type } : {}),
        ...(changeWidth ? { attrs: { ...cell.attrs, colwidth: [widths[index]] } } : {}) } : cell;
    };
    return { ...node, content: unchanged ? cells.map(projectCell) : columns.map((index) => projectCell(cells[index] ?? {
      type: isHeader ? 'tableHeader' : 'tableCell', content: [{ type: 'paragraph', content: [] }],
    }, index)) };
  };
  content[parsed.tableIndex] = {
    ...table,
    // Fixed display mode keeps pixel widths from scaling to the saved table width.
    ...(hasWidthOverrides ? { attrs: { ...table.attrs, displayMode: 'fixed' } } : {}),
    content: [...(header ? [project(header, true)] : []), ...rows.map((row) => project(row.node))],
  };
  return { ...body, content };
}
