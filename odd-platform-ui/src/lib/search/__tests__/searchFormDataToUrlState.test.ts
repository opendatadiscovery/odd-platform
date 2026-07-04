import { describe, expect, it } from 'vitest';
import type { SearchFormData } from 'generated-sources';
import {
  searchFormDataToUrlState,
  searchUrlStateToFormData,
  type SearchUrlState,
} from '../searchUrlState';

/** a full SearchUrlState from a partial (defaults: no facets, not my-objects, no sort) */
const state = (partial: Partial<SearchUrlState> = {}): SearchUrlState => ({
  query: '',
  facets: {},
  myObjects: false,
  ...partial,
});

/**
 * ST-3 (ADR D11) — a saved search stores exactly a `SearchFormData`, and REAPPLY rebuilds the shareable
 * param URL from it via `searchStateToParams(searchFormDataToUrlState(spec))`. `searchFormDataToUrlState`
 * is the inverse of `searchUrlStateToFormData`; this proves the round-trip is loss-free for every field the
 * URL carries (query + facets + myObjects + sort) and that a malformed / defensively-empty spec degrades to
 * the empty search instead of throwing (there is no error boundary — a throw white-screens the app, IT-006).
 */
describe('searchFormDataToUrlState — SearchFormData → URL state (ST-3 / D11)', () => {
  it('round-trips a representative URL state through the form-data spec (identity)', () => {
    const s = state({
      query: 'sales orders',
      myObjects: true,
      sort: 'updated_at',
      facets: { datasources: [1, 2], tags: [7], statuses: [3] },
    });
    expect(searchFormDataToUrlState(searchUrlStateToFormData(s))).toEqual(s);
  });

  it('round-trips the empty (browse) state — identity', () => {
    const s = state();
    expect(searchFormDataToUrlState(searchUrlStateToFormData(s))).toEqual(s);
  });

  it('fails closed on an unknown sort token → dropped to undefined (the per-context default)', () => {
    const spec: SearchFormData = { query: 'x', sort: 'popularity', filters: {} };
    expect(searchFormDataToUrlState(spec).sort).toBeUndefined();
  });

  it('keeps only positive-integer facet ids and drops entries explicitly deselected', () => {
    const spec = {
      filters: {
        tags: [
          { entityId: 5, selected: true },
          { entityId: 9, selected: false }, // explicitly deselected → dropped
          { entityId: -1, selected: true }, // non-positive → dropped
        ],
      },
    } as SearchFormData;
    expect(searchFormDataToUrlState(spec).facets).toEqual({ tags: [5] });
  });

  it('tolerates a defensively-empty spec (undefined filters / sort) without throwing', () => {
    // A malformed / partial stored spec: `filters` and `sort` absent. Must degrade to the empty search
    // rather than throw — a throw in a caller's render white-screens the whole app (no error boundary).
    const spec = { query: undefined } as unknown as SearchFormData;
    expect(() => searchFormDataToUrlState(spec)).not.toThrow();
    expect(searchFormDataToUrlState(spec)).toEqual(state());
  });
});
