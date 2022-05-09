import { createSelector } from '@reduxjs/toolkit';
import { RootState } from 'redux/interfaces';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import { OwnersState } from 'redux/interfaces/state';
import { Owner } from 'generated-sources';
import * as actions from 'redux/actions';
import { getDataEntityId } from './dataentity.selectors';

const ownersState = ({ owners }: RootState): OwnersState => owners;

export const getOwnerCreatingStatuses = createStatusesSelector(
  actions.createOwnerAction
);

export const getOwnerUpdatingStatuses = createStatusesSelector(
  actions.updateOwnerAction
);

export const getOwnerDeletingStatuses = createStatusesSelector(
  actions.deleteOwnerAction
);

export const getOwnerListFetchingStatuses = createStatusesSelector(
  actions.fetchOwnersAction
);

export const getOwnersList = createSelector(ownersState, owners =>
  owners.allIds.map(id => owners.byId[id])
);

export const getOwnersListPage = createSelector(
  ownersState,
  ownersList => ownersList.pageInfo
);

// Data Entity Metadata
const getOwnerToExclude = (
  _: RootState,
  ownerIdToExclude: number | undefined
) => ownerIdToExclude;

export const getOwnerSuggestionsList = createSelector(
  ownersState,
  getOwnerToExclude,
  (owners, ownerIdToExclude) =>
    owners.allIds.reduce((acc: Owner[], ownerId) => {
      if (ownerId !== ownerIdToExclude) acc.push(owners.byId[ownerId]);
      return [...acc];
    }, [])
);

export const getDataEntityOwnership = createSelector(
  ownersState,
  getDataEntityId,
  (owners, dataEntityId) =>
    owners.ownership[dataEntityId]?.allIds.map(
      id => owners.ownership[dataEntityId].byId[id]
    ) || []
);
