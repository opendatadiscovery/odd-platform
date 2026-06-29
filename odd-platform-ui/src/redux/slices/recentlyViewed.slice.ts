import { createSlice } from '@reduxjs/toolkit';
import type { RecentlyViewedState } from 'redux/interfaces';
import { recentlyViewedActTypePrefix } from 'redux/actions';
import { assetRefKey, recentlyViewedAssetKey } from 'redux/lib/recentlyViewed';
import * as thunks from 'redux/thunks';

export const initialState: RecentlyViewedState = {
  list: [],
  pageInfo: { total: 0, page: 0, hasNext: true },
  recencyByKey: {},
};

export const recentlyViewedSlice = createSlice({
  name: recentlyViewedActTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(thunks.recordRecentlyViewed.fulfilled, (state, { payload }) => {
      state.recencyByKey[assetRefKey(payload.ref.assetKind, payload.ref.assetId)] =
        payload.ref;
    });
    builder.addCase(thunks.removeRecentlyViewed.fulfilled, (state, { payload }) => {
      state.recencyByKey[payload.key] = null;
      state.list = state.list.filter(
        item => recentlyViewedAssetKey(item) !== payload.key
      );
    });
    builder.addCase(thunks.fetchRecentlyViewedList.fulfilled, (state, { payload }) => {
      const { items, pageInfo } = payload;
      state.pageInfo = pageInfo;
      state.list = pageInfo.page > 1 ? [...state.list, ...items] : items;
      items.forEach(item => {
        state.recencyByKey[recentlyViewedAssetKey(item)] = {
          assetKind: item.assetKind,
          assetId: item.dataEntity?.id ?? item.term?.id ?? item.queryExample?.id ?? -1,
          lastViewedAt: item.lastViewedAt,
        };
      });
    });
    builder.addCase(thunks.fetchRecentlyViewedStatus.fulfilled, (state, { payload }) => {
      const { asked, viewed } = payload;
      // Authoritative batch hydrate: default every asked ref we don't yet know to null (not recently
      // viewed), then set the viewed subset to its ref. Keys already known are left intact, so an
      // in-flight hydrate can never clobber a just-recorded optimistic value.
      asked.forEach(ref => {
        const key = assetRefKey(ref.assetKind, ref.assetId);
        if (state.recencyByKey[key] === undefined) {
          state.recencyByKey[key] = null;
        }
      });
      viewed.forEach(ref => {
        state.recencyByKey[assetRefKey(ref.assetKind, ref.assetId)] = ref;
      });
    });
  },
});

export default recentlyViewedSlice.reducer;
