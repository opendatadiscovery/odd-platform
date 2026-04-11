import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type {
  UnknownAsyncThunkFulfilledAction,
  UnknownAsyncThunkPendingAction,
  UnknownAsyncThunkRejectedAction,
} from '@reduxjs/toolkit/dist/matchers';
import type { ErrorState, LoaderSliceState } from 'redux/interfaces';

export const initialState: LoaderSliceState = {
  statuses: {},
  errors: {},
};

export const loaderSlice = createSlice({
  name: 'loader',
  initialState,
  reducers: {
    resetLoaderByAction: (
      state: LoaderSliceState,
      { payload }: PayloadAction<string>
    ) => {
      delete state.statuses[payload];
      delete state.errors[payload];
    },
  },
  extraReducers: builder => {
    builder
      .addMatcher(
        (action): action is UnknownAsyncThunkPendingAction =>
          action.type.endsWith('/pending'),
        (state, { type }) => {
          state.statuses[type.replace('/pending', '')] = 'pending';
        }
      )
      .addMatcher(
        (action): action is UnknownAsyncThunkFulfilledAction =>
          action.type.endsWith('/fulfilled'),
        (state, { type }) => {
          state.statuses[type.replace('/fulfilled', '')] = 'fulfilled';
        }
      )
      .addMatcher(
        (action): action is UnknownAsyncThunkRejectedAction =>
          action.type.endsWith('/rejected'),
        (state, { type, payload }) => {
          state.statuses[type.replace('/rejected', '')] = 'rejected';
          state.errors[type.replace('/rejected', '')] = payload as ErrorState;
        }
      );
  },
});

export const { resetLoaderByAction } = loaderSlice.actions;

export default loaderSlice.reducer;
