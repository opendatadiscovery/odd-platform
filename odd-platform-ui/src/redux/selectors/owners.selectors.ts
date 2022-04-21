import { createSelector } from 'reselect';
import { RootState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/selectors/loader-selectors';
import { getDataEntityId } from 'redux/selectors/dataentity.selectors';
import { getTermId } from 'redux/selectors/termDetails.selectors';
import { OwnersState } from 'redux/interfaces/state';
import { Owner } from 'generated-sources';

const ownersState = ({ owners }: RootState): OwnersState => owners;

const getOwnersListFetchingStatus = createFetchingSelector('GET_OWNERS');
export const getOwnersCreateStatus = createFetchingSelector('POST_OWNERS');
export const getOwnerUpdateStatus = createFetchingSelector('PUT_OWNER');
export const deleteOwnersUpdateStatus =
  createFetchingSelector('DELETE_OWNER');

export const getIsOwnerCreating = createSelector(
  getOwnersCreateStatus,
  status => status === 'fetching'
);

export const getIsOwnerUpdating = createSelector(
  getOwnerUpdateStatus,
  status => status === 'fetching'
);

export const getIsOwnerDeleting = createSelector(
  deleteOwnersUpdateStatus,
  status => status === 'fetching'
);

export const getIsOwnersListFetching = createSelector(
  getOwnersListFetchingStatus,
  status => status === 'fetching'
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
  getOwnersListFetchingStatus,
  getOwnerToExclude,
  (owners, fetchingStatus, ownerIdToExclude) =>
    owners.allIds.reduce((acc: Owner[], ownerId) => {
      if (ownerId !== ownerIdToExclude) acc.push(owners.byId[ownerId]);
      return [...acc];
    }, [])
);

export const getDataEntityOwnership = createSelector(
  ownersState,
  getDataEntityId,
  (owners, dataEntityId) =>
    owners.ownershipDataEntity[dataEntityId]?.allIds.map(
      id => owners.ownershipDataEntity[dataEntityId].byId[id]
    ) || []
);

// Term Details

export const getTermDetailsOwnership = createSelector(
  ownersState,
  getTermId,
  (owners, termId) =>
    owners.ownershipTermDetails[termId]?.allIds.map(
      id => owners.ownershipTermDetails[termId].byId[id]
    ) || []
);
