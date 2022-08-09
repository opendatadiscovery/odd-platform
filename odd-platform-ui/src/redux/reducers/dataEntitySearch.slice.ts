import { createSlice } from '@reduxjs/toolkit';
import { dataEntitiesSearchActionTypePrefix } from 'redux/actions';
import * as thunks from 'redux/thunks';
import { SearchState } from 'redux/interfaces';

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

export const dataEntitiesSearchSlice = createSlice({
  name: dataEntitiesSearchActionTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
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

export default dataEntitiesSearchSlice.reducer;
