import { describe, expect, it, vi } from 'vitest';
import reducer from 'redux/slices/dataEntitySearch.slice';
import { createDataEntitiesSearch } from 'redux/thunks';
import type { DataEntitySearchState, SearchFacetStateById } from 'redux/interfaces';
import type { SearchFacetsData, SearchFormDataFilters } from 'generated-sources';

/**
 * ST-1b — the create-per-URL-state (REPLACE) reader means every committed search is a NEW searchId, so
 * `updateSearchState` takes the new-session branch each time. A plain REPLACE would drop an option the user
 * toggled WHILE a create was in flight (an optimistic entry the create never saw) — a reachable lost-update
 * on a rapid 2nd facet toggle. The reducer RECONCILES the optimistic slice against what THIS create actually
 * requested (`meta.arg.searchFormData.filters`): an option whose `selected` differs from the request is a
 * PENDING change (made after the create was issued) → carried forward (synced stays false → the mirror
 * re-fires); everything the create covered takes the authoritative server value.
 *
 * This is the B1 fix (rework). The prior `!(id in serverFacet)` heuristic (a) stranded `isFacetsStateSynced`
 * on a resolved deselect / a never-echoed `statuses` select — blocking the Results.tsx re-fetch — and (b)
 * could not carry a pending DESELECT, because a facet deselected mid-flight is still `selected` in the
 * in-flight create's response. The optimistic-vs-requested reconciliation handles SELECT and DESELECT
 * symmetrically.
 */

// The thunks barrel pulls every api client at import; replace the module so no client is constructed.
vi.mock('lib/api', () => {
  const handler = { get: (_t: object, p: string) => (p === '__esModule' ? true : {}) };
  return new Proxy({ __esModule: true }, handler);
});
vi.mock('lib/errorHandling', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, showSuccessToast: vi.fn(), showServerErrorToast: vi.fn() };
});

const baseState = (over: Partial<DataEntitySearchState> = {}): DataEntitySearchState => ({
  searchId: '',
  query: '',
  myObjects: false,
  totals: {},
  results: { items: [], pageInfo: { total: 0, page: 0, hasNext: true } },
  suggestions: [],
  facets: {},
  facetState: {},
  isFacetsStateSynced: true,
  dataEntitySearchHighlightById: {},
  ...over,
});

const localTag = (
  entityId: number,
  selected: boolean,
  syncedState: boolean
): SearchFacetStateById => ({
  [entityId]: { entityId, entityName: `tag${entityId}`, selected, syncedState },
});

// A server create-response (search() = removeUnselected) returning the given selected tag ids.
const created = (searchId: string, tagIds: number[]): SearchFacetsData =>
  ({
    searchId,
    query: '',
    myObjects: false,
    total: tagIds.length,
    facetState: {
      entityClasses: [],
      tags: tagIds.map(id => ({ id, name: `tag${id}`, selected: true, count: 1 })),
    },
  }) as unknown as SearchFacetsData;

// The REAL ST-1b echo for a URL-derived create: the request carried ids only, so the server echoes the
// request's names back — name:null on the wire (captured live; see the IT-151 protocol). The names-present
// `created` above models a client that sent names (the legacy PUT delta shape).
const createdNameless = (searchId: string, tagIds: number[]): SearchFacetsData =>
  ({
    searchId,
    query: '',
    myObjects: false,
    total: tagIds.length,
    facetState: {
      entityClasses: [],
      tags: tagIds.map(id => ({ id, name: null })),
    },
  }) as unknown as SearchFacetsData;

// The create response, carrying the filters THIS create was issued FOR (meta.arg) — the reconciliation input.
const fulfil = (payload: SearchFacetsData, filters: SearchFormDataFilters = {}) =>
  createDataEntitiesSearch.fulfilled(payload, 'req', {
    searchFormData: { filters },
  } as never);

// the `tags` filter set the create requested (the reader sends selected ids as {entityId, selected:true}).
const reqTags = (ids: number[]): SearchFormDataFilters => ({
  tags: ids.map(entityId => ({ entityId, selected: true })),
});

