import type { DataSetField, DataSetFieldTypeTypeEnum, Tag } from 'generated-sources';

/** A tag together with the number of columns (fields) in the dataset that carry it. */
export interface TagWithCount extends Tag {
  count: number;
}

/**
 * Aggregate the distinct tags present across the given fields, each with a count of
 * how many fields carry it. Ordered important-first, then by count desc, then by name
 * — mirrors the existing tag ordering (DatasetFieldTags.compareTags / TopTagsList).
 */
export function aggregateFieldTags(fields: DataSetField[]): TagWithCount[] {
  const byId = new Map<number, TagWithCount>();

  fields.forEach(field => {
    field.tags?.forEach(tag => {
      const existing = byId.get(tag.id);
      if (existing) {
        existing.count += 1;
      } else {
        byId.set(tag.id, { ...tag, count: 1 });
      }
    });
  });

  return Array.from(byId.values()).sort((a, b) => {
    if (!!a.important !== !!b.important) return a.important ? -1 : 1;
    if (a.count !== b.count) return b.count - a.count;
    return a.name.localeCompare(b.name);
  });
}

export interface StructureFilters {
  query?: string;
  tagIds?: number[];
  types?: DataSetFieldTypeTypeEnum[];
}

/** True when at least one of the in-page Structure facets is active. */
export function hasActiveFilters({ query, tagIds, types }: StructureFilters): boolean {
  return Boolean(query?.trim()) || Boolean(tagIds?.length) || Boolean(types?.length);
}

/**
 * Apply the in-page Structure filters to the field list. A field is kept when it
 * matches ALL active facets:
 *  - the name search (case-insensitive substring of name or internalName),
 *  - the tag facet (carries ANY of the selected tag ids — OR within the facet),
 *  - the type facet (its type is ANY of the selected types — OR within the facet).
 * An empty/absent facet is inactive and matches everything. Across facets the match
 * is AND. The input list is never mutated.
 */
export function applyStructureFilters(
  fields: DataSetField[],
  { query, tagIds, types }: StructureFilters
): DataSetField[] {
  const q = query?.trim().toLowerCase();
  const tagSet = tagIds && tagIds.length > 0 ? new Set(tagIds) : undefined;
  const typeSet =
    types && types.length > 0 ? new Set<DataSetFieldTypeTypeEnum>(types) : undefined;

  if (!q && !tagSet && !typeSet) return fields;

  return fields.filter(field => {
    const matchesQuery =
      !q ||
      field.name.toLowerCase().includes(q) ||
      (field.internalName?.toLowerCase().includes(q) ?? false);
    const matchesTag = !tagSet || (field.tags?.some(tag => tagSet.has(tag.id)) ?? false);
    const matchesType = !typeSet || typeSet.has(field.type.type);
    return matchesQuery && matchesTag && matchesType;
  });
}
