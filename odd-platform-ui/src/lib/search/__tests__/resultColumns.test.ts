import { describe, expect, it } from 'vitest';
import en from 'locales/translations/en.json';
import { AssetKind, type Asset } from 'generated-sources';
import {
  DEFAULT_RESULT_COLUMNS,
  OPTIONAL_RESULT_COLUMN_IDS,
  RESULT_COLUMNS,
  RESULT_COLUMN_BY_ID,
  RESULT_COLUMNS_STORAGE_VERSION,
  columnApplies,
  columnGroup,
  isDefaultLayout,
  minWidthFor,
  parseColumnsList,
  parseStoredColumns,
  resolveResultColumns,
  serializeStoredColumns,
  serverFieldsFor,
} from '../resultColumns';
import {
  paramsToSearchState,
  searchStateKeyWithoutColumns,
  searchStateToParams,
} from '../searchUrlState';

/**
 * ST-13a (#1847) — the field catalog is THE registry (ADR D7 + D12): its invariants, the two fail-closed readings
 * (token-level for the URL / a saved spec, whole-record for the browser store), the request projection and the
 * width model, and the URL serialisation rule (written only when ≠ default; `[]` is a real layout).
 */
describe('the field catalog (RESULT_COLUMNS)', () => {
  it('has 24 unique ids: two fixed anchors + 22 optional columns', () => {
    const ids = RESULT_COLUMNS.map(column => column.id);
    expect(new Set(ids).size).toBe(24);
    expect(
      RESULT_COLUMNS.filter(column => column.fixed).map(column => column.id)
    ).toEqual(['name', 'recently_viewed']);
    expect(OPTIONAL_RESULT_COLUMN_IDS).toHaveLength(22);
    expect(RESULT_COLUMN_BY_ID.get('name')?.fixed).toBe('left');
    expect(RESULT_COLUMN_BY_ID.get('recently_viewed')?.fixed).toBe('right');
  });

  it('every label (and every header note) is a real en.json key — never a raw string', () => {
    const catalog = en as Record<string, string>;
    RESULT_COLUMNS.forEach(column => {
      expect(catalog[column.labelKey], column.id).toBeDefined();
      if (column.noteKey) expect(catalog[column.noteKey], column.id).toBeDefined();
    });
    expect(catalog.Common).toBeDefined();
  });

  it('every optional column has a reader; the anchors have none (they render by position)', () => {
    RESULT_COLUMNS.forEach(column => {
      expect(typeof column.read === 'function', column.id).toBe(!column.fixed);
    });
  });

  it('the default layout is five optional columns, all real ids, in the PO order', () => {
    expect(DEFAULT_RESULT_COLUMNS).toEqual([
      'type',
      'namespace',
      'owners',
      'status',
      'updated_at',
    ]);
    DEFAULT_RESULT_COLUMNS.forEach(id =>
      expect(OPTIONAL_RESULT_COLUMN_IDS).toContain(id)
    );
    expect(isDefaultLayout([...DEFAULT_RESULT_COLUMNS])).toBe(true);
    expect(isDefaultLayout(['namespace', 'type', 'owners', 'status', 'updated_at'])).toBe(
      false
    );
    expect(isDefaultLayout([])).toBe(false);
  });

  it('a class-specific column names classes of a data-entity-only column; a multi-kind column groups as Common', () => {
    RESULT_COLUMNS.forEach(column => {
      if (column.entityClasses) expect(column.kinds).toEqual([AssetKind.DATA_ENTITY]);
      expect(columnGroup(column)).toBe(
        column.kinds.length > 1 ? 'common' : column.kinds[0]
      );
    });
    expect(columnGroup(RESULT_COLUMN_BY_ID.get('namespace')!)).toBe('common');
    expect(columnGroup(RESULT_COLUMN_BY_ID.get('query')!)).toBe(AssetKind.QUERY_EXAMPLE);
  });

  it('serverFieldsFor sends only the server-resolved ids, in order — never a client-only column or an anchor', () => {
    expect(
      serverFieldsFor(['type', 'namespace', 'status', 'rows_count', 'query'])
    ).toEqual(['namespace', 'rows_count']);
    expect(serverFieldsFor([...DEFAULT_RESULT_COLUMNS])).toEqual([
      'namespace',
      'owners',
      'updated_at',
    ]);
    expect(serverFieldsFor([])).toEqual([]);
    // every server token is a token the server knows (the enum on the other side) — pinned by naming
    serverFieldsFor([...OPTIONAL_RESULT_COLUMN_IDS]).forEach(id =>
      expect(RESULT_COLUMN_BY_ID.get(id)?.cost).not.toBe('ref')
    );
  });

  it('resolveResultColumns renders the left anchor, the layout in order, the right anchor; minWidthFor is their sum', () => {
    const rendered = resolveResultColumns(['status', 'type']);
    expect(rendered.map(column => column.id)).toEqual([
      'name',
      'status',
      'type',
      'recently_viewed',
    ]);
    expect(minWidthFor(['status', 'type'])).toBe(270 + 120 + 150 + 165);
    expect(minWidthFor([])).toBe(270 + 165);
    expect(minWidthFor([...OPTIONAL_RESULT_COLUMN_IDS])).toBeGreaterThan(
      minWidthFor([...DEFAULT_RESULT_COLUMNS])
    );
    // an anchor named inside a layout is ignored (never rendered twice)
    expect(
      resolveResultColumns(['name', 'type'] as never).map(column => column.id)
    ).toEqual(['name', 'type', 'recently_viewed']);
  });

  it('the DEFAULT layout fits the results area of a 1440-px viewport — no scroll to see "is it fresh"', () => {
    // 1440 px minus the 216-px filter sidebar and the page gutters = 1184 px beside the filters (measured on the
    // stand). The shipped fixed table hid its whole Updated column under the pinned Recently-viewed one at that
    // width; a default whose freshness column needs a horizontal scroll is not a default.
    expect(minWidthFor([...DEFAULT_RESULT_COLUMNS])).toBeLessThanOrEqual(1184);
  });

  it('columnApplies: by kind, and for a class-specific column by the data entity classes', () => {
    const dataset: Asset = {
      assetKind: AssetKind.DATA_ENTITY,
      dataEntity: {
        id: 1,
        status: { status: 'STABLE' as never },
        isStale: false,
        entityClasses: [{ id: 1, name: 'DATA_SET' as never, types: [] }],
      },
    };
    const term: Asset = {
      assetKind: AssetKind.TERM,
      term: { id: 2, name: 't', definition: '', namespace: { id: 1, name: 'n' } },
    };
    expect(columnApplies(RESULT_COLUMN_BY_ID.get('rows_count')!, dataset)).toBe(true);
    expect(columnApplies(RESULT_COLUMN_BY_ID.get('suite_url')!, dataset)).toBe(false);
    expect(columnApplies(RESULT_COLUMN_BY_ID.get('status')!, term)).toBe(false);
    expect(columnApplies(RESULT_COLUMN_BY_ID.get('namespace')!, term)).toBe(true);
    expect(columnApplies(RESULT_COLUMN_BY_ID.get('query')!, term)).toBe(false);
  });
});

