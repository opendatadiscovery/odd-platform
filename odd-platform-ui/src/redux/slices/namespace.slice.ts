import { namespaceActionTypePrefix } from 'redux/actions';
import type { NamespacesState } from 'redux/interfaces';
import { type Namespace } from 'generated-sources';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';

export const namespaceAdapter = createEntityAdapter<Namespace>({
  selectId: namespace => namespace.id,
});

export const initialState: NamespacesState = {
  pageInfo: { total: 0, page: 0, hasNext: true },
  ...namespaceAdapter.getInitialState(),
};

export const namespaceSlice = createSlice({
  name: namespaceActionTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(thunks.fetchNamespaceList.fulfilled, (state, { payload }) => {
      const { namespaceList, pageInfo } = payload;

      state.pageInfo = pageInfo;

      if (pageInfo.page > 1) {
        namespaceAdapter.setMany(state, namespaceList);
        return state;
      }
      namespaceAdapter.setAll(state, namespaceList);
      return state;
    });

    builder.addCase(thunks.createNamespace.fulfilled, (state, { payload }) => {
      namespaceAdapter.addOne(state, payload);
    });

    builder.addCase(thunks.updateNamespace.fulfilled, (state, { payload }) => {
      namespaceAdapter.upsertOne(state, payload);
    });

    builder.addCase(thunks.deleteNamespace.fulfilled, (state, { payload }) => {
      namespaceAdapter.removeOne(state, payload);
    });
  },
});

export default namespaceSlice.reducer;
