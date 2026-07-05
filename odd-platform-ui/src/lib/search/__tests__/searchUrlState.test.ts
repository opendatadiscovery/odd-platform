import { describe, expect, it } from 'vitest';
import { AssetKind } from 'generated-sources';
import {
  paramsToSearchState,
  searchStateToParams,
  searchUrlStateToFormData,
  searchUrlStateToAssetSearchFormData,
  defaultSortForContext,
  resolveActiveSort,
  type SearchUrlState,
} from '../searchUrlState';

/** a full SearchUrlState from a partial (defaults: no facets, not my-objects) */
const state = (partial: Partial<SearchUrlState> = {}): SearchUrlState => ({
  query: '',
  facets: {},
  myObjects: false,
  ...partial,
});

/**
 * ST-1a (ADR D10) — the search query ⇄ URL param round-trip. The URL is the canonical, shareable search
 * state; this is the (de)serialiser the Search page reads on load and writes on each committed query.
 * (Widened for ST-1b to carry facets + myObjects — the query assertions below are unchanged in substance.)
 */
describe('searchUrlState — query ⇄ URL params (ST-1a / D10)', () => {
  it('round-trips a query through the URL (identity)', () => {
    const s = state({ query: 'sales orders' });
    const params = searchStateToParams(s);
    expect(params).toContain('q=');
    expect(paramsToSearchState(`?${params}`)).toEqual(s);
  });

  it('omits an empty query → a clean (empty) URL', () => {
    expect(searchStateToParams(state())).toBe('');
  });

  it('fails closed: unknown / garbage params are ignored and the query defaults to empty', () => {
    expect(paramsToSearchState('?q=hello&bogus=1&=&%zz')).toEqual(
      state({ query: 'hello' })
    );
    expect(paramsToSearchState('?')).toEqual(state());
    expect(paramsToSearchState('')).toEqual(state());
  });

  it('keeps a numeric-looking query as a string (never coerced to a number)', () => {
    expect(paramsToSearchState('?q=2024')).toEqual(state({ query: '2024' }));
  });

  it('preserves special characters through the round-trip (encoding-safe)', () => {
    const s = state({ query: 'a & b / c?d e' });
    expect(paramsToSearchState(`?${searchStateToParams(s)}`)).toEqual(s);
  });
});

/**
 * ST-1b (ADR D10) — the 8 facets + myObjects ⇄ URL params, layered additively on ST-1a. RED before this
 * module carried facets (SearchUrlState was `{ query }` only); GREEN on the ST-1b implementation.
 */
describe('searchUrlState — facets + myObjects ⇄ URL params (ST-1b / D10)', () => {
  it('round-trips a faceted search (query + multiple facets + myObjects) — identity', () => {
    const s = state({
      query: 'orders',
      facets: { tags: [5, 7], datasources: [3], entityClasses: [1] },
      myObjects: true,
    });
    expect(paramsToSearchState(`?${searchStateToParams(s)}`)).toEqual(s);
  });

  it('serialises facet ids as a bracket-separated CSV and my as a boolean flag', () => {
    const params = searchStateToParams(
      state({ facets: { tags: [5, 7] }, myObjects: true })
    );
    expect(params).toContain('tags[]=5,7');
    expect(params).toContain('my=true');
  });

  it('omits empty facets and my=false → removal / Clear-All yields a clean URL', () => {
    expect(searchStateToParams(state({ facets: { tags: [] }, myObjects: false }))).toBe(
      ''
    );
    // a single selected facet is present; dropping it (empty) removes it entirely — the round-2 removal path
    expect(paramsToSearchState('?tags[]=5').facets).toEqual({ tags: [5] });
    expect(paramsToSearchState('').facets).toEqual({});
  });

  it('fails closed on malformed facet ids: non-numeric / negative / zero dropped, never throws', () => {
    expect(paramsToSearchState('?tags[]=5,notanumber,7&owners[]=abc')).toEqual(
      state({ facets: { tags: [5, 7] } })
    );
    expect(paramsToSearchState('?tags[]=-1,0,3')).toEqual(
      state({ facets: { tags: [3] } })
    );
    // an unknown facet-looking param is ignored (only the 8 known facet dimensions are read)
    expect(paramsToSearchState('?bogusFacet[]=1,2')).toEqual(state());
  });

  it('my fails closed: only the exact string "true" enables it', () => {
    expect(paramsToSearchState('?my=true').myObjects).toBe(true);
    expect(paramsToSearchState('?my=1').myObjects).toBe(false);
    expect(paramsToSearchState('?my=yes').myObjects).toBe(false);
    expect(paramsToSearchState('').myObjects).toBe(false);
  });

  it('searchUrlStateToFormData → the create request: selected filters + query + myObjects', () => {
    const formData = searchUrlStateToFormData(
      state({ query: 'q', facets: { tags: [5, 7], entityClasses: [1] }, myObjects: true })
    );
    expect(formData.query).toBe('q');
    expect(formData.myObjects).toBe(true);
    expect(formData.filters.tags).toEqual([
      { entityId: 5, selected: true },
      { entityId: 7, selected: true },
    ]);
    expect(formData.filters.entityClasses).toEqual([{ entityId: 1, selected: true }]);
  });
});

