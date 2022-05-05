import { createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import { OwnersState } from 'redux/interfaces';
import filter from 'lodash/filter';
import { ownersActionPrefix } from 'redux/actions';

export const initialState: OwnersState = {
  byId: {},
  allIds: [],
  pageInfo: {
    total: 0,
    page: 0,
    hasNext: true,
  },
  ownership: {},
};

export const ownersSlice = createSlice({
  name: ownersActionPrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      thunks.fetchOwnersList.fulfilled,
      (state, { payload }) => {
        const { ownersList, pageInfo } = payload;
        return ownersList.reduce(
          (memo: OwnersState, owner) => ({
            ...memo,
            byId: {
              ...memo.byId,
              [owner.id]: {
                ...memo.byId[owner.id],
                ...owner,
              },
            },
            allIds: [...memo.allIds, owner.id],
          }),
          {
            ...state,
            allIds: pageInfo.page > 1 ? [...state.allIds] : [],
            pageInfo,
          }
        );
      }
    );

    builder.addCase(thunks.updateOwner.fulfilled, (state, { payload }) => {
      const { ownerId, owner } = payload;

      return {
        ...state,
        byId: {
          ...state.byId,
          [ownerId]: owner,
        },
      };
    });

    // get ownership from data entity details
    builder.addCase(
      thunks.fetchDataEntityDetails.fulfilled,
      (state, { payload }) => {
        const { id: dataEntityId, ownership: dataEntityOwnership } =
          payload;

        return {
          ...state,
          ownership: {
            ...state.ownership,
            ...(dataEntityOwnership && {
              [dataEntityId]: {
                byId: dataEntityOwnership.reduce(
                  (memo, ownership) => ({
                    ...memo,
                    [ownership.id]: ownership,
                  }),
                  {}
                ),
                allIds: dataEntityOwnership.map(ownership => ownership.id),
              },
            }),
          },
        };
      }
    );

    builder.addCase(
      thunks.createDataEntityOwnership.fulfilled,
      (state, { payload }) => {
        const { dataEntityId, ownership } = payload;

        return {
          ...state,
          ownership: {
            ...state.ownership,
            [dataEntityId]: {
              byId: {
                ...state.ownership[dataEntityId].byId,
                [ownership.id]: ownership,
              },
              allIds: [
                ownership.id,
                ...state.ownership[dataEntityId].allIds,
              ],
            },
          },
        };
      }
    );

    builder.addCase(
      thunks.updateDataEntityOwnership.fulfilled,
      (state, { payload }) => {
        const { dataEntityId, ownership } = payload;

        return {
          ...state,
          ownership: {
            ...state.ownership,
            [dataEntityId]: {
              ...state.ownership[dataEntityId],
              byId: {
                ...state.ownership[dataEntityId].byId,
                [ownership.id]: ownership,
              },
            },
          },
        };
      }
    );

    builder.addCase(
      thunks.deleteDataEntityOwnership.fulfilled,
      (state, { payload }) => {
        const { dataEntityId, ownershipId } = payload;

        return {
          ...state,
          ownership: {
            ...state.ownership,
            [dataEntityId]: {
              ...state.ownership[dataEntityId],
              allIds: filter(
                state.ownership[dataEntityId].allIds,
                id => id !== ownershipId
              ),
            },
          },
        };
      }
    );
  },
});

export default ownersSlice.reducer;
