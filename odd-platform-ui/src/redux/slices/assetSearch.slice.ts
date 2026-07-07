import { createSlice } from '@reduxjs/toolkit';
import { assetSearchActionTypePrefix } from 'redux/actions';
import * as thunks from 'redux/thunks';
import type { AssetSearchState } from 'redux/interfaces';

const initialState: AssetSearchState = {
  results: {
    items: [],
    pageInfo: { hasNext: true },
  },
};

export const assetSearchSlice = createSlice({
  name: assetSearchActionTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(thunks.searchAssets.pending, (state, action): AssetSearchState => {
      // ST-5b keyset: a FIRST-page request carries no cursor (a fresh query / facet / sort / asset-type
      // change) — clear the list so the skeleton shows and the incoming page REPLACES cleanly. A cursor
      // request (the next page in an infinite scroll) keeps the accumulated list.
      if (!action.meta.arg.cursor) {
        return { results: { items: [], pageInfo: { hasNext: true } } };
      }
      return state;
    });

    builder.addCase(
      thunks.searchAssets.fulfilled,
      (state, { payload, meta }): AssetSearchState => {
        const { items, pageInfo } = payload;
        // No cursor on the request = the first page → REPLACE; a cursor = a later page → APPEND (infinite
        // scroll). The old page-number signal (`page === 1`) is gone under keyset pagination.
        const paginatedItems = meta.arg.cursor
          ? [...state.results.items, ...items]
          : items;

        return { ...state, results: { items: paginatedItems, pageInfo } };
      }
    );
  },
});

export default assetSearchSlice.reducer;
