import { AssetKind, DataEntityClassNameEnum } from 'generated-sources';
import type {
  Asset,
  DataEntityClass,
  DataEntityRef,
  DataEntityStatus,
  Ownership,
  Tag,
} from 'generated-sources';

/**
 * ST-13a (#1847, ADR unified-asset-search D7 + D12) — THE field catalog of the cross-kind results table: the
 * ONE registry that says which columns exist, which kinds (and data-entity classes) carry each, what type of
 * value it is, where the value comes from on the wire, and what it costs the server. Everything about a column
 * flows from here — the header, the row's cell, the picker's list and groups, the request's `columns`
 * projection, the persisted layout's validation, the URL param's validation, and (ST-13b) the sort options each
 * column affords, which are derived from `dataType` and `sortable`. A second column list anywhere is the drift
 * the registry exists to prevent.
 *
 * Two columns are FIXED — `name` pinned left and `recently_viewed` pinned right (the #1816 / CTRIB-044 wide-table
 * pattern): they are never in a layout list, never sent, never removable. Every other column is optional.
 *
 * `read(asset)` is the ONLY accessor of a cell's value: it returns a typed {@link CellValue} the renderer switches
 * on by VALUE kind (never by column id), or `undefined` for "no value". Whether a column applies to a row at all
 * (a term has no Status) is decided from `kinds` / `entityClasses` BEFORE `read` is consulted, so the two empty
 * states — "not applicable" and "no value" — stay distinct.
 */

/** The value a cell renders; the renderer switches on `kind`, never on the column. */
export type CellValue =
  | { kind: 'text'; text: string; mono?: boolean }
  | { kind: 'date'; at: Date; style: 'relative' | 'absolute' }
  | { kind: 'number'; value: number; icon?: 'rows' | 'columns' }
  | { kind: 'status'; status: DataEntityStatus }
  | { kind: 'datasource'; name: string; oddrn?: string }
  | { kind: 'refs'; refs: DataEntityRef[]; entityId: number }
  | { kind: 'tags'; tags: Tag[] }
  | { kind: 'owners'; owners: Ownership[] }
  | { kind: 'link'; href: string }
  | { kind: 'type'; assetKind: AssetKind; entityClasses?: DataEntityClass[] };

/** The data type a column carries — what its sort options (ST-13b) and its cell renderer derive from (D12). */
export type ResultColumnDataType =
  | 'alphanumeric'
  | 'datetime'
  | 'numeric'
  | 'status-categorical'
  | 'list';

export type ResultColumnId =
  | 'name'
  | 'type'
  | 'namespace'
  | 'owners'
  | 'status'
  | 'updated_at'
  | 'created_at'
  | 'last_ingested_at'
  | 'datasource'
  | 'groups'
  | 'tags'
  | 'description'
  | 'query'
  | 'popularity'
  | 'rows_count'
  | 'fields_count'
  | 'suite_url'
  | 'sources'
  | 'targets'
  | 'inputs'
  | 'outputs'
  | 'consumers_count'
  | 'entities_count'
  | 'recently_viewed';

export interface ResultColumn {
  id: ResultColumnId;
  /** an en.json translation key, rendered via t() — never a raw label (the i18n-key-parity object-property guard) */
  labelKey: string;
  /** the kinds whose rows carry a value; a row of any other kind renders "Not applicable" */
  kinds: AssetKind[];
  /** for a data-entity column carried by ONE class only (Rows, Suite URL, Sources…): the classes that carry it */
  entityClasses?: DataEntityClassNameEnum[];
  dataType: ResultColumnDataType;
  /** whether a carrying row may have no value ("No value"); false = every carrying row has one */
  nullable: boolean;
  /** whether the unified index carries a sort key for it today (ST-13b derives the header menu from this) */
  sortable: boolean;
  /**
   * what the value costs the server: `ref` = already in the row's ref (client-only; nothing is sent);
   * `free` = in the one page query the resolver already runs (sent as a token, projected at no extra query);
   * `batched` = ONE extra batched query per page, fired only while the column is on
   */
  cost: 'ref' | 'free' | 'batched';
  /** the px the column needs; the table's minimum width is their sum (R9) */
  minWidth: number;
  /** the two anchors: pinned, never in a layout list */
  fixed?: 'left' | 'right';
  /** an en.json key for the extra sentence in the header tooltip (the Updated / Description semantics) */
  noteKey?: string;
  /** the ONLY accessor of the cell value; absent on the anchors (they render their own components by position) */
  read?: (asset: Asset) => CellValue | undefined;
}

