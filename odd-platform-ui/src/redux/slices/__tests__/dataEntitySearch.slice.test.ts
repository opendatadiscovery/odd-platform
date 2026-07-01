import { describe, expect, it, vi } from 'vitest';
import reducer from 'redux/slices/dataEntitySearch.slice';
import { createDataEntitiesSearch } from 'redux/thunks';
import type { DataEntitySearchState, SearchFacetStateById } from 'redux/interfaces';
import type { SearchFacetsData } from 'generated-sources';

/**
 * ST-1b — the create-per-URL-state (REPLACE) reader means every committed search is a NEW searchId, so
 * `updateSearchState` takes the new-session branch each time. A plain REPLACE would drop an option the user
 * toggled WHILE a create was in flight (an optimistic `syncedState:false` entry not yet reflected by any
 * create) — a reachable lost-update on a rapid 2nd facet selection. The reducer must carry those PENDING
 * locals forward while keeping the server response authoritative for everything it covers. (Same class as
 * the favorites "never clobbers a value the user just toggled" batch-hydrate guard.)
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

const fulfil = (payload: SearchFacetsData) =>
  createDataEntitiesSearch.fulfilled(payload, 'req', {
    searchFormData: { filters: {} },
  } as never);

describe('dataEntitySearch slice — create-per-URL-state facet REPLACE (ST-1b)', () => {
  it('preserves an in-flight optimistic selection across a new-session REPLACE (no lost update)', () => {
    // tag 5 was sent in the create now responding; tag 7 was toggled AFTER, still pending — both unsynced.
    const start = baseState({
      searchId: 'session-1',
      isFacetsStateSynced: false,
      facetState: { tags: { ...localTag(5, true, false), ...localTag(7, true, false) } },
    });

    const next = reducer(start, fulfil(created('session-2', [5])));

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

    const next = reducer(start, fulfil(created('session-2', [5, 9])));

    expect(Object.keys(next.facetState.tags ?? {}).sort()).toEqual(['5', '9']);
    expect(next.facetState.tags?.[9]).toMatchObject({
      selected: true,
      syncedState: true,
    });
    expect(next.isFacetsStateSynced).toBe(true);
  });

  it('preserves an in-flight DESELECT across the REPLACE (a removed facet is not resurrected)', () => {
    // user deselected tag 5 (optimistic false) while a create was in flight; that create returns no tags.
    const start = baseState({
      searchId: 'session-1',
      isFacetsStateSynced: false,
      facetState: { tags: localTag(5, false, false) },
    });

    const next = reducer(start, fulfil(created('session-2', [])));

    // the deselect wins — tag 5 stays unselected (the server's stale "selected" view does not resurrect it).
    expect(next.facetState.tags?.[5]).toMatchObject({ selected: false });
  });
});
