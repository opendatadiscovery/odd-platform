import { AppInfoState } from 'redux/interfaces';
import { createSlice } from '@reduxjs/toolkit';
import { appInfoActionPrefix } from 'redux/actions';
import * as thunks from 'redux/thunks';

export const initialState: AppInfoState = { appInfo: {} };

export const appInfoSlice = createSlice({
  name: appInfoActionPrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(thunks.fetchAppInfo.fulfilled, (state, { payload }) => {
      state.appInfo = payload;
    });
  },
});

export default appInfoSlice.reducer;
