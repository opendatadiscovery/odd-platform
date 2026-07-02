import { createSlice } from '@reduxjs/toolkit';
import mapValues from 'lodash/mapValues';
import reduce from 'lodash/reduce';
import values from 'lodash/values';
import pickBy from 'lodash/pickBy';
import get from 'lodash/get';
import { dataEntitiesSearchActionTypePrefix } from 'redux/actions';
import * as thunks from 'redux/thunks';
import type {
  DataEntitySearchState,
  FacetStateUpdate,
  SearchFacetNames,
  SearchFacetStateById,
  SearchFilterStateSynced,
} from 'redux/interfaces';
import type {
  CountableSearchFilter,
  SearchFacetsData,
  SearchFilter,
  SearchFormData,
} from 'generated-sources';
import { assignWith } from 'redux/lib/helpers';

const initialState: DataEntitySearchState = {
  searchId: '',
  query: '',
  myObjects: false,
  totals: {},
  results: {
    items: [],
    pageInfo: { total: 0, page: 0, hasNext: true },
  },
  suggestions: [],
  facets: {},
  facetState: {},
  isFacetsStateSynced: true,
  dataEntitySearchHighlightById: {},
};

const isSearchIdsEquals = (oldId: string, newId: string) => oldId === newId;

const updateSearchState = (
  state: DataEntitySearchState,
  { payload, meta }: { payload: SearchFacetsData; meta?: { arg?: unknown } }
): DataEntitySearchState => {
  const { facetState, searchId, query, myObjects, total, myObjectsTotal } = payload;

  const setFacetOptionsById = (
    facetOptions: CountableSearchFilter[] | SearchFilter[] | undefined,
    facetName: string
  ) =>
    reduce<CountableSearchFilter | SearchFilter, SearchFacetStateById>(
      facetOptions,
      (memo, facetOption) => ({
        ...memo,
        [facetOption.id]: {
          entityId: facetOption.id,
          // A URL-derived create request carries facet IDS only, and the server echoes the request's names
          // back — so an echoed sidebar filter can arrive name-less (name:null on the wire). Never let that
          // blank a label the client already knows (the optimistic entry / a prior response). A fresh
          // deep-link has no known name to preserve — recipient-side label backfill is a logged follow-up.
          entityName:
            facetOption.name ??
            state.facetState[facetName as SearchFacetNames]?.[facetOption.id]?.entityName,
          selected: 'selected' in facetOption ? !!facetOption.selected : true,
          syncedState: true,
        },
      }),
      {}
    );

  const newSearchFacetsById = mapValues(facetState, setFacetOptionsById);

  const totals = facetState.entityClasses?.reduce(
    (acc, facetOption) => ({
      ...acc,
      [facetOption.name]: facetOption,
    }),
    { all: total || 0, myObjectsTotal: myObjectsTotal || 0 }
  );

  const assignFacetStateWithNewFacets = (
    currFacetState: SearchFacetStateById,
    facetName: string
  ) =>
    assignWith<SearchFacetStateById, SearchFacetStateById>(
      currFacetState || {},
      newSearchFacetsById[facetName as SearchFacetNames] || {},
      (currFilterState, syncedFilterState) => {
        if (currFilterState && currFilterState.selected !== syncedFilterState.selected) {
          return { ...currFilterState, syncedState: false }; // Keep unsynced filter state (due to debounce).
        }
        return syncedFilterState;
      }
    );

  // ST-1b — create-per-URL-state (the reader creates a fresh session per distinct URL) makes EVERY committed
  // state a NEW searchId, so the new-session branch below runs each time. A plain REPLACE would drop an option
  // the user toggled WHILE this create was in flight (an optimistic entry the create never saw) — a reachable
  // lost-update on a rapid 2nd facet toggle. Reconcile against what THIS create actually requested
  // (`meta.arg.searchFormData.filters`): an optimistic option whose `selected` differs from the request is a
  // PENDING change made AFTER the create was issued — keep it (so `isFacetsStateSynced` stays false, the mirror
  // re-fires, and the newer state is created); everything the create covered takes the authoritative server
  // value. This handles a pending SELECT and a pending DESELECT symmetrically — a `!(id in serverFacet)`
  // heuristic could not REMOVE a facet, because a facet deselected mid-flight is still `selected` in that
  // create's response (the B1 lost-update / stranded-`synced` class). A legacy `get.fulfilled` carries no
  // `searchFormData` ⇒ requested empty ⇒ a clean REPLACE (a legacy session load has no optimistic locals).
  const isNewSession = !isSearchIdsEquals(state.searchId, searchId);

  // `meta.arg` is the thunk arg (typed `unknown` — the shared handler serves create/update/get, whose arg
  // shapes differ). The create (and legacy update) arg carries `searchFormData`; a legacy session GET has
  // none → requested empty → a clean REPLACE (correct: a legacy load has no optimistic locals to reconcile).
  const requestedFilters = (meta?.arg as { searchFormData?: SearchFormData } | undefined)
    ?.searchFormData?.filters;
  const requestedSelectedIds = (facetName: SearchFacetNames): Set<number> =>
    new Set(
      (requestedFilters?.[facetName] ?? [])
        .filter(filter => filter.selected)
        .map(filter => filter.entityId)
    );

  const carryPendingLocals = (facetName: string): SearchFacetStateById => {
    const serverFacet = newSearchFacetsById[facetName as SearchFacetNames] || {};
    const oldFacet = state.facetState[facetName as SearchFacetNames] || {};
    const requestedSelected = requestedSelectedIds(facetName as SearchFacetNames);
    const pendingLocals = pickBy(
      oldFacet,
      option =>
        !option.syncedState && option.selected !== requestedSelected.has(option.entityId)
    );
    return { ...serverFacet, ...pendingLocals };
  };

  const nextFacetState = isNewSession
    ? mapValues({ ...state.facetState, ...newSearchFacetsById }, (_facet, facetName) =>
        carryPendingLocals(facetName)
      )
    : mapValues(state.facetState, assignFacetStateWithNewFacets);

  const hasPendingLocals =
    isNewSession &&
    values(nextFacetState).some(facet =>
      values(facet).some(option => !option.syncedState)
    );

  return {
    ...state,
    searchId,
    query,
    myObjects: !!myObjects,
    totals,
    facetState: nextFacetState,
    isFacetsStateSynced: !hasPendingLocals,
    results: {
      items: [],
      pageInfo: { page: 0, total: total || 0, hasNext: true },
    },
  };
};

