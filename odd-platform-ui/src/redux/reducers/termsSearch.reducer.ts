import { getType } from 'typesafe-actions';
import * as actions from 'redux/actions';
import {
  SearchFilter,
  CountableSearchFilter,
  TermSearchFacetsData,
} from 'generated-sources';
import {
  Action,
  TermsFacetStateUpdate,
  TermsSearchFilterStateSynced,
  TermSearchState,
  TermsSearchFacetStateById,
  TermsFacetNames,
} from 'redux/interfaces';
import mapValues from 'lodash/mapValues';
import get from 'lodash/get';
import values from 'lodash/values';
import reduce from 'lodash/reduce';
import assignWith from 'lodash/assignWith';

export const initialState: TermSearchState = {
  termSearchId: '',
  query: '',
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

const updateTermSearchState = (
  state: TermSearchState,
  payload: TermSearchFacetsData
): TermSearchState => {
  const newTermSearchFacetsById = mapValues(
    payload.facetState,
    facetOptions =>
      facetOptions &&
      reduce<
        CountableSearchFilter | SearchFilter,
        TermsSearchFacetStateById
      >(
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
    termSearchId: payload.searchId,
    query: payload.query,
    facetState:
      payload.searchId !== state.termSearchId
        ? newTermSearchFacetsById
        : mapValues(state.facetState, (facetState, facetName) =>
            assignWith<
              TermsSearchFacetStateById,
              TermsSearchFacetStateById
            >(
              facetState || {},
              newTermSearchFacetsById[facetName as TermsFacetNames] || {},
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

const updateTermFacet = (
  state: TermSearchState,
  payload: TermsFacetStateUpdate
): TermSearchState => {
  if (!payload.facetName) return state;
  // Unselect previous type
  let selectedOptionState: TermsSearchFilterStateSynced | undefined;
  if (payload.facetSingle) {
    const selectedOption = values(
      state.facetState[payload.facetName]
    ).find(filter => filter.selected);
    if (selectedOption) {
      selectedOptionState = {
        entityId: get(
          // todo replace all entityId in this file with termId
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

const clearTermFilters = (state: TermSearchState): TermSearchState => ({
  ...state,
  isFacetsStateSynced: false,
  facetState: mapValues(state.facetState, (filter, facetName) =>
    reduce<TermsSearchFacetStateById, TermsSearchFacetStateById>(
      state.facetState[facetName as TermsFacetNames],
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
    )
  ),
});

const reducer = (
  state = initialState,
  action: Action
): TermSearchState => {
  switch (action.type) {
    case getType(actions.createTermSearchAction.success):
    case getType(actions.getTermSearchAction.success):
    case getType(actions.updateTermSearchAction.success):
      return updateTermSearchState(state, action.payload);
    case getType(actions.getTermSearchResultsAction.success):
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
    case getType(actions.getTermSearchSuggestionsAction.success):
      return {
        ...state,
        suggestions: action.payload,
      };
    case getType(actions.changeTermSearchFilterAction):
      return updateTermFacet(state, action.payload);
    case getType(actions.clearTermSearchFiltersAction):
      return clearTermFilters(state);
    case getType(actions.getTermSearchFacetOptionsAction.success):
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