describe('parseColumnsList — the token-level reading of the URL param / a saved spec', () => {
  it('absent → undefined; present → a filtered list, even when it filters to []', () => {
    expect(parseColumnsList(undefined)).toBeUndefined();
    expect(parseColumnsList(null)).toBeUndefined();
    expect(parseColumnsList('type,namespace')).toBeUndefined(); // a bare CSV parses as ONE string → absent
    expect(parseColumnsList([])).toEqual([]);
    expect(parseColumnsList(['nope', 'name', 42])).toEqual([]);
  });

  it('drops an unknown / anchor / duplicate / non-string id and keeps the rest in order, case-insensitively', () => {
    expect(
      parseColumnsList([
        'owners',
        'NOPE',
        'name',
        'Owners',
        7,
        'recently_viewed',
        ' Rows_Count ',
      ])
    ).toEqual(['owners', 'rows_count']);
  });
});

describe('parseStoredColumns — the whole-record reading of the browser store (R5)', () => {
  it('accepts exactly what we write, the empty layout included', () => {
    expect(parseStoredColumns(serializeStoredColumns(['owners', 'type']))).toEqual([
      'owners',
      'type',
    ]);
    expect(parseStoredColumns(serializeStoredColumns([]))).toEqual([]);
    expect(RESULT_COLUMNS_STORAGE_VERSION).toBe(1);
  });

  it.each([
    ['a missing key', null],
    ['non-JSON', 'garbage'],
    ['another version', JSON.stringify({ v: 2, columns: ['type'] })],
    ['no columns', JSON.stringify({ v: 1 })],
    ['columns not an array', JSON.stringify({ v: 1, columns: 'type' })],
    ['an unknown id', JSON.stringify({ v: 1, columns: ['type', 'nope'] })],
    ['a duplicate', JSON.stringify({ v: 1, columns: ['type', 'type'] })],
    ['an anchor inside the list', JSON.stringify({ v: 1, columns: ['name', 'type'] })],
    ['a non-string item', JSON.stringify({ v: 1, columns: ['type', 3] })],
    ['an array at the top', JSON.stringify(['type'])],
  ])('rejects %s → the default applies', (_label, raw) => {
    expect(parseStoredColumns(raw)).toBeUndefined();
  });
});

describe('the URL carriage of the layout (R13.1)', () => {
  it('is written as columns[]= only when the layout differs from the default; [] is written as columns[]', () => {
    const base = { query: 'x', facets: {} };
    expect(searchStateToParams({ ...base, columns: [...DEFAULT_RESULT_COLUMNS] })).toBe(
      'q=x'
    );
    expect(searchStateToParams({ ...base, columns: undefined })).toBe('q=x');
    expect(searchStateToParams({ ...base, columns: ['owners', 'type'] })).toBe(
      'columns[]=owners,type&q=x'
    );
    expect(searchStateToParams({ ...base, columns: [] })).toBe('columns[]&q=x');
  });

  it('round-trips through the parser: order kept, [] kept, absent kept absent, junk dropped token-level', () => {
    expect(paramsToSearchState('?columns[]=owners,type&q=x').columns).toEqual([
      'owners',
      'type',
    ]);
    expect(paramsToSearchState('?columns[]&q=x').columns).toEqual([]);
    expect(paramsToSearchState('?q=x').columns).toBeUndefined();
    expect(paramsToSearchState('?columns[]=owners,nope,name,owners&q=x').columns).toEqual(
      ['owners']
    );
    expect(paramsToSearchState('?columns=owners,type&q=x').columns).toBeUndefined();
  });

  it('searchStateKeyWithoutColumns ignores the layout and nothing else', () => {
    const a = paramsToSearchState('?columns[]=owners&q=x&sort=name');
    const b = paramsToSearchState('?q=x&sort=name');
    expect(searchStateKeyWithoutColumns(a)).toBe(searchStateKeyWithoutColumns(b));
    expect(searchStateKeyWithoutColumns(a)).toBe('q=x&sort=name');
    expect(searchStateKeyWithoutColumns(paramsToSearchState('?q=y&sort=name'))).not.toBe(
      searchStateKeyWithoutColumns(b)
    );
  });
});