export const dataEntitiesSearchSlice = createSlice({
  name: dataEntitiesSearchActionTypePrefix,
  initialState,
  reducers: {
    clearDataEntitySearchFacets: (
      state: DataEntitySearchState
    ): DataEntitySearchState => {
      const getClearedFacetState = (_: SearchFacetStateById, facetName: string) => {
        if (facetName === 'entityClasses') return state.facetState.entityClasses; // Not clearing entityClasses filter
        return reduce<SearchFacetStateById, SearchFacetStateById>(
          state.facetState[facetName as SearchFacetNames],
          (acc, facetOption) => {
            if (facetOption.selected) {
              acc[facetOption.entityId] = {
                ...facetOption,
                selected: false,
                syncedState: false,
              };
            } else {
              acc[facetOption.entityId] = facetOption;
            }
            return acc;
          },
          {}
        );
      };

      return {
        ...state,
        isFacetsStateSynced: false,
        facetState: mapValues(state.facetState, getClearedFacetState),
      };
    },

    changeDataEntitySearchFacet: (
      state: DataEntitySearchState,
      { payload }: { payload: FacetStateUpdate }
    ): DataEntitySearchState => {
      const { facetName, facetOptionId, facetOptionName, facetOptionState, facetSingle } =
        payload;

      const currentFacetState = state.facetState[facetName];

      if (!facetName) return state;
      // Unselect previous type
      let selectedOptionState: SearchFilterStateSynced | undefined;
      if (facetSingle) {
        const selectedOption = values(currentFacetState).find(filter => filter.selected);

        if (selectedOption) {
          const entityId = get(selectedOption, 'entityId', get(selectedOption, 'id'));
          const entityName = get(
            selectedOption,
            'entityName',
            get(selectedOption, 'name')
          );

          selectedOptionState = entityId
            ? {
                entityId,
                entityName,
                selected: false,
                syncedState: false,
              }
            : undefined;
        }
      }

      const myObjects =
        facetName === 'entityClasses' ? facetOptionId === 'my' : state.myObjects;

      return {
        ...state,
        isFacetsStateSynced: false,
        myObjects,
        facetState: {
          ...state.facetState,
          [facetName]: {
            ...currentFacetState,
            ...(selectedOptionState && {
              [selectedOptionState.entityId]: selectedOptionState,
            }),
            ...(facetOptionId &&
              typeof facetOptionId === 'number' && {
                [facetOptionId]: {
                  entityId: facetOptionId,
                  entityName: facetOptionName,
                  selected: facetOptionState,
                  syncedState: false,
                },
              }),
          },
        },
        results: {
          items: [],
          pageInfo: { page: 0, total: 0, hasNext: true },
        },
      };
    },

    updateSearchQuery: (
      state: DataEntitySearchState,
      { payload }: { payload: string }
    ): DataEntitySearchState => {
      state.query = payload;
      return state;
    },
  },

  extraReducers: builder => {
    builder.addCase(thunks.createDataEntitiesSearch.fulfilled, updateSearchState);
    builder.addCase(thunks.updateDataEntitiesSearch.fulfilled, updateSearchState);
    builder.addCase(thunks.getDataEntitiesSearch.fulfilled, updateSearchState);

    builder.addCase(
      thunks.fetchDataEntitySearchResults.fulfilled,
      (state, { payload }): DataEntitySearchState => {
        const { items, pageInfo } = payload;
        const paginatedItems =
          pageInfo.page > 1 ? [...state.results.items, ...items] : items;

        return { ...state, results: { items: paginatedItems, pageInfo } };
      }
    );

    builder.addCase(
      thunks.getDataEntitySearchFacetOptions.fulfilled,
      (state, { payload }): DataEntitySearchState => {
        const { facetName, facetOptions, page } = payload;

        return facetName
          ? {
              ...state,
              facets: { ...state.facets, [facetName]: { items: facetOptions, page } },
            }
          : state;
      }
    );

    builder.addCase(thunks.fetchSearchSuggestions.fulfilled, (state, { payload }) => {
      state.suggestions = payload;
    });

    builder.addCase(
      thunks.fetchDataEntitySearchHighlights.fulfilled,
      (state, { payload }) => {
        const { highlights, entityId: dataEntityId } = payload;

        state.dataEntitySearchHighlightById = {
          ...state.dataEntitySearchHighlightById,
          [dataEntityId]: highlights,
        };
      }
    );
  },
});

export const {
  clearDataEntitySearchFacets,
  changeDataEntitySearchFacet,
  updateSearchQuery,
} = dataEntitiesSearchSlice.actions;

export default dataEntitiesSearchSlice.reducer;
