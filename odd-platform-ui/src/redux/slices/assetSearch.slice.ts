import { createSlice } from '@reduxjs/toolkit';
import { assetSearchActionTypePrefix } from 'redux/actions';
import * as thunks from 'redux/thunks';
import type { AssetSearchState } from 'redux/interfaces';

const initialState: AssetSearchState = {
  results: {
    items: [],
    pageInfo: { total: 0, page: 0, hasNext: true },
  },
};

export const assetSearchSlice = createSlice({
  name: assetSearchActionTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(thunks.searchAssets.pending, (state, action): AssetSearchState => {
      // A page-1 request is a fresh query / facet / sort / asset-type change: clear the list so the
      // skeleton shows and the incoming page REPLACES cleanly. Later pages keep the accumulated list.
      if (action.meta.arg.page === 1) {
        return {
          results: { items: [], pageInfo: { total: 0, page: 0, hasNext: true } },
        };
      }
      return state;
    });

    builder.addCase(
      thunks.searchAssets.fulfilled,
      (state, { payload }): AssetSearchState => {
        const { items, pageInfo } = payload;
        // Page 1 REPLACES (a fresh query / facet set); later pages APPEND (infinite scroll) —
        // the same accumulation `fetchDataEntitySearchResults` uses for the DE-session list.
        const paginatedItems =
          pageInfo.page > 1 ? [...state.results.items, ...items] : items;

        return { ...state, results: { items: paginatedItems, pageInfo } };
      }
    );
  },
});

export default assetSearchSlice.reducer;
