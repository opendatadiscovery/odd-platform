import { describe, expect, it } from 'vitest';
import { DataSetFieldTypeTypeEnum, type DataSetField, type Tag } from 'generated-sources';
import { aggregateFieldTags, applyStructureFilters, hasActiveFilters } from './filtering';

const tag = (id: number, name: string, important = false, external = false): Tag => ({
  id,
  name,
  important,
  external,
});

const field = (
  id: number,
  name: string,
  type: DataSetFieldTypeTypeEnum,
  tags?: Tag[],
  internalName?: string
): DataSetField => ({
  id,
  oddrn: `//dataset/field/${id}`,
  name,
  type: { type, logicalType: 'lt' } as DataSetField['type'],
  ...(tags ? { tags } : {}),
  ...(internalName ? { internalName } : {}),
});

const pii = tag(1, 'PII', /* important */ true);
const sensitive = tag(2, 'sensitive');
const gdpr = tag(3, 'gdpr');
const system = tag(4, 'classifier', /* important */ false, /* external */ true);

const {
  STRING: TYPE_STRING,
  NUMBER: TYPE_NUMBER,
  DATETIME: TYPE_DATETIME,
} = DataSetFieldTypeTypeEnum;

// id, name, type, tags
const fields: DataSetField[] = [
  field(10, 'user_id', TYPE_NUMBER, [pii, sensitive]),
  field(11, 'email', TYPE_STRING, [pii, gdpr, system]),
  field(12, 'created_at', TYPE_DATETIME, [sensitive]),
  field(13, 'amount', TYPE_NUMBER, []),
  field(14, 'notes', TYPE_STRING, undefined, 'internal_notes'),
];

describe('aggregateFieldTags', () => {
  it('aggregates distinct tags across fields with per-tag column counts', () => {
    const result = aggregateFieldTags(fields);
    const byName = Object.fromEntries(result.map(t => [t.name, t.count]));
    expect(byName).toEqual({ PII: 2, sensitive: 2, gdpr: 1, classifier: 1 });
  });

  it('orders important-first, then by count desc, then by name', () => {
    // PII (important, count 2) first; then non-important by count desc then name:
    // sensitive (2) before classifier (1) and gdpr (1); gdpr before classifier (name).
    expect(aggregateFieldTags(fields).map(t => t.name)).toEqual([
      'PII',
      'sensitive',
      'classifier',
      'gdpr',
    ]);
  });

  it('returns an empty list when no field carries a tag', () => {
    expect(aggregateFieldTags([field(99, 'x', TYPE_STRING, [])])).toEqual([]);
  });
});

describe('applyStructureFilters', () => {
  it('returns the same list (identity) when no facet is active', () => {
    expect(applyStructureFilters(fields, {})).toBe(fields);
  });

  it('filters by name search across name and internalName (case-insensitive)', () => {
    expect(applyStructureFilters(fields, { query: 'EMAIL' }).map(f => f.id)).toEqual([
      11,
    ]);
    // internalName match
    expect(applyStructureFilters(fields, { query: 'internal' }).map(f => f.id)).toEqual([
      14,
    ]);
  });

  it('filters by a single tag', () => {
    expect(applyStructureFilters(fields, { tagIds: [gdpr.id] }).map(f => f.id)).toEqual([
      11,
    ]);
  });

  it('treats multiple selected tags as OR within the facet', () => {
    expect(
      applyStructureFilters(fields, { tagIds: [gdpr.id, sensitive.id] }).map(f => f.id)
    ).toEqual([10, 11, 12]);
  });

  it('filters by type', () => {
    expect(
      applyStructureFilters(fields, { types: [TYPE_NUMBER] }).map(f => f.id)
    ).toEqual([10, 13]);
  });

  it('combines facets with AND (tag AND type)', () => {
    // sensitive -> {10,12}; TYPE_NUMBER -> {10,13}; AND -> {10}
    expect(
      applyStructureFilters(fields, { tagIds: [sensitive.id], types: [TYPE_NUMBER] }).map(
        f => f.id
      )
    ).toEqual([10]);
  });

  it('combines the name search with a tag facet (AND)', () => {
    // query "a" by name -> email, created_at, amount ({11,12,13}); PII -> {10,11};
    // AND -> {11} (email is the only PII-tagged field whose name contains "a").
    expect(
      applyStructureFilters(fields, { query: 'a', tagIds: [pii.id] }).map(f => f.id)
    ).toEqual([11]);
    // query "e" by name -> user_id, email, created_at, notes; gdpr -> {11}; AND -> {11}.
    expect(
      applyStructureFilters(fields, { query: 'e', tagIds: [gdpr.id] }).map(f => f.id)
    ).toEqual([11]);
  });

  it('returns an empty list when no field matches', () => {
    expect(applyStructureFilters(fields, { query: 'zzz' })).toEqual([]);
  });

  it('does not mutate the input list', () => {
    const snapshot = [...fields];
    applyStructureFilters(fields, { tagIds: [pii.id], types: [TYPE_STRING] });
    expect(fields).toEqual(snapshot);
  });
});

describe('hasActiveFilters', () => {
  it('is false with no facets and with a whitespace-only query', () => {
    expect(hasActiveFilters({})).toBe(false);
    expect(hasActiveFilters({ query: '   ', tagIds: [], types: [] })).toBe(false);
  });

  it('is true when any facet is active', () => {
    expect(hasActiveFilters({ query: 'x' })).toBe(true);
    expect(hasActiveFilters({ tagIds: [1] })).toBe(true);
    expect(hasActiveFilters({ types: [TYPE_STRING] })).toBe(true);
  });
});
