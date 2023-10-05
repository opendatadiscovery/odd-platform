import { createSlice } from '@reduxjs/toolkit';
import type { AppInfoState } from 'redux/interfaces';
import { appInfoActionPrefix } from 'redux/actions';
import * as thunks from 'redux/thunks';

export const initialState: AppInfoState = { activeFeatures: [] };

export const appInfoSlice = createSlice({
  name: appInfoActionPrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(thunks.fetchActiveFeatures.fulfilled, (state, { payload }) => {
      state.activeFeatures = payload;
    });
  },
});

export default appInfoSlice.reducer;
