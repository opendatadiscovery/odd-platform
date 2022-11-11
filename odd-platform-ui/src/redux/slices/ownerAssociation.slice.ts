import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { ownerAssociationActionPrefix } from 'redux/actions';
import type { OwnerAssociationState } from 'redux/interfaces';
import * as thunks from 'redux/thunks';
import type { OwnerAssociationRequest } from 'generated-sources';

export const ownerAssociationAdapter = createEntityAdapter<OwnerAssociationRequest>({
  selectId: request => request.id,
});

export const initialState: OwnerAssociationState = {
  newRequests: {
    pageInfo: { total: 0, page: 0, hasNext: true },
    ...ownerAssociationAdapter.getInitialState(),
  },
  resolvedRequests: {
    pageInfo: { total: 0, page: 0, hasNext: true },
    ...ownerAssociationAdapter.getInitialState(),
  },
};

export const ownerAssociationSlice = createSlice({
  name: ownerAssociationActionPrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      thunks.createOwnerAssociationRequest.fulfilled,
      (state, { payload }) => {
        ownerAssociationAdapter.addOne(state.newRequests, payload);
      }
    );

    builder.addCase(
      thunks.fetchOwnerAssociationRequestList.fulfilled,
      (state, { payload }) => {
        const { items, pageInfo, active } = payload;

        if (active) {
          state.newRequests.pageInfo = pageInfo;
          if (pageInfo.page > 1) {
            ownerAssociationAdapter.setMany(state.newRequests, items);
            return state;
          }
          ownerAssociationAdapter.setAll(state.newRequests, items);
          return state;
        }

        state.resolvedRequests.pageInfo = pageInfo;
        if (pageInfo.page > 1) {
          ownerAssociationAdapter.setMany(state.resolvedRequests, items);
          return state;
        }
        ownerAssociationAdapter.setAll(state.resolvedRequests, items);
        return state;
      }
    );

    builder.addCase(
      thunks.updateOwnerAssociationRequest.fulfilled,
      (state, { payload }) => {
        ownerAssociationAdapter.removeOne(state.newRequests, payload);
        state.newRequests.pageInfo.total -= 1;
        state.resolvedRequests.pageInfo.total += 1;
      }
    );
  },
});

export default ownerAssociationSlice.reducer;
