import type { AppInfoState } from 'redux/interfaces';
import { createSlice } from '@reduxjs/toolkit';
import { appInfoActionPrefix } from 'redux/actions';
import * as thunks from 'redux/thunks';

export const initialState: AppInfoState = { appInfo: {}, activeFeatures: [], links: [] };

export const appInfoSlice = createSlice({
  name: appInfoActionPrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(thunks.fetchAppInfo.fulfilled, (state, { payload }) => {
      state.appInfo = payload;
    });

    builder.addCase(thunks.fetchActiveFeatures.fulfilled, (state, { payload }) => {
      state.activeFeatures = payload;
    });

    builder.addCase(thunks.fetchAppLinks.fulfilled, (state, { payload }) => {
      state.links = payload;
    });
  },
});

export default appInfoSlice.reducer;
