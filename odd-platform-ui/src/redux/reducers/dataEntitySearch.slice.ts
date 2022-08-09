import { createSlice } from '@reduxjs/toolkit';
import { dataEntitiesSearchActionTypePrefix } from 'redux/actions';
import * as thunks from 'redux/thunks';
import {
  FacetStateUpdate,
  SearchFacetNames,
  SearchFacetStateById,
  SearchFilterStateSynced,
  SearchState,
} from 'redux/interfaces';
import {
  CountableSearchFilter,
  SearchFacetsData,
  SearchFilter,
} from 'generated-sources';
import mapValues from 'lodash/mapValues';
import reduce from 'lodash/reduce';
import { assignWith } from 'lib/redux/helpers';
import values from 'lodash/values';
import get from 'lodash/get';

const initialState: SearchState = {
  searchId: '',
  query: '',
  myObjects: false,
  totals: {},
  results: {
    items: [],
    pageInfo: {
      total: 0,
      page: 0,
      hasNext: true,
    },
  },
  suggestions: [],
  facets: {},
  facetState: {},
  isFacetsStateSynced: true,
};

const updateSearchState = (
  state: SearchState,
  { payload }: { payload: SearchFacetsData }
): SearchState => {
  const { facetState, searchId, query, myObjects, total, myObjectsTotal } =
    payload;

  const newSearchFacetsById = mapValues(
    facetState,
    facetOptions =>
      facetOptions &&
      reduce<CountableSearchFilter | SearchFilter, SearchFacetStateById>(
        facetOptions,
        (memo, facetOption) => ({
          ...memo,
          [facetOption.id]: {
            entityId: facetOption.id,
            entityName: facetOption.name,
            selected:
              'selected' in facetOption ? !!facetOption.selected : true,
            syncedState: true,
          },
        }),
        {}
      )
  );

  return {
    ...state,
    searchId,
    query,
    myObjects: !!myObjects,
    totals: facetState.entityClasses?.reduce(
      (acc, facetOption) => ({
        ...acc,
        [facetOption.name]: facetOption,
      }),
      {
        all: total || 0,
        myObjectsTotal: myObjectsTotal || 0,
      }
    ),
    facetState:
      searchId !== state.searchId
        ? newSearchFacetsById
        : mapValues(state.facetState, (currFacetState, facetName) =>
            assignWith<SearchFacetStateById, SearchFacetStateById>(
              currFacetState || {},
              newSearchFacetsById[facetName as SearchFacetNames] || {},
              (currFilterState, syncedFilterState) => {
                if (
                  currFilterState &&
                  currFilterState.selected !== syncedFilterState.selected
                ) {
                  return { ...currFilterState, syncedState: false }; // Keep unsynced filter state (due to debounce).
                }
                return syncedFilterState;
              }
            )
          ),
    isFacetsStateSynced: true,
    results: {
      items: [],
      pageInfo: {
        page: 0,
        total: total || 0,
        hasNext: true,
      },
    },
  };
};

export const dataEntitiesSearchSlice = createSlice({
  name: dataEntitiesSearchActionTypePrefix,
  initialState,
  reducers: {
    clearDataEntitySearchFacets: (state: SearchState): SearchState => ({
      ...state,
      isFacetsStateSynced: false,
      facetState: mapValues(state.facetState, (filter, facetName) => {
        if (facetName === 'entityClasses')
          return state.facetState.entityClasses; // Not clearing entityClasses filter
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
      }),
    }),

    changeDataEntitySearchFacet: (
      state: SearchState,
      { payload }: { payload: FacetStateUpdate }
    ): SearchState => {
      if (!payload.facetName) return state;
      // Unselect previous type
      let selectedOptionState: SearchFilterStateSynced | undefined;
      if (payload.facetSingle) {
        const selectedOption = values(
          state.facetState[payload.facetName]
        ).find(filter => filter.selected);
        if (selectedOption) {
          selectedOptionState = {
            entityId: get(
              selectedOption,
              'entityId',
              get(selectedOption, 'id')
            ),
            entityName: get(
              selectedOption,
              'entityName',
              get(selectedOption, 'name')
            ),
            selected: false,
            syncedState: false,
          };
        }
      }
      return {
        ...state,
        isFacetsStateSynced: false,
        myObjects:
          payload.facetName === 'entityClasses'
            ? payload.facetOptionId === 'my'
            : state.myObjects,
        facetState: {
          ...state.facetState,
          [payload.facetName]: {
            ...state.facetState[payload.facetName],
            ...(selectedOptionState && {
              [selectedOptionState.entityId]: selectedOptionState,
            }),
            ...(payload.facetOptionId &&
              typeof payload.facetOptionId === 'number' && {
                [payload.facetOptionId]: {
                  entityId: payload.facetOptionId,
                  entityName: payload.facetOptionName,
                  selected: payload.facetOptionState,
                  syncedState: false,
                },
              }),
          },
        },
        results: {
          items: [],
          pageInfo: {
            page: 0,
            total: 0,
            hasNext: true,
          },
        },
      };
    },
  },

  extraReducers: builder => {
    builder.addCase(
      thunks.createDataEntitiesSearch.fulfilled,
      updateSearchState
    );

    builder.addCase(
      thunks.updateDataEntitiesSearch.fulfilled,
      updateSearchState
    );

    builder.addCase(
      thunks.getDataEntitiesSearch.fulfilled,
      updateSearchState
    );

    builder.addCase(
      thunks.fetchDataEntitySearchResults.fulfilled,
      (state, { payload }): SearchState => {
        const { items, pageInfo } = payload;
        const paginatedItems =
          pageInfo.page > 1 ? [...state.results.items, ...items] : items;

        return { ...state, results: { items: paginatedItems, pageInfo } };
      }
    );

    builder.addCase(
      thunks.getDataEntitySearchFacetOptions.fulfilled,
      (state, { payload }): SearchState => {
        const { facetName, facetOptions, page } = payload;

        return facetName
          ? {
              ...state,
              facets: {
                ...state.facets,
                // TODO check pageInfo of page
                [facetName]: { items: facetOptions, page },
              },
            }
          : state;
      }
    );

    builder.addCase(
      thunks.fetchSearchSuggestions.fulfilled,
      (state, { payload }) => {
        state.suggestions = payload;
      }
    );
  },
});

export const { clearDataEntitySearchFacets, changeDataEntitySearchFacet } =
  dataEntitiesSearchSlice.actions;

export default dataEntitiesSearchSlice.reducer;
