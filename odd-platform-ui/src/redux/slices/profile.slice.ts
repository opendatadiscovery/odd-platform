import { createSlice } from '@reduxjs/toolkit';
import { profileActionPrefix } from 'redux/actions';
import { ProfileState } from 'redux/interfaces';
import * as thunks from 'redux/thunks';

export const initialState: ProfileState = {
  owner: { identity: { username: '' } },
  permissions: { dataEntity: {} },
};

export const profileSlice = createSlice({
  name: profileActionPrefix,
  initialState,
  reducers: {
    setProfileOwnerName: (state, { payload }: { payload: string }) => ({
      ...state,
      owner: { ...state.owner, owner: { name: payload, id: 0 } },
    }),
  },
  extraReducers: builder => {
    builder.addCase(
      thunks.fetchIdentity.fulfilled,
      (state, { payload }) => {
        state.owner = payload;
      }
    );
    builder.addCase(
      thunks.createOwnerAssociationRequest.fulfilled,
      (state, { payload }) => {
        state.owner.associationRequest = payload;
      }
    );
    builder.addCase(
      thunks.fetchDataEntityPermissions.fulfilled,
      (state, { payload }) => {
        state.permissions.dataEntity = payload;
      }
    );
  },
});

export const { setProfileOwnerName } = profileSlice.actions;

export default profileSlice.reducer;
