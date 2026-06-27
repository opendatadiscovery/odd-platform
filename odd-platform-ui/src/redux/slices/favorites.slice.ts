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
      const { asked, favorited } = payload;
      // Authoritative batch hydrate: a list resolves all its visible rows in one call. Default
      // every asked ref we don't yet know to false, then flip the favorited subset to true.
      // Keys already known (e.g. a just-toggled optimistic value) are left intact, so a hydrate
      // in flight can never clobber a user's explicit star/un-star.
      asked.forEach(ref => {
        const key = assetRefKey(ref.assetKind, ref.assetId);
        if (state.favoritedByKey[key] === undefined) {
          state.favoritedByKey[key] = false;
        }
      });
      favorited.forEach(ref => {
        state.favoritedByKey[assetRefKey(ref.assetKind, ref.assetId)] = true;
      });
    });
  },
});

export default favoritesSlice.reducer;