const ALL_KINDS: AssetKind[] = [
  AssetKind.DATA_ENTITY,
  AssetKind.TERM,
  AssetKind.QUERY_EXAMPLE,
];
const DE_AND_TERM: AssetKind[] = [AssetKind.DATA_ENTITY, AssetKind.TERM];
const DE_ONLY: AssetKind[] = [AssetKind.DATA_ENTITY];

const text = (value: string | null | undefined, mono?: boolean): CellValue | undefined =>
  value ? { kind: 'text', text: value, mono } : undefined;
const date = (
  value: Date | null | undefined,
  style: 'relative' | 'absolute'
): CellValue | undefined => (value ? { kind: 'date', at: value, style } : undefined);
const number = (
  value: number | null | undefined,
  icon?: 'rows' | 'columns'
): CellValue | undefined =>
  value === null || value === undefined ? undefined : { kind: 'number', value, icon };
const refs = (
  list: DataEntityRef[] | null | undefined,
  entityId: number | undefined
): CellValue | undefined =>
  list && list.length > 0
    ? { kind: 'refs', refs: list, entityId: entityId ?? 0 }
    : undefined;

/**
 * The catalog, in the picker's display order. `DEFAULT_RESULT_COLUMNS` below fixes the default LAYOUT (which
 * of these are on, and in what order) — the two are different things.
 */
