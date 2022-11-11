import type { RolesState } from 'redux/interfaces';
import type { Role } from 'generated-sources';
import { rolesActTypePrefix } from 'redux/actions';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';

export const rolesAdapter = createEntityAdapter<Role>({
  selectId: role => role.id,
});

export const initialState: RolesState = {
  pageInfo: { total: 0, page: 0, hasNext: true },
  ...rolesAdapter.getInitialState(),
};

export const rolesSlice = createSlice({
  name: rolesActTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(thunks.fetchRolesList.fulfilled, (state, { payload }) => {
      const { items, pageInfo } = payload;

      state.pageInfo = pageInfo;

      if (pageInfo.page > 1) {
        rolesAdapter.setMany(state, items);
        return state;
      }
      rolesAdapter.setAll(state, items);
      return state;
    });
    builder.addCase(thunks.createRole.fulfilled, (state, { payload }) => {
      rolesAdapter.addOne(state, payload);
    });
    builder.addCase(thunks.updateRole.fulfilled, (state, { payload }) => {
      rolesAdapter.upsertOne(state, payload);
    });
    builder.addCase(thunks.deleteRole.fulfilled, (state, { payload }) => {
      rolesAdapter.removeOne(state, payload);
    });
  },
});

export default rolesSlice.reducer;