describe('dataEntitySearch slice — create-per-URL-state facet REPLACE (ST-1b)', () => {
  it('preserves an in-flight optimistic selection across a new-session REPLACE (no lost update)', () => {
    // tag 5 was sent in the create now responding; tag 7 was toggled AFTER, still pending — both unsynced.
    const start = baseState({
      searchId: 'session-1',
      isFacetsStateSynced: false,
      facetState: { tags: { ...localTag(5, true, false), ...localTag(7, true, false) } },
    });

    // this create was issued for tag 5 only; tag 7 was toggled after → pending.
    const next = reducer(start, fulfil(created('session-2', [5]), reqTags([5])));

    // tag 5 is now confirmed by the server (synced); tag 7 is CARRIED (still pending) — not dropped.
    expect(next.facetState.tags?.[5]).toMatchObject({
      selected: true,
      syncedState: true,
    });
    expect(next.facetState.tags?.[7]).toMatchObject({
      selected: true,
      syncedState: false,
    });
    // a pending local remains → not fully synced, so the mirror re-fires and creates the newer state.
    expect(next.isFacetsStateSynced).toBe(false);
  });

  it('a clean new session (no pending locals) REPLACEs with exactly the server facet set', () => {
    const start = baseState({
      searchId: 'session-1',
      isFacetsStateSynced: true,
      facetState: { tags: localTag(5, true, true) },
    });

    const next = reducer(start, fulfil(created('session-2', [5, 9]), reqTags([5, 9])));

    expect(Object.keys(next.facetState.tags ?? {}).sort()).toEqual(['5', '9']);
    expect(next.facetState.tags?.[9]).toMatchObject({
      selected: true,
      syncedState: true,
    });
    expect(next.isFacetsStateSynced).toBe(true);
  });

  it('a RESOLVED deselect (the create excluded the facet) clears it AND re-syncs so results refetch (B1/T1)', () => {
    // user deselected tag 5; the create it triggered was issued WITHOUT tag 5 and returns no tags — the deselect
    // is resolved (the request reflects it), so it is NOT a pending local: tag 5 is dropped and synced returns
    // true. RED on the pre-fix base: the `!(id in serverFacet)` heuristic carried tag 5 as a {selected:false}
    // phantom → isFacetsStateSynced stranded false → Results.tsx never refetched (the deterministic B1 symptom).
    const start = baseState({
      searchId: 'session-1',
      isFacetsStateSynced: false,
      facetState: { tags: localTag(5, false, false) },
    });

    const next = reducer(start, fulfil(created('session-2', []), reqTags([])));

    expect(next.facetState.tags?.[5]).toBeUndefined(); // dropped, not carried as a phantom
    expect(next.isFacetsStateSynced).toBe(true); // ← the B1 gate: results can refetch (RED on base: false)
  });

  it('a PENDING deselect (toggled DURING an in-flight create) is preserved, not resurrected (round-3 parity)', () => {
    // create-A was issued for tag 7 (its response echoes 7 as selected); the user deselected 7 WHILE it was in
    // flight. The optimistic deselect (selected:false) differs from what create-A requested (selected) → it is a
    // PENDING change → carried, and synced stays false so the mirror re-fires and creates the newer (tag-less)
    // state. RED on the pre-fix base: the heuristic could not carry a removal (7 IS in the response), so the
    // server's selected:true resurrected 7 — the symmetric mirror-twin of the round-3 selection lost-update.
    const start = baseState({
      searchId: 'session-1',
      isFacetsStateSynced: false,
      facetState: { tags: localTag(7, false, false) },
    });

    const next = reducer(start, fulfil(created('session-2', [7]), reqTags([7])));

    expect(next.facetState.tags?.[7]).toMatchObject({ selected: false }); // the deselect wins (not resurrected)
    expect(next.isFacetsStateSynced).toBe(false); // pending → the mirror re-fires to create the tag-less state
  });

  it('keeps the known chip label when the echo is name-less (URL-derived creates carry ids only)', () => {
    // the user picked tag 5 from the dropdown — the optimistic entry carries the label; the URL-derived
    // create echoes {id:5, name:null}. The label must survive the REPLACE (RED on base: entityName nulled,
    // so the selected-filter chip rendered EMPTY ~1s after every sidebar selection).
    const start = baseState({
      searchId: 'session-1',
      isFacetsStateSynced: false,
      facetState: { tags: localTag(5, true, false) },
    });

    const next = reducer(start, fulfil(createdNameless('session-2', [5]), reqTags([5])));

    expect(next.facetState.tags?.[5]).toMatchObject({
      entityName: 'tag5', // preserved from the optimistic entry, not blanked by the null echo
      selected: true,
      syncedState: true,
    });
    expect(next.isFacetsStateSynced).toBe(true);
  });
});