export const RESULT_COLUMNS: readonly ResultColumn[] = [
  {
    id: 'name',
    labelKey: 'Name',
    kinds: ALL_KINDS,
    dataType: 'alphanumeric',
    nullable: false,
    sortable: true,
    cost: 'ref',
    minWidth: 320,
    fixed: 'left',
  },
  {
    id: 'type',
    labelKey: 'Type',
    kinds: ALL_KINDS,
    dataType: 'list',
    nullable: false,
    sortable: false,
    cost: 'ref',
    minWidth: 200,
    read: asset => ({
      kind: 'type',
      assetKind: asset.assetKind,
      entityClasses:
        asset.assetKind === AssetKind.DATA_ENTITY
          ? asset.dataEntity?.entityClasses
          : undefined,
    }),
  },
  {
    id: 'namespace',
    labelKey: 'Namespace',
    kinds: DE_AND_TERM,
    dataType: 'alphanumeric',
    nullable: true,
    sortable: false,
    cost: 'free',
    minWidth: 160,
    read: asset => text(asset.fields?.namespace?.name),
  },
  {
    id: 'owners',
    labelKey: 'Owners',
    kinds: DE_AND_TERM,
    dataType: 'list',
    nullable: true,
    sortable: false,
    cost: 'free',
    minWidth: 180,
    read: asset =>
      asset.fields?.owners && asset.fields.owners.length > 0
        ? { kind: 'owners', owners: asset.fields.owners }
        : undefined,
  },
  {
    id: 'status',
    labelKey: 'Status',
    kinds: DE_ONLY,
    dataType: 'status-categorical',
    nullable: false,
    sortable: true,
    cost: 'ref',
    minWidth: 130,
    read: asset =>
      asset.dataEntity?.status
        ? { kind: 'status', status: asset.dataEntity.status }
        : undefined,
  },
  {
    id: 'updated_at',
    labelKey: 'Updated',
    kinds: ALL_KINDS,
    dataType: 'datetime',
    nullable: true,
    sortable: true,
    cost: 'free',
    minWidth: 140,
    noteKey:
      'Last update in the source system for data entities; in the platform for terms and query examples',
    read: asset => date(asset.fields?.updatedAt, 'relative'),
  },
  {
    id: 'created_at',
    labelKey: 'Created',
    kinds: ALL_KINDS,
    dataType: 'datetime',
    nullable: true,
    sortable: false,
    cost: 'free',
    minWidth: 150,
    read: asset => date(asset.fields?.createdAt, 'absolute'),
  },
  {
    id: 'last_ingested_at',
    labelKey: 'Last ingested',
    kinds: DE_ONLY,
    dataType: 'datetime',
    nullable: true,
    sortable: false,
    cost: 'free',
    minWidth: 150,
    read: asset => date(asset.fields?.lastIngestedAt, 'relative'),
  },
  {
    id: 'datasource',
    labelKey: 'Datasource',
    kinds: DE_ONLY,
    dataType: 'alphanumeric',
    nullable: true,
    sortable: false,
    cost: 'free',
    minWidth: 170,
    read: asset =>
      asset.fields?.dataSource?.name
        ? {
            kind: 'datasource',
            name: asset.fields.dataSource.name,
            oddrn: asset.fields.dataSource.oddrn,
          }
        : undefined,
  },
  {
    id: 'groups',
    labelKey: 'Groups',
    kinds: DE_ONLY,
    dataType: 'list',
    nullable: true,
    sortable: false,
    cost: 'batched',
    minWidth: 170,
    read: asset => refs(asset.fields?.groups, asset.dataEntity?.id),
  },
  {
    id: 'tags',
    labelKey: 'Tags',
    kinds: DE_AND_TERM,
    dataType: 'list',
    nullable: true,
    sortable: false,
    cost: 'batched',
    minWidth: 180,
    read: asset =>
      asset.fields?.tags && asset.fields.tags.length > 0
        ? { kind: 'tags', tags: asset.fields.tags }
        : undefined,
  },
  {
    id: 'description',
    labelKey: 'Description',
    kinds: ALL_KINDS,
    dataType: 'alphanumeric',
    nullable: true,
    sortable: false,
    cost: 'free',
    minWidth: 240,
    noteKey: 'The platform description, or the source description when none was written',
    read: asset => text(asset.fields?.description),
  },
  {
    id: 'query',
    labelKey: 'Query',
    kinds: [AssetKind.QUERY_EXAMPLE],
    dataType: 'alphanumeric',
    nullable: false,
    sortable: false,
    cost: 'ref',
    minWidth: 240,
    read: asset => text(asset.queryExample?.query, true),
  },
  {
    id: 'popularity',
    labelKey: 'Popularity',
    kinds: DE_ONLY,
    dataType: 'numeric',
    nullable: false,
    sortable: true,
    cost: 'free',
    minWidth: 110,
    read: asset => number(asset.fields?.viewCount),
  },
  {
    id: 'rows_count',
    labelKey: 'Rows',
    kinds: DE_ONLY,
    entityClasses: [DataEntityClassNameEnum.SET],
    dataType: 'numeric',
    nullable: true,
    sortable: false,
    cost: 'free',
    minWidth: 120,
    read: asset => number(asset.fields?.rowsCount, 'rows'),
  },
  {
    id: 'fields_count',
    labelKey: 'Columns',
    kinds: DE_ONLY,
    entityClasses: [DataEntityClassNameEnum.SET],
    dataType: 'numeric',
    nullable: true,
    sortable: false,
    cost: 'free',
    minWidth: 120,
    read: asset => number(asset.fields?.fieldsCount, 'columns'),
  },
  {
    id: 'consumers_count',
    labelKey: 'Use',
    kinds: DE_ONLY,
    entityClasses: [DataEntityClassNameEnum.SET],
    dataType: 'numeric',
    nullable: false,
    sortable: false,
    cost: 'batched',
    minWidth: 90,
    read: asset => number(asset.fields?.consumersCount),
  },
  {
    id: 'suite_url',
    labelKey: 'Suite URL',
    kinds: DE_ONLY,
    entityClasses: [DataEntityClassNameEnum.QUALITY_TEST],
    dataType: 'alphanumeric',
    nullable: true,
    sortable: false,
    cost: 'free',
    minWidth: 200,
    read: asset =>
      asset.fields?.suiteUrl ? { kind: 'link', href: asset.fields.suiteUrl } : undefined,
  },
  {
    id: 'sources',
    labelKey: 'Sources',
    kinds: DE_ONLY,
    entityClasses: [DataEntityClassNameEnum.TRANSFORMER],
    dataType: 'list',
    nullable: true,
    sortable: false,
    cost: 'batched',
    minWidth: 170,
    read: asset => refs(asset.fields?.sources, asset.dataEntity?.id),
  },
  {
    id: 'targets',
    labelKey: 'Targets',
    kinds: DE_ONLY,
    entityClasses: [DataEntityClassNameEnum.TRANSFORMER],
    dataType: 'list',
    nullable: true,
    sortable: false,
    cost: 'batched',
    minWidth: 170,
    read: asset => refs(asset.fields?.targets, asset.dataEntity?.id),
  },
  {
    id: 'inputs',
    labelKey: 'Inputs',
    kinds: DE_ONLY,
    entityClasses: [DataEntityClassNameEnum.CONSUMER],
    dataType: 'list',
    nullable: true,
    sortable: false,
    cost: 'batched',
    minWidth: 170,
    read: asset => refs(asset.fields?.inputs, asset.dataEntity?.id),
  },
  {
    id: 'outputs',
    labelKey: 'Outputs',
    kinds: DE_ONLY,
    entityClasses: [DataEntityClassNameEnum.INPUT],
    dataType: 'list',
    nullable: true,
    sortable: false,
    cost: 'batched',
    minWidth: 170,
    read: asset => refs(asset.fields?.outputs, asset.dataEntity?.id),
  },
  {
    id: 'entities_count',
    labelKey: 'Entities',
    kinds: DE_ONLY,
    entityClasses: [DataEntityClassNameEnum.ENTITY_GROUP],
    dataType: 'numeric',
    nullable: false,
    sortable: false,
    cost: 'batched',
    minWidth: 100,
    read: asset => number(asset.fields?.entitiesCount),
  },
  {
    id: 'recently_viewed',
    labelKey: 'Recently viewed',
    kinds: ALL_KINDS,
    dataType: 'datetime',
    nullable: true,
    sortable: false,
    cost: 'ref',
    minWidth: 165,
    fixed: 'right',
  },
];

