import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { ownerAssociationActionPrefix } from 'redux/actions';
import { OwnerAssociationState } from 'redux/interfaces';
import * as thunks from 'redux/thunks';
import { OwnerAssociationRequest } from 'generated-sources';

export const ownerAssociationAdapter =
  createEntityAdapter<OwnerAssociationRequest>({
    selectId: request => request.id,
  });

export const initialState: OwnerAssociationState = {
  pageInfo: { total: 0, page: 0, hasNext: true },
  ...ownerAssociationAdapter.getInitialState(),
};

export const ownerAssociationSlice = createSlice({
  name: ownerAssociationActionPrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      thunks.fetchIdentity.fulfilled,
      (state, { payload }) => {}
    );
  },
});

export default ownerAssociationSlice.reducer;
