import { describe, expect, it } from 'vitest';
import {
  paramsToSearchState,
  searchStateToParams,
  searchUrlStateToFormData,
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