export const RESULT_COLUMN_BY_ID: ReadonlyMap<ResultColumnId, ResultColumn> = new Map(
  RESULT_COLUMNS.map(column => [column.id, column])
);

/** The optional columns — everything a layout list may name; the two anchors are excluded by construction. */
export const OPTIONAL_RESULT_COLUMN_IDS: readonly ResultColumnId[] =
  RESULT_COLUMNS.filter(column => !column.fixed).map(column => column.id);

const OPTIONAL_ID_SET = new Set<string>(OPTIONAL_RESULT_COLUMN_IDS);

/**
 * The default LAYOUT (ST-13a R2): the optional columns a fresh browser shows, in order — what answers "what is it,
 * can I trust it, who owns it, is it fresh" for every kind. The anchors are implicit.
 */
export const DEFAULT_RESULT_COLUMNS: readonly ResultColumnId[] = [
  'type',
  'namespace',
  'owners',
  'status',
  'updated_at',
];

export const isDefaultLayout = (columns: readonly ResultColumnId[]): boolean =>
  columns.length === DEFAULT_RESULT_COLUMNS.length &&
  columns.every((id, index) => id === DEFAULT_RESULT_COLUMNS[index]);

/**
 * The TOKEN-LEVEL fail-closed reading of a layout list from an untrusted source — the URL's `columns[]` param and
 * a saved search's `spec.columns` (the `asset_kinds` posture): a non-array → `undefined` (no layout carried); an
 * array → every entry that is a known OPTIONAL column id, once, in order — an unknown id, an anchor, a duplicate or
 * a non-string is dropped and the rest kept. An array that filters to `[]` is a VALID layout (the anchors-only
 * table), not "absent": a user who unticks everything must be able to share that too.
 */
export function parseColumnsList(raw: unknown): ResultColumnId[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const seen = new Set<string>();
  const columns: ResultColumnId[] = [];
  raw.forEach(entry => {
    if (typeof entry !== 'string') return;
    const id = entry.trim().toLowerCase();
    if (!OPTIONAL_ID_SET.has(id) || seen.has(id)) return;
    seen.add(id);
    columns.push(id as ResultColumnId);
  });
  return columns;
}

