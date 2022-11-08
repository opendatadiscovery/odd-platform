import { createSlice } from '@reduxjs/toolkit';
import { termsSearchActTypePrefix } from 'redux/actions';
import * as thunks from 'redux/thunks';
import type {
  SearchFacetStateById,
  SearchFilterStateSynced,
  TermSearchFacetNames,
  TermSearchFacetStateUpdate,
  TermSearchState,
  TermsSearchFacetStateById,
} from 'redux/interfaces';
import type {
  CountableSearchFilter,
  SearchFilter,
  TermSearchFacetsData,
} from 'generated-sources';
import mapValues from 'lodash/mapValues';
import reduce from 'lodash/reduce';
import values from 'lodash/values';
import get from 'lodash/get';
import { assignWith } from 'redux/lib/helpers';

const initialState: TermSearchState = {
  termSearchId: '',
  query: '',
  results: {
    items: [],
    pageInfo: { total: 0, page: 0, hasNext: true },
  },
  suggestions: [],
  facets: {},
  facetState: {},
  isFacetsStateSynced: true,
};

const updateTermsSearchState = (
  state: TermSearchState,
  { payload }: { payload: TermSearchFacetsData }
): TermSearchState => {
  const { searchId: termSearchId, facetState, total, query } = payload;

  const setFacetOptionsById = (
    facetOptions: CountableSearchFilter[] | SearchFilter[] | undefined
  ) =>
    reduce<CountableSearchFilter | SearchFilter, TermsSearchFacetStateById>(
      facetOptions,
      (memo, facetOption) => ({
        ...memo,
        [facetOption.id]: {
          entityId: facetOption.id,
          entityName: facetOption.name,
          selected: 'selected' in facetOption ? !!facetOption.selected : true,
          syncedState: true,
        },
      }),
      {}
    );

  const newTermSearchFacetsById = mapValues(facetState, setFacetOptionsById);

  const assignFacetStateWithNewFacets = (
    currFacetState: SearchFacetStateById,
    facetName: string
  ) =>
    assignWith<TermsSearchFacetStateById, TermsSearchFacetStateById>(
      currFacetState || {},
      newTermSearchFacetsById[facetName as TermSearchFacetNames] || {},
      (currFilterState, syncedFilterState) => {
        if (currFilterState && currFilterState.selected !== syncedFilterState.selected) {
          return { ...currFilterState, syncedState: false }; // Keep unsynced filter state (due to debounce).
        }
        return syncedFilterState;
      }
    );

  return {
    ...state,
    termSearchId,
    query,
    facetState:
      termSearchId !== state.termSearchId
        ? newTermSearchFacetsById
        : mapValues(state.facetState, assignFacetStateWithNewFacets),
    isFacetsStateSynced: true,
    results: {
      items: [],
      pageInfo: { page: 0, total: total || 0, hasNext: true },
    },
  };
};

export const termsSearchSlice = createSlice({
  name: termsSearchActTypePrefix,
  initialState,
  reducers: {
    clearTermSearchFacets: (state: TermSearchState): TermSearchState => {
      const getClearedFacetState = (_: TermsSearchFacetStateById, facetName: string) =>
        reduce<TermsSearchFacetStateById, TermsSearchFacetStateById>(
          state.facetState[facetName as TermSearchFacetNames],
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

      return {
        ...state,
        isFacetsStateSynced: false,
        facetState: mapValues(state.facetState, getClearedFacetState),
      };
    },

    changeTermSearchFacet: (
      state: TermSearchState,
      { payload }: { payload: TermSearchFacetStateUpdate }
    ): TermSearchState => {
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

      return {
        ...state,
        isFacetsStateSynced: false,
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

    updateTermSearchQuery: (
      state: TermSearchState,
      { payload }: { payload: string }
    ): TermSearchState => {
      state.query = payload;
      return state;
    },
  },

  extraReducers: builder => {
    builder.addCase(thunks.createTermSearch.fulfilled, updateTermsSearchState);
    builder.addCase(thunks.updateTermSearch.fulfilled, updateTermsSearchState);
    builder.addCase(thunks.getTermsSearch.fulfilled, updateTermsSearchState);
    builder.addCase(
      thunks.fetchTermsSearchResults.fulfilled,
      (state, { payload }): TermSearchState => {
        const { items, pageInfo } = payload;
        const paginatedItems =
          pageInfo.page > 1 ? [...state.results.items, ...items] : items;

        return { ...state, results: { items: paginatedItems, pageInfo } };
      }
    );

    builder.addCase(
      thunks.getTermsSearchFacetOptions.fulfilled,
      (state, { payload }): TermSearchState => {
        const { facetName, facetOptions, page } = payload;

        return facetName
          ? {
              ...state,
              facets: {
                ...state.facets,
                [facetName]: { items: facetOptions, page },
              },
            }
          : state;
      }
    );

    builder.addCase(thunks.fetchTermSearchSuggestions.fulfilled, (state, { payload }) => {
      state.suggestions = payload;
    });
  },
});

export const { clearTermSearchFacets, changeTermSearchFacet, updateTermSearchQuery } =
  termsSearchSlice.actions;

export default termsSearchSlice.reducer;
