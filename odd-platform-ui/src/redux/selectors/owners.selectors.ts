import { createSelector } from '@reduxjs/toolkit';
import type { RootState, OwnersState, CurrentPageInfo } from 'redux/interfaces';
import { getTermId } from 'redux/selectors/terms.selectors';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import type { Owner } from 'generated-sources';
import * as actions from 'redux/actions';

const ownersState = ({ owners }: RootState): OwnersState => owners;

export const getOwnerCreatingStatuses = createStatusesSelector(actions.createOwnerAction);
export const getOwnerUpdatingStatuses = createStatusesSelector(actions.updateOwnerAction);
export const getOwnerDeletingStatuses = createStatusesSelector(actions.deleteOwnerAction);

export const getOwnerListFetchingStatuses = createStatusesSelector(
  actions.fetchOwnersAction
);

export const getOwnersList = createSelector(ownersState, (owners): Owner[] =>
  owners.allIds.map(id => owners.byId[id])
);

export const getOwnersListPageInfo = createSelector(
  ownersState,
  (ownersList): CurrentPageInfo => ownersList.pageInfo
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