/**
 * ST-2b (#1836) — the sort ordering ⇄ URL param, layered additively on ST-1. RED before this module carried `sort`
 * (SearchUrlState had no `sort`); GREEN on the ST-2b implementation. The four tokens are the server-side contract
 * (ST-2a / SearchSortDto); an unknown token fails closed to the server's per-context default.
 */
describe('searchUrlState — sort ⇄ URL params (ST-2b / #1836)', () => {
  it('round-trips a sort through the URL (identity)', () => {
    const s = state({ query: 'orders', sort: 'name' });
    expect(paramsToSearchState(`?${searchStateToParams(s)}`)).toEqual(s);
  });

  it('serialises sort as ?sort=<token> and omits it when unset (the default order → a clean URL)', () => {
    expect(searchStateToParams(state({ sort: 'updated_at' }))).toContain(
      'sort=updated_at'
    );
    expect(searchStateToParams(state())).toBe('');
  });

  it('accepts each of the four known sort tokens', () => {
    (['relevance', 'status_priority', 'updated_at', 'name'] as const).forEach(token => {
      expect(paramsToSearchState(`?sort=${token}`).sort).toBe(token);
    });
  });

  it('fails closed on an unknown/absent sort: dropped (→ the server default), never passed through', () => {
    expect(paramsToSearchState('?sort=garbage').sort).toBeUndefined();
    expect(paramsToSearchState('?sort=').sort).toBeUndefined();
    expect(paramsToSearchState('?q=x').sort).toBeUndefined();
  });

  it('sort is preserved alongside a faceted query (parse+serialise identity)', () => {
    const s = state({
      query: 'q',
      facets: { tags: [5] },
      myObjects: true,
      sort: 'updated_at',
    });
    expect(paramsToSearchState(`?${searchStateToParams(s)}`)).toEqual(s);
  });

  it('searchUrlStateToFormData carries sort to the create request (and omits it when unset)', () => {
    expect(searchUrlStateToFormData(state({ sort: 'updated_at' })).sort).toBe(
      'updated_at'
    );
    expect(searchUrlStateToFormData(state()).sort).toBeUndefined();
  });
});

/**
 * ST-4 (#1838) — the asset-type kinds ⇄ URL param, layered additively on ST-1/2. The tokens are the AssetKind
 * enum values; an unknown token fails closed (dropped), and an empty selection = all kinds (omitted from the URL).
 */
