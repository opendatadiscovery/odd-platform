import { createSelector } from '@reduxjs/toolkit';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';
import { ProfileState, RootState } from 'redux/interfaces';
import { emptyArr } from 'lib/constants';

const profileState = ({ profile }: RootState): ProfileState => profile;

export const getIdentity = createSelector(
  profileState,
  profile => profile.owner?.identity
);

export const getOwnership = createSelector(profileState, profile => profile.owner?.owner);

export const getGlobalPermissions = createSelector(
  profileState,
  profile => profile.owner?.identity.actions?.allowed || emptyArr
);

export const getDataEntityPermissions = (dataEntityId?: number) =>
  createSelector(profileState, profile =>
    dataEntityId ? profile.permissions.byDataEntityId[dataEntityId]?.allowed : emptyArr
  );

export const isDataEntityPermissionsAlreadyFetched = (dataEntityId?: number) =>
  createSelector(profileState, profile =>
    dataEntityId
      ? Object.keys(profile.permissions.byDataEntityId).includes(String(dataEntityId))
      : false
  );

export const getAssociationRequestStatus = createSelector(
  profileState,
  profile => profile.owner?.associationRequest?.status
);

export const getSupposedOwnerName = createSelector(
  profileState,
  profile => profile.owner?.associationRequest?.ownerName
);

export const getIdentityFetchingStatuses = createStatusesSelector(
  actions.fetchIdentityActionType
);
