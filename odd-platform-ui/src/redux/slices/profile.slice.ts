import { createSlice } from '@reduxjs/toolkit';
import { profileActionPrefix } from 'redux/actions';
import type { ProfileState } from 'redux/interfaces';
import * as thunks from 'redux/thunks';
import { type Permission, PermissionResourceType } from 'generated-sources';

export const initialState: ProfileState = {
  owner: { identity: { username: '' } },
  permissions: Object.fromEntries(
    Object.values(PermissionResourceType).map(key => [key, {}])
  ) as Record<PermissionResourceType, Record<number, Permission[]>>,
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
    builder.addCase(thunks.fetchIdentity.fulfilled, (state, { payload }) => {
      state.owner = payload;
    });
    builder.addCase(thunks.fetchResourcePermissions.fulfilled, (state, { payload }) => {
      const { resourceId, permissionResourceType, permissions } = payload;
      state.permissions[permissionResourceType][resourceId] = permissions;
    });
  },
});

export const { setProfileOwnerName } = profileSlice.actions;

export default profileSlice.reducer;
