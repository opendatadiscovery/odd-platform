import { createSlice } from '@reduxjs/toolkit';
import { profileActionPrefix } from 'redux/actions';
import { ProfileState } from 'redux/interfaces';
import * as thunks from 'redux/thunks';

export const initialState: ProfileState = {};

export const profileSlice = createSlice({
  name: profileActionPrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      thunks.fetchIdentity.fulfilled,
      (state, { payload }) => {
        state.owner = payload;
      }
    );
    builder.addCase(
      thunks.updateIdentityOwner.fulfilled,
      (state, { payload }) => {
        state.owner = payload;
      }
    );
  },
});
export default profileSlice.reducer;
