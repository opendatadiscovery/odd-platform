import { createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import type { OwnersState } from 'redux/interfaces';
import filter from 'lodash/filter';
import { ownersActionTypePrefix } from 'redux/actions';

export const initialState: OwnersState = {
  byId: {},
  allIds: [],
  pageInfo: { total: 0, page: 0, hasNext: true },
  ownershipDataEntity: {},
  ownershipTermDetails: {},
};

export const ownersSlice = createSlice({
  name: ownersActionTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(
      thunks.fetchOwnersList.fulfilled,
      (state, { payload }): OwnersState => {
        const { items, pageInfo } = payload;
        return items.reduce(
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

    builder.addCase(thunks.updateOwner.fulfilled, (state, { payload }): OwnersState => {
      const { ownerId, owner } = payload;

      return { ...state, byId: { ...state.byId, [ownerId]: owner } };
    });

    // get ownership from data entity details
    builder.addCase(
      thunks.fetchDataEntityDetails.fulfilled,
      (state, { payload }): OwnersState => {
        const { id: dataEntityId, ownership: dataEntityOwnership } = payload;

        return {
          ...state,
          ownershipDataEntity: {
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
      (state, { payload }): OwnersState => {
        const { dataEntityId, ownership } = payload;

        return {
          ...state,
          ownershipDataEntity: {
            ...state.ownershipDataEntity,
            [dataEntityId]: {
              byId: {
                ...state.ownershipDataEntity[dataEntityId]?.byId,
                [ownership.id]: ownership,
              },
              allIds: [
                ownership.id,
                ...(state.ownershipDataEntity[dataEntityId]?.allIds || []),
              ],
            },
          },
        };
      }
    );

    builder.addCase(
      thunks.updateDataEntityOwnership.fulfilled,
      (state, { payload }): OwnersState => {
        const { dataEntityId, ownership } = payload;

        return {
          ...state,
          ownershipDataEntity: {
            ...state.ownershipDataEntity,
            [dataEntityId]: {
              ...state.ownershipDataEntity[dataEntityId],
              byId: {
                ...state.ownershipDataEntity[dataEntityId].byId,
                [ownership.id]: ownership,
              },
            },
          },
        };
      }
    );

    builder.addCase(
      thunks.deleteDataEntityOwnership.fulfilled,
      (state, { payload }): OwnersState => {
        const { dataEntityId, ownershipId } = payload;

        return {
          ...state,
          ownershipDataEntity: {
            ...state.ownershipDataEntity,
            [dataEntityId]: {
              ...state.ownershipDataEntity[dataEntityId],
              allIds: filter(
                state.ownershipDataEntity[dataEntityId].allIds,
                id => id !== ownershipId
              ),
            },
          },
        };
      }
    );

    builder.addCase(
      thunks.createTermOwnership.fulfilled,
      (state, { payload }): OwnersState => {
        const { termId, ownership } = payload;

        return {
          ...state,
          ownershipTermDetails: {
            ...state.ownershipTermDetails,
            [termId]: {
              byId: {
                ...state.ownershipTermDetails[termId]?.byId,
                [ownership.id]: ownership,
              },
              allIds: [
                ownership.id,
                ...(state.ownershipTermDetails[termId]?.allIds || []),
              ],
            },
          },
        };
      }
    );

    builder.addCase(
      thunks.updateTermOwnership.fulfilled,
      (state, { payload }): OwnersState => {
        const { termId, ownershipId, ownership } = payload;

        return {
          ...state,
          ownershipTermDetails: {
            ...state.ownershipTermDetails,
            [termId]: {
              ...state.ownershipTermDetails[termId],
              byId: {
                ...state.ownershipTermDetails[termId].byId,
                [ownershipId]: ownership,
              },
            },
          },
        };
      }
    );

    builder.addCase(
      thunks.deleteTermOwnership.fulfilled,
      (state, { payload }): OwnersState => {
        const { termId, ownershipId } = payload;

        return {
          ...state,
          ownershipTermDetails: {
            ...state.ownershipTermDetails,
            [termId]: {
              ...state.ownershipTermDetails[termId],
              allIds: filter(
                state.ownershipTermDetails[termId].allIds,
                id => id !== ownershipId
              ),
            },
          },
        };
      }
    );

    builder.addCase(
      thunks.fetchTermDetails.fulfilled,
      (state, { payload }): OwnersState => {
        const term = payload;

        return {
          ...state,
          ownershipTermDetails: {
            ...state.ownershipTermDetails,
            ...(term.ownership && {
              [term.id]: {
                byId: term.ownership.reduce(
                  (memo, ownership) => ({
                    ...memo,
                    [ownership.id]: ownership,
                  }),
                  {}
                ),
                allIds: term.ownership.map(ownership => ownership.id),
              },
            }),
          },
        };
      }
    );
  },
});

export default ownersSlice.reducer;
