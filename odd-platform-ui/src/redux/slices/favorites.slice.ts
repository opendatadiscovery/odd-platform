import { createSlice } from '@reduxjs/toolkit';
import type { FavoritesState } from 'redux/interfaces';
import { favoritesActTypePrefix } from 'redux/actions';
import { assetRefKey, favoriteAssetKey } from 'redux/lib/favorites';
import * as thunks from 'redux/thunks';

export const initialState: FavoritesState = {
  favoritedByKey: {},
  list: [],
  pageInfo: { total: 0, page: 0, hasNext: true },
};

export const favoritesSlice = createSlice({
  name: favoritesActTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(thunks.addFavorite.fulfilled, (state, { payload }) => {
      state.favoritedByKey[payload.key] = true;
    });
    builder.addCase(thunks.removeFavorite.fulfilled, (state, { payload }) => {
      state.favoritedByKey[payload.key] = false;
      state.list = state.list.filter(item => favoriteAssetKey(item) !== payload.key);
    });
    builder.addCase(thunks.fetchFavoritesList.fulfilled, (state, { payload }) => {
      const { items, pageInfo } = payload;
      state.pageInfo = pageInfo;
      state.list = pageInfo.page > 1 ? [...state.list, ...items] : items;
      items.forEach(item => {
        state.favoritedByKey[favoriteAssetKey(item)] = true;
      });
    });
    builder.addCase(thunks.fetchFavoritesStatus.fulfilled, (state, { payload }) => {
      payload.forEach(ref => {
        state.favoritedByKey[assetRefKey(ref.assetKind, ref.assetId)] = true;
      });
    });
  },
});

export default favoritesSlice.reducer;
