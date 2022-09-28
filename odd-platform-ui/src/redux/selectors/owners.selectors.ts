import { createSelector } from '@reduxjs/toolkit';
import { RootState, OwnersState } from 'redux/interfaces';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import { Owner } from 'generated-sources';
import * as actions from 'redux/actions';
import { getTermId } from 'redux/selectors/terms.selectors';

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

export const getOwnersListPageInfo = createSelector(
  ownersState,
  ownersList => ownersList.pageInfo
);

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

export const getDataEntityOwnership = (dataEntityId: number) =>
  createSelector(
    ownersState,
    owners =>
      owners.ownershipDataEntity[dataEntityId]?.allIds.map(
        id => owners.ownershipDataEntity[dataEntityId].byId[id]
      ) || []
  );

// Terms
export const getTermOwnership = createSelector(
  ownersState,
  getTermId,
  (owners, termId) =>
    owners.ownershipTermDetails[termId]?.allIds.map(
      id => owners.ownershipTermDetails[termId].byId[id]
    ) || []
);
