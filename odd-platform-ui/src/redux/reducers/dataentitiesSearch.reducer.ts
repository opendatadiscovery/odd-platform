import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import {
  SearchFacetsData,
  SearchFilter,
  CountableSearchFilter,
} from 'generated-sources';
import {
  SearchState,
  Action,
  FacetStateUpdate,
  SearchFacetStateById,
  SearchFacetNames,
  SearchFilterStateSynced,
} from 'redux/interfaces';
import mapValues from 'lodash/mapValues';
import get from 'lodash/get';
import values from 'lodash/values';
import reduce from 'lodash/reduce';
import assignWith from 'lodash/assignWith';

export const initialState: SearchState = {
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
  payload: SearchFacetsData
): SearchState => {
  const newSearchFacetsById = mapValues(
    payload.facetState,
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
    searchId: payload.searchId,
    query: payload.query,
    myObjects: !!payload.myObjects,
    totals: payload.facetState.entityClasses?.reduce(
      (acc, facetOption) => ({
        ...acc,
        [facetOption.name]: facetOption,
      }),
      {
        all: payload.total || 0,
        myObjectsTotal: payload.myObjectsTotal || 0,
      }
    ),
    facetState:
      payload.searchId !== state.searchId
        ? newSearchFacetsById
        : mapValues(state.facetState, (facetState, facetName) =>
            assignWith<SearchFacetStateById, SearchFacetStateById>(
              facetState || {},
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
        total: payload.total || 0,
        hasNext: true,
      },
    },
  };
};

const updateFacet = (
  state: SearchState,
  payload: FacetStateUpdate
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
};

const clearFilters = (state: SearchState): SearchState => ({
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
});

const reducer = (state = initialState, action: Action): SearchState => {
  switch (action.type) {
    case getType(actions.createDataEntitySearchAction.success):
    case getType(actions.getDataEntitySearchAction.success):
    case getType(actions.updateDataEntitySearchAction.success):
      return updateSearchState(state, action.payload);
    case getType(actions.getDataEntitySearchResultsAction.success):
      return {
        ...state,
        results: {
          items:
            action.payload.pageInfo.page > 1
              ? [...state.results.items, ...action.payload.items]
              : action.payload.items,
          pageInfo: action.payload.pageInfo,
        },
      };
    case getType(actions.getDataEntitySearchSuggestionsAction.success):
      return {
        ...state,
        suggestions: action.payload,
      };
    case getType(actions.changeDataEntitySearchFilterAction):
      return updateFacet(state, action.payload);
    case getType(actions.clearDataEntitySearchFiltersAction):
      return clearFilters(state);
    case getType(actions.getSearchFacetOptionsAction.success):
      return action.payload.facetName
        ? {
            ...state,
            facets: {
              ...state.facets,
              [action.payload.facetName]: {
                items: action.payload.facetOptions,
                pageInfo: action.payload.page,
              },
            },
          }
        : state;
    default:
      return state;
  }
};

export default reducer;
