import { describe, expect, it } from 'vitest';
import type { AssetSearchFormData, SearchFormData } from 'generated-sources';
import {
  AssetSearchFormDataFromJSON,
  AssetSearchFormDataToJSON,
} from 'generated-sources';
import {
  assetSearchFormDataToUrlState,
  paramsToSearchState,
  searchFormDataToUrlState,
  searchUrlStateToAssetSearchFormData,
  searchUrlStateToFormData,
  type SearchUrlState,
} from '../searchUrlState';

/** a full SearchUrlState from a partial (defaults: no facets, no My-data scope, no sort) */
const state = (partial: Partial<SearchUrlState> = {}): SearchUrlState => ({
  query: '',
  facets: {},
  ...partial,
});

/**
 * ST-3 (ADR D11) — a saved search stores the search spec, and REAPPLY rebuilds the shareable param URL from
 * it via `searchStateToParams(...)`. `searchFormDataToUrlState` is the inverse of `searchUrlStateToFormData`
 * for the shared `SearchFormData` half; this file proves that round-trip is loss-free for every field the
 * URL carries (query + facets + the My-data scope + its depths + sort) and that a malformed /
 * defensively-empty spec degrades to the empty search instead of throwing (there is no error boundary — a
 * throw white-screens the app, IT-006). Since #1878 the stored spec is the FULL `AssetSearchFormData` and the
 * saved-search callers go through `assetSearchFormDataToUrlState` — the last `describe` below is the lock that
 * proves EVERY dimension survives capture → wire → reapply, and that the lock itself cannot be bypassed by
 * the next dimension.
 *
 * <p>This is the REAPPLY direction, and it is where a silent scope loss actually bites: a user saves a search,
 * reopens it, and quietly gets a different result set. ST-8 (#1842) therefore proves both that the new scope
 * group survives the round-trip AND that a spec stored before ST-8 — which carries only the legacy
 * `my_objects` boolean — still reapplies as the owned scope.
 */