describe('searchUrlState — asset_kinds ⇄ URL params (ST-4 / #1838)', () => {
  it('round-trips the selected kinds through the URL (identity)', () => {
    const s = state({ assetKinds: [AssetKind.DATA_ENTITY, AssetKind.TERM] });
    expect(paramsToSearchState(`?${searchStateToParams(s)}`)).toEqual(s);
  });

  it('serialises kinds as ?asset_kinds[]=... and omits them when none are selected', () => {
    expect(searchStateToParams(state({ assetKinds: [AssetKind.TERM] }))).toContain(
      'asset_kinds[]=TERM'
    );
    expect(searchStateToParams(state({ assetKinds: [] }))).toBe('');
    expect(searchStateToParams(state())).toBe('');
  });

  it('fails closed: unknown kind tokens are dropped, an all-garbage list → undefined (= all kinds)', () => {
    expect(
      paramsToSearchState('?asset_kinds[]=TERM,BOGUS,DATA_ENTITY').assetKinds
    ).toEqual([AssetKind.TERM, AssetKind.DATA_ENTITY]);
    expect(paramsToSearchState('?asset_kinds[]=BOGUS').assetKinds).toBeUndefined();
    expect(paramsToSearchState('').assetKinds).toBeUndefined();
  });

  it('is preserved alongside a faceted, sorted query (parse+serialise identity)', () => {
    const s = state({
      query: 'orders',
      facets: { entityClasses: [1] },
      myObjects: true,
      sort: 'updated_at',
      assetKinds: [AssetKind.QUERY_EXAMPLE],
    });
    expect(paramsToSearchState(`?${searchStateToParams(s)}`)).toEqual(s);
  });

  it('searchUrlStateToAssetSearchFormData carries the kinds + the shared SearchFormData fields', () => {
    const formData = searchUrlStateToAssetSearchFormData(
      state({
        query: 'q',
        facets: { tags: [5] },
        myObjects: true,
        sort: 'name',
        assetKinds: [AssetKind.TERM],
      })
    );
    expect(formData.query).toBe('q');
    expect(formData.myObjects).toBe(true);
    expect(formData.sort).toBe('name');
    expect(formData.filters.tags).toEqual([{ entityId: 5, selected: true }]);
    expect(formData.assetKinds).toEqual([AssetKind.TERM]);
    // an empty selection is omitted so the request never over-constrains to "no kinds"
    expect(searchUrlStateToAssetSearchFormData(state()).assetKinds).toBeUndefined();
  });
});

/** ST-2b — the per-context default + the fail-closed active-sort resolution the dropdown displays. */
describe('sort defaults + fail-closed resolution (ST-2b)', () => {
  it('defaultSortForContext: relevance when there is a query, status priority when browsing', () => {
    expect(defaultSortForContext('orders')).toBe('relevance');
    expect(defaultSortForContext('   ')).toBe('status_priority');
    expect(defaultSortForContext('')).toBe('status_priority');
  });

  it('resolveActiveSort: a valid URL sort wins; absent/garbage falls back to the context default', () => {
    expect(resolveActiveSort('name', 'orders')).toBe('name');
    expect(resolveActiveSort(undefined, 'orders')).toBe('relevance');
    expect(resolveActiveSort(undefined, '')).toBe('status_priority');
    expect(resolveActiveSort('garbage', 'orders')).toBe('relevance');
    expect(resolveActiveSort('garbage', '')).toBe('status_priority');
  });

  // Regression (review BLOCKER B1): useQueryParams parses ?q=123 -> 123 (number) and ?q=true -> true (boolean); the
  // helpers must coerce, never call .trim() on a non-string (there is no error boundary — a throw white-screens the app).
  it('coerces a numeric / boolean query or sort — never throws (B1)', () => {
    expect(defaultSortForContext(123)).toBe('relevance');
    expect(defaultSortForContext(2024)).toBe('relevance');
    expect(defaultSortForContext(true)).toBe('relevance');
    expect(defaultSortForContext(false)).toBe('relevance');
    expect(defaultSortForContext(null)).toBe('status_priority');
    expect(defaultSortForContext(undefined)).toBe('status_priority');
    expect(resolveActiveSort(undefined, 123)).toBe('relevance'); // numeric query -> a text query -> relevance
    expect(resolveActiveSort(2024, 'orders')).toBe('relevance'); // numeric sort token -> unknown -> default
    expect(resolveActiveSort('name', 456)).toBe('name'); // a valid sort wins even with a numeric query
  });
});
