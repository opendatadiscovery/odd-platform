import { createSlice } from '@reduxjs/toolkit';
import { profileActionPrefix } from 'redux/actions';
import { ProfileState } from 'redux/interfaces';
import * as thunks from 'redux/thunks';
import { AssociatedOwner } from 'generated-sources';

export const initialState: ProfileState = {};

const updateIdentity = (
  state: ProfileState,
  { payload }: { payload: AssociatedOwner }
) => {
  state.owner = payload;
};

export const profileSlice = createSlice({
  name: profileActionPrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(thunks.fetchIdentity.fulfilled, updateIdentity);
  },
});

export default profileSlice.reducer;