describe('searchFormDataToUrlState — SearchFormData → URL state (ST-3 / D11)', () => {
  it('round-trips a representative URL state through the form-data spec (identity)', () => {
    const s = state({
      query: 'sales orders',
      myData: ['MY_OBJECTS', 'DOWNSTREAM'],
      downstreamDepth: 2,
      sort: 'updated_at',
      facets: { datasources: [1, 2], tags: [7], statuses: [3] },
    });
    expect(searchFormDataToUrlState(searchUrlStateToFormData(s))).toEqual(s);
  });

  it('a spec saved BEFORE ST-8 (my_objects only) reapplies as the owned scope', () => {
    const legacySpec: SearchFormData = { query: 'x', myObjects: true, filters: {} };
    expect(searchFormDataToUrlState(legacySpec).myData).toEqual(['MY_OBJECTS']);
    const legacyUnset: SearchFormData = { query: 'x', myObjects: false, filters: {} };
    expect(searchFormDataToUrlState(legacyUnset).myData).toBeUndefined();
  });

  it('a stored scope wins over the legacy flag, and unknown stored tokens fail closed', () => {
    const spec = {
      query: 'x',
      myObjects: true,
      myData: ['UPSTREAM', 'NONSENSE'],
      filters: {},
    } as SearchFormData;
    expect(searchFormDataToUrlState(spec).myData).toEqual(['UPSTREAM']);
  });

  it('an out-of-range stored depth degrades to the default rather than reaching the request', () => {
    const spec = {
      query: 'x',
      myData: ['UPSTREAM'],
      upstreamDepth: 99,
      filters: {},
    } as SearchFormData;
    expect(searchFormDataToUrlState(spec).upstreamDepth).toBeUndefined();
  });

  it('round-trips the empty (browse) state — identity', () => {
    const s = state();
    expect(searchFormDataToUrlState(searchUrlStateToFormData(s))).toEqual(s);
  });

  it('fails closed on an unknown sort token → dropped to undefined (the per-context default)', () => {
    // The fixture was `'popularity'` until ST-9 (#1843) made that a KNOWN token; `'garbage'` is the
    // searchUrlState.test.ts idiom for "not in the allow-list" — the assertion is unchanged.
    const spec: SearchFormData = { query: 'x', sort: 'garbage', filters: {} };
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

/**
 * #1878 / ADR D11 "one canonical spec, two surfaces" — the invariant, LOCKED. ST-4 added `asset_kinds` and
 * ST-7 added `favorites` to the URL + the request object while the saved spec stayed `SearchFormData`, so
 * "Save current search" silently stored a different search (LSN-042). Nothing asserted "every dimension of the
 * URL state survives a saved search", so the second instance shipped exactly like the first. This describe is
 * that assertion, closed on BOTH sides:
 *  - `Required<SearchUrlState>` makes the fixture fail to COMPILE the moment a new key joins the URL state;
 *  - the wire-key set-equality fails the moment a new property is regenerated onto `AssetSearchFormData`
 *    (the generated `ToJSON` emits every wire key explicitly, so a 10th key shows up here whether or not
 *    `SearchUrlState` knows about it).
 * Either way the next dimension goes RED here before it can ship unsaveable.
 */
describe('saved-search round-trip — one canonical spec, two surfaces (D11 / #1878)', () => {
  /** EVERY dimension the URL carries, all set — adding a key to SearchUrlState breaks this at compile time. */
  const full: Required<SearchUrlState> = {
    query: 'sales orders',
    facets: {
      entityClasses: [1],
      types: [2],
      tags: [3, 33],
      namespaces: [4],
      datasources: [5],
      owners: [6],
      groups: [7],
      statuses: [8],
    },
    myData: ['MY_OBJECTS', 'UPSTREAM', 'DOWNSTREAM'],
    upstreamDepth: 2,
    downstreamDepth: 3,
    sort: 'name',
    assetKinds: ['TERM', 'QUERY_EXAMPLE'],
    favorites: 'yes',
    // ST-9 (#1843) — the tenth dimension; a bound of 0 is a real value (the falsy-zero trap), so pin both ends.
    popularity: { min: 1, max: 5 },
  };

  /**
   * The wire keys of AssetSearchFormData — nine at #1878, ten since ST-9 (#1843) added `popularity`. A regenerated
   * eleventh key must fail this, by design: it means a dimension reached the request object without saved-search
   * support (the LSN-042 class).
   */
  const WIRE_KEYS = [
    'asset_kinds',
    'downstream_depth',
    'favorites',
    'filters',
    'my_data',
    'my_objects',
    'popularity',
    'query',
    'sort',
    'upstream_depth',
  ];

  /** capture (the form) → the wire (the generated mapper, both directions, through real JSON) → reapply */
  const roundTrip = (state: SearchUrlState): SearchUrlState =>
    assetSearchFormDataToUrlState(
      AssetSearchFormDataFromJSON(
        JSON.parse(
          JSON.stringify(
            AssetSearchFormDataToJSON(searchUrlStateToAssetSearchFormData(state))
          )
        )
      )
    );

  it('a fully-populated search survives capture → stored spec → reapply, deep-equal (identity)', () => {
    expect(roundTrip(full)).toEqual(full);
  });

  it('the wire carries exactly the known dimensions — a dimension regenerated onto the request object without saved-search support fails here', () => {
    const wire = AssetSearchFormDataToJSON(searchUrlStateToAssetSearchFormData(full));
    expect(Object.keys(wire).sort()).toEqual(WIRE_KEYS);
  });

  it('a popularity range survives capture → stored spec → reapply, including a bound of 0 and an open end (ST-9)', () => {
    // [0,0] is "never viewed": both bounds are 0 — the value a truthiness check would drop.
    const neverViewed = { ...full, popularity: { min: 0, max: 0 } };
    expect(roundTrip(neverViewed)).toEqual(neverViewed);
    // an open upper end stays open (no max on the wire, none on reapply)
    const atLeast = { ...full, popularity: { min: 4 } };
    expect(roundTrip(atLeast)).toEqual(atLeast);
    const upTo = { ...full, popularity: { max: 2 } };
    expect(roundTrip(upTo)).toEqual(upTo);
  });

  it('a stored popularity range is read through the same fail-closed rules as the URL — inverted, junk or out of range never reaches the request (ST-9)', () => {
    const at = (popularity: unknown) =>
      assetSearchFormDataToUrlState({
        query: 'q',
        filters: {},
        popularity,
      } as unknown as AssetSearchFormData);
    // inverted → no range (the server answers empty for a LIVE inverted request; a stored one reapplies as no filter —
    // and the server's own read-side sanitiser drops it too, so the two surfaces agree)
    expect(at({ min: 10, max: 2 })).toEqual(state({ query: 'q' }));
    // a non-integer bound poisons the whole range
    expect(at({ min: 'abc', max: 5 })).toEqual(state({ query: 'q' }));
    // out of range is CLAMPED, mirroring the server
    expect(at({ min: -3, max: 99 })).toEqual(
      state({ query: 'q', popularity: { min: 0, max: 20 } })
    );
    // a non-object is junk, never a throw
    expect(() => at('4..9')).not.toThrow();
    expect(at('4..9')).toEqual(state({ query: 'q' }));
    expect(at([4, 9])).toEqual(state({ query: 'q' }));
    // an empty object is "no range" (never DE-scopes)
    expect(at({})).toEqual(state({ query: 'q' }));
  });

  it('favorites=no is a real filter (only un-starred assets) and survives as such', () => {
    const s = { ...full, favorites: 'no' as const };
    expect(roundTrip(s)).toEqual(s);
    expect(
      assetSearchFormDataToUrlState({ favorites: false, filters: {} }).favorites
    ).toBe('no');
  });

  it('a row saved BEFORE #1878 reapplies exactly as it did — the same URL state, no new params (R5)', () => {
    // The shape a legacy row actually returns post-widening: the two fields explicitly null.
    const legacy = {
      query: 'orders',
      sort: 'name',
      filters: {},
      favorites: null,
      assetKinds: null,
    } as unknown as AssetSearchFormData;
    expect(assetSearchFormDataToUrlState(legacy)).toEqual(
      state({ query: 'orders', sort: 'name' })
    );
    expect(assetSearchFormDataToUrlState(legacy)).toEqual(
      searchFormDataToUrlState(legacy)
    );
  });

  it('fails closed PER FIELD on a stale / mistyped stored spec, and never throws (R6-FE)', () => {
    const stale = {
      query: 'q',
      filters: {},
      assetKinds: ['BOGUS', 'TERM'],
      favorites: 'yes', // a string, not the boolean the wire defines
    } as unknown as AssetSearchFormData;
    expect(() => assetSearchFormDataToUrlState(stale)).not.toThrow();
    expect(assetSearchFormDataToUrlState(stale)).toEqual(
      state({ query: 'q', assetKinds: ['TERM'] })
    );
    const notAList = {
      query: 'q',
      filters: {},
      assetKinds: 'TERM',
    } as unknown as AssetSearchFormData;
    expect(assetSearchFormDataToUrlState(notAList)).toEqual(state({ query: 'q' }));
    expect(() => assetSearchFormDataToUrlState({} as AssetSearchFormData)).not.toThrow();
    expect(() =>
      assetSearchFormDataToUrlState(undefined as unknown as AssetSearchFormData)
    ).not.toThrow();
    expect(
      assetSearchFormDataToUrlState(undefined as unknown as AssetSearchFormData)
    ).toEqual(state());
  });

  it('captures the FULL current search from a literal location.search — the form path (R3)', () => {
    const search = '?q=it155&favorites=yes&asset_kinds[]=TERM&sort=name';
    const captured = searchUrlStateToAssetSearchFormData(paramsToSearchState(search));
    expect(captured.favorites).toBe(true);
    expect(captured.assetKinds).toEqual(['TERM']);
    expect(captured.sort).toBe('name');
    expect(captured.query).toBe('it155');
  });
});
