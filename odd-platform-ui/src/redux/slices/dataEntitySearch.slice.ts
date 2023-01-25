import { createSlice } from '@reduxjs/toolkit';
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
} from 'generated-sources';
import mapValues from 'lodash/mapValues';
import reduce from 'lodash/reduce';
import { assignWith } from 'redux/lib/helpers';
import values from 'lodash/values';
import get from 'lodash/get';

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
  { payload }: { payload: SearchFacetsData }
): DataEntitySearchState => {
  const { facetState, searchId, query, myObjects, total, myObjectsTotal } = payload;

  const setFacetOptionsById = (
    facetOptions: CountableSearchFilter[] | SearchFilter[] | undefined
  ) =>
    reduce<CountableSearchFilter | SearchFilter, SearchFacetStateById>(
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

  return {
    ...state,
    searchId,
    query,
    myObjects: !!myObjects,
    totals,
    facetState: !isSearchIdsEquals(state.searchId, searchId)
      ? newSearchFacetsById
      : mapValues(state.facetState, assignFacetStateWithNewFacets),
    isFacetsStateSynced: true,
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
