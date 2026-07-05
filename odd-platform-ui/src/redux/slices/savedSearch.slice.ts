import { createSlice } from '@reduxjs/toolkit';
import type { SavedSearchState } from 'redux/interfaces';
import { savedSearchActTypePrefix } from 'redux/actions';
import * as thunks from 'redux/thunks';

export const initialState: SavedSearchState = {
  list: [],
  pageInfo: { total: 0, page: 0, hasNext: true },
};

export const savedSearchSlice = createSlice({
  name: savedSearchActTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(thunks.fetchSavedSearchList.fulfilled, (state, { payload }) => {
      const { items, pageInfo } = payload;
      state.pageInfo = pageInfo;
      state.list = pageInfo.page > 1 ? [...state.list, ...items] : items;
    });
    builder.addCase(thunks.createSavedSearch.fulfilled, (state, { payload }) => {
      // Newest first, matching the server's list ordering, so a just-saved search is at the top.
      state.list = [payload, ...state.list];
    });
    builder.addCase(thunks.updateSavedSearch.fulfilled, (state, { payload }) => {
      state.list = state.list.map(item => (item.id === payload.id ? payload : item));
    });
    builder.addCase(thunks.deleteSavedSearch.fulfilled, (state, { payload }) => {
      state.list = state.list.filter(item => item.id !== payload);
    });
  },
});

export default savedSearchSlice.reducer;
