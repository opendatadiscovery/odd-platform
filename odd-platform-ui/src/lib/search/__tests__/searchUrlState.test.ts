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

/** a full SearchUrlState from a partial (defaults: no facets, no My-data scope) */
const state = (partial: Partial<SearchUrlState> = {}): SearchUrlState => ({
  query: '',
  facets: {},
  ...partial,
});

/**
 * ST-1a (ADR D10) — the search query ⇄ URL param round-trip. The URL is the canonical, shareable search
 * state; this is the (de)serialiser the Search page reads on load and writes on each committed query.
 * (Widened for ST-1b to carry facets + the owned scope, and for ST-8 to carry the My-data scope group — the
 * query assertions below are unchanged in substance.)
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
 * ST-1b (ADR D10) — the 8 facets ⇄ URL params, layered additively on ST-1a. RED before this module carried
 * facets (SearchUrlState was `{ query }` only); GREEN on the ST-1b implementation. ST-8 (#1842) replaced the
 * owned-only `myObjects` boolean with the `my_data` scope GROUP; the legacy param is still parsed (below).
 */
describe('searchUrlState — facets + My-data ⇄ URL params (ST-1b / ST-8 / D10)', () => {
  it('round-trips a faceted search (query + multiple facets + a My-data scope) — identity', () => {
    const s = state({
      query: 'orders',
      facets: { tags: [5, 7], datasources: [3], entityClasses: [1] },
      myData: ['MY_OBJECTS'],
    });
    expect(paramsToSearchState(`?${searchStateToParams(s)}`)).toEqual(s);
  });

  it('serialises facet ids as a bracket-separated CSV and the scope group as its own list', () => {
    const params = searchStateToParams(
      state({ facets: { tags: [5, 7] }, myData: ['MY_OBJECTS', 'UPSTREAM'] })
    );
    expect(params).toContain('tags[]=5,7');
    expect(params).toContain('my_data[]=MY_OBJECTS,UPSTREAM');
  });

  it('omits empty facets and an empty scope → removal / Clear-All yields a clean URL', () => {
    expect(searchStateToParams(state({ facets: { tags: [] }, myData: [] }))).toBe('');
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

  // ST-8 back-compat (ADR D9): a bookmark or shared link written before ST-8 carries `?my=true`. It must keep
  // working — and it maps FORWARD into the scope group, so the state has exactly one representation.
  it('the legacy ?my param still works and maps forward into the scope group', () => {
    expect(paramsToSearchState('?my=true').myData).toEqual(['MY_OBJECTS']);
    expect(paramsToSearchState('?my=1').myData).toBeUndefined();
    expect(paramsToSearchState('?my=yes').myData).toBeUndefined();
    expect(paramsToSearchState('').myData).toBeUndefined();
    // an explicit my_data wins over the legacy flag rather than being merged with it
    expect(paramsToSearchState('?my=true&my_data[]=UPSTREAM').myData).toEqual([
      'UPSTREAM',
    ]);
  });

  it('my_data fails closed: unknown scope tokens are dropped, an all-garbage list becomes no scope', () => {
    expect(paramsToSearchState('?my_data[]=UPSTREAM,NONSENSE').myData).toEqual([
      'UPSTREAM',
    ]);
    expect(paramsToSearchState('?my_data[]=NONSENSE').myData).toBeUndefined();
  });

  // The depth is a performance guarantee, not a preference, so an out-of-range value must degrade to the
  // server default rather than reach the request — the wire type carries no minimum/maximum precisely so a
  // stale or hand-edited shareable URL never 400s.
  it('the per-direction depths fail closed: only integers 1..3 survive', () => {
    expect(paramsToSearchState('?upstream_depth=2').upstreamDepth).toBe(2);
    expect(paramsToSearchState('?downstream_depth=3').downstreamDepth).toBe(3);
    expect(paramsToSearchState('?upstream_depth=99').upstreamDepth).toBeUndefined();
    expect(paramsToSearchState('?upstream_depth=0').upstreamDepth).toBeUndefined();
    expect(paramsToSearchState('?upstream_depth=abc').upstreamDepth).toBeUndefined();
    expect(paramsToSearchState('?upstream_depth=1.5').upstreamDepth).toBeUndefined();
  });

  it('a depth is only serialised when its direction is selected AND it differs from the default', () => {
    expect(searchStateToParams(state({ myData: ['UPSTREAM'], upstreamDepth: 1 }))).toBe(
      'my_data[]=UPSTREAM'
    );
    expect(searchStateToParams(state({ myData: ['MY_OBJECTS'], upstreamDepth: 3 }))).toBe(
      'my_data[]=MY_OBJECTS'
    );
    expect(
      searchStateToParams(state({ myData: ['UPSTREAM'], upstreamDepth: 3 }))
    ).toContain('upstream_depth=3');
  });

  it('searchUrlStateToFormData → the create request: filters + query + the scope group', () => {
    const formData = searchUrlStateToFormData(
      state({
        query: 'q',
        facets: { tags: [5, 7], entityClasses: [1] },
        myData: ['MY_OBJECTS'],
      })
    );
    expect(formData.query).toBe('q');
    expect(formData.myData).toEqual(['MY_OBJECTS']);
    // ST-8: `my_objects` is STILL sent when the owned scope is selected. The legacy /api/search session reads
    // only that field and drives the facet sidebar's Type-filter visibility from it, so dropping it would
    // silently change a shipped surface (ADR D9 — the session request stays byte-identical to before).
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
      myData: ['MY_OBJECTS'],
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
      myData: ['MY_OBJECTS'],
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
        myData: ['MY_OBJECTS'],
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
describe('searchUrlState — favorites ⇄ URL params (ST-7 / #1841)', () => {
  it('round-trips the favorites scope through the URL (identity), both directions', () => {
    expect(paramsToSearchState('?favorites=yes')).toEqual(state({ favorites: 'yes' }));
    expect(paramsToSearchState('?favorites=no')).toEqual(state({ favorites: 'no' }));
    expect(searchStateToParams(state({ favorites: 'yes' }))).toBe('favorites=yes');
  });

  it('omits the param when the scope is unset → the default state stays a clean URL', () => {
    expect(searchStateToParams(state())).toBe('');
    expect(paramsToSearchState('')).toEqual(state());
  });

  it('fails closed: any value other than yes/no is dropped (never a partial narrowing)', () => {
    // A garbage value must not silently become a filter — it degrades to "no narrowing", the same
    // fail-closed posture `sort` and `asset_kinds` take.
    expect(paramsToSearchState('?favorites=true').favorites).toBeUndefined();
    expect(paramsToSearchState('?favorites=1').favorites).toBeUndefined();
    expect(paramsToSearchState('?favorites=YES').favorites).toBeUndefined();
    expect(paramsToSearchState('?favorites=').favorites).toBeUndefined();
    expect(paramsToSearchState('?favorites=%00').favorites).toBeUndefined();
  });

  it('is preserved alongside a faceted, sorted, kind-narrowed query (parse+serialise identity)', () => {
    // Round-trip the STATE (the sibling ST-4 case's shape) rather than a hand-written URL string: it
    // asserts full state equality instead of one direction, and it cannot be broken by getting the
    // serialiser's array syntax wrong in the fixture.
    const s = state({
      query: 'orders',
      facets: { owners: [3], tags: [1, 2] },
      // ST-8 replaced the `myObjects` boolean on SearchUrlState with the `myData` scope group; this case
      // now round-trips the favorites scope alongside it, so the two independent axes are pinned together.
      myData: ['MY_OBJECTS'],
      sort: 'name',
      assetKinds: [AssetKind.DATA_ENTITY],
      favorites: 'yes',
    });
    expect(paramsToSearchState(`?${searchStateToParams(s)}`)).toEqual(s);
  });

  it('maps yes/no → the wire boolean, and keeps ABSENT absent (never an implicit false)', () => {
    // The distinction is load-bearing: `favorites: false` is a REAL filter (only assets the caller has NOT
    // starred). Sending it for an unset scope would silently narrow every default search.
    expect(
      searchUrlStateToAssetSearchFormData(state({ favorites: 'yes' })).favorites
    ).toBe(true);
    expect(
      searchUrlStateToAssetSearchFormData(state({ favorites: 'no' })).favorites
    ).toBe(false);
    expect(searchUrlStateToAssetSearchFormData(state()).favorites).toBeUndefined();
  });

  it('is NOT carried onto the legacy SearchFormData — the unified path owns it (ADR D9)', () => {
    expect(searchUrlStateToFormData(state({ favorites: 'yes' }))).not.toHaveProperty(
      'favorites'
    );
  });
});

describe('searchUrlState — popularity range ⇄ URL params (ST-9 / #1843)', () => {
  it('round-trips a closed, an open-ended and a never-viewed range through the URL (identity)', () => {
    expect(paramsToSearchState('?popularity_min=4&popularity_max=9')).toEqual(
      state({ popularity: { min: 4, max: 9 } })
    );
    expect(searchStateToParams(state({ popularity: { min: 4, max: 9 } }))).toBe(
      'popularity_max=9&popularity_min=4'
    );
    // an open end is simply absent — never serialised as the rail's current extreme (a bookmark must not freeze it)
    expect(paramsToSearchState('?popularity_min=4')).toEqual(
      state({ popularity: { min: 4 } })
    );
    expect(searchStateToParams(state({ popularity: { max: 2 } }))).toBe(
      'popularity_max=2'
    );
    // THE FALSY-ZERO TRAP: 0 is a real bound ("never viewed") and must survive both directions
    expect(paramsToSearchState('?popularity_min=0&popularity_max=0')).toEqual(
      state({ popularity: { min: 0, max: 0 } })
    );
    expect(searchStateToParams(state({ popularity: { min: 0, max: 0 } }))).toBe(
      'popularity_max=0&popularity_min=0'
    );
  });

  it('omits both params when there is no range → the default state stays a clean URL', () => {
    expect(searchStateToParams(state())).toBe('');
    expect(paramsToSearchState('').popularity).toBeUndefined();
  });

  it('fails closed: a non-integer bound drops the WHOLE range; out-of-range integers are CLAMPED; an inverted range is dropped', () => {
    expect(paramsToSearchState('?popularity_min=abc').popularity).toBeUndefined();
    expect(
      paramsToSearchState('?popularity_min=4&popularity_max=x').popularity
    ).toBeUndefined();
    expect(paramsToSearchState('?popularity_min=4.5').popularity).toBeUndefined();
    expect(paramsToSearchState('?popularity_min=').popularity).toBeUndefined();
    // clamped into [0, 20] — the chip then names the band the request actually runs
    expect(paramsToSearchState('?popularity_min=99').popularity).toEqual({ min: 20 });
    expect(paramsToSearchState('?popularity_max=-5').popularity).toEqual({ max: 0 });
    // contradictory → no range (the UI never sends one; the server's own rule for a direct client is "empty")
    expect(
      paramsToSearchState('?popularity_min=10&popularity_max=2').popularity
    ).toBeUndefined();
    // a repeated scalar param: query-string keeps the LAST value (its bracket-separator format reserves arrays for
    // `key[]`), so this is not junk but a plain "last wins" — the parser's array branch guards the stored-spec path
    expect(paramsToSearchState('?popularity_min=1&popularity_min=2').popularity).toEqual({
      min: 2,
    });
    // never throws on garbage
    expect(() =>
      paramsToSearchState('?popularity_min=%00&popularity_max=%FF')
    ).not.toThrow();
  });

  it('is preserved alongside a faceted, sorted, kind-narrowed, scoped query (parse+serialise identity)', () => {
    const s = state({
      query: 'orders',
      facets: { owners: [3], tags: [1, 2] },
      myData: ['MY_OBJECTS'],
      sort: 'popularity',
      assetKinds: [AssetKind.DATA_ENTITY],
      favorites: 'yes',
      popularity: { min: 2, max: 6 },
    });
    expect(paramsToSearchState(`?${searchStateToParams(s)}`)).toEqual(s);
  });

  it('rides the cross-kind request as the same {min, max} scores, and stays ABSENT when unset', () => {
    expect(
      searchUrlStateToAssetSearchFormData(state({ popularity: { min: 4, max: 9 } }))
        .popularity
    ).toEqual({ min: 4, max: 9 });
    expect(
      searchUrlStateToAssetSearchFormData(state({ popularity: { min: 0, max: 0 } }))
        .popularity
    ).toEqual({ min: 0, max: 0 });
    expect(searchUrlStateToAssetSearchFormData(state()).popularity).toBeUndefined();
  });

  it('is NOT carried onto the legacy SearchFormData — the unified path owns it (ADR D9)', () => {
    expect(
      searchUrlStateToFormData(state({ popularity: { min: 1 } }))
    ).not.toHaveProperty('popularity');
  });

  it('accepts the fifth sort token, popularity', () => {
    expect(paramsToSearchState('?sort=popularity').sort).toBe('popularity');
    expect(searchStateToParams(state({ sort: 'popularity' }))).toBe('sort=popularity');
  });
});

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