/** The persisted-layout record (R5): versioned, fail-closed to the default on ANYTHING unrecognised. */
export const RESULT_COLUMNS_STORAGE_KEY = 'odd.search.result-columns';
export const RESULT_COLUMNS_STORAGE_VERSION = 1;

/**
 * The WHOLE-RECORD fail-closed reading of the browser's stored layout — deliberately stricter than
 * {@link parseColumnsList}: the store is ours, so any shape we would not have written (a missing key, non-JSON,
 * another version, a non-array, a non-string or unknown id, a duplicate, an anchor) means the record is not
 * trustworthy and the DEFAULT applies, silently. An empty list is valid (the anchors-only layout round-trips).
 */
export function parseStoredColumns(
  raw: string | null | undefined
): ResultColumnId[] | undefined {
  if (!raw) return undefined;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return undefined;
  const record = parsed as { v?: unknown; columns?: unknown };
  if (record.v !== RESULT_COLUMNS_STORAGE_VERSION || !Array.isArray(record.columns))
    return undefined;
  const seen = new Set<string>();
  const columns: ResultColumnId[] = [];
  for (const entry of record.columns) {
    if (typeof entry !== 'string' || !OPTIONAL_ID_SET.has(entry) || seen.has(entry))
      return undefined;
    seen.add(entry);
    columns.push(entry as ResultColumnId);
  }
  return columns;
}

export const serializeStoredColumns = (columns: readonly ResultColumnId[]): string =>
  JSON.stringify({ v: RESULT_COLUMNS_STORAGE_VERSION, columns });

/** The full column list a layout renders: the left anchor, the optional columns in order, the right anchor. */
export function resolveResultColumns(layout: readonly ResultColumnId[]): ResultColumn[] {
  const middle = layout
    .map(id => RESULT_COLUMN_BY_ID.get(id))
    .filter((column): column is ResultColumn => column !== undefined && !column.fixed);
  return [
    RESULT_COLUMN_BY_ID.get('name')!,
    ...middle,
    RESULT_COLUMN_BY_ID.get('recently_viewed')!,
  ];
}

/**
 * The `columns` the request sends for a layout (R7 / R8): the server-resolved ids — the client-only ones
 * (`type`, `status`, `query`) are not sent, because the server would only drop them. Order preserved.
 */
export function serverFieldsFor(layout: readonly ResultColumnId[]): ResultColumnId[] {
  return layout.filter(id => {
    const column = RESULT_COLUMN_BY_ID.get(id);
    return column !== undefined && !column.fixed && column.cost !== 'ref';
  });
}

/** The table's minimum width for a layout: the sum of every rendered column's `minWidth` (R9). */
export function minWidthFor(layout: readonly ResultColumnId[]): number {
  return resolveResultColumns(layout).reduce((sum, column) => sum + column.minWidth, 0);
}

/** Whether a column applies to a row — by kind, and for a class-specific column by the data entity's classes. */
export function columnApplies(column: ResultColumn, asset: Asset): boolean {
  if (!column.kinds.includes(asset.assetKind)) return false;
  if (!column.entityClasses) return true;
  const classes = asset.dataEntity?.entityClasses ?? [];
  return classes.some(entityClass =>
    column.entityClasses!.includes(entityClass.name as DataEntityClassNameEnum)
  );
}

/**
 * The picker's groups (R1): a column two or three kinds share sits under "Common"; the rest under their kind.
 * Labels are i18n keys.
 */
export type ResultColumnGroupKey = 'common' | AssetKind;

export const RESULT_COLUMN_GROUP_LABEL: Record<ResultColumnGroupKey, string> = {
  common: 'Common',
  [AssetKind.DATA_ENTITY]: 'Data Entities',
  [AssetKind.TERM]: 'Terms',
  [AssetKind.QUERY_EXAMPLE]: 'Query Examples',
};

export const columnGroup = (column: ResultColumn): ResultColumnGroupKey =>
  column.kinds.length > 1 ? 'common' : column.kinds[0];
