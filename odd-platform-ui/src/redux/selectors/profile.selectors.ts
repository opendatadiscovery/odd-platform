import { createSelector } from '@reduxjs/toolkit';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';
import { ProfileState, RootState } from 'redux/interfaces';

const profileState = ({ profile }: RootState): ProfileState => profile;

export const getIdentity = createSelector(
  profileState,
  profile => profile.owner?.identity
);

export const getOwnership = createSelector(
  profileState,
  profile => profile.owner?.owner
);

export const getPermissions = createSelector(
  profileState,
  profile => profile.owner?.identity.permissions
);

export const getAssociationRequestStatus = createSelector(
  profileState,
  profile => profile.owner?.associationRequestStatus
);

export const getIdentityFetchingStatuses = createStatusesSelector(
  actions.fetchIdentityActionType
);
