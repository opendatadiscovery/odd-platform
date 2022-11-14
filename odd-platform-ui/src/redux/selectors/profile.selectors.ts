import { createSelector } from '@reduxjs/toolkit';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';
import type { ProfileState, RootState } from 'redux/interfaces';
import { emptyArr } from 'lib/constants';
import type { PermissionResourceType } from 'generated-sources';

const profileState = ({ profile }: RootState): ProfileState => profile;

export const getIdentity = createSelector(
  profileState,
  profile => profile.owner?.identity
);

export const getOwnership = createSelector(profileState, profile => profile.owner?.owner);

export const getGlobalPermissions = createSelector(
  profileState,
  profile => profile.owner?.identity.permissions || emptyArr
);

export const getResourcePermissions = (
  resourceType: PermissionResourceType,
  resourceId: number | undefined
) =>
  createSelector(profileState, profile =>
    resourceId ? profile.permissions[resourceType][resourceId] || emptyArr : emptyArr
  );

export const isResourcePermissionsAlreadyFetched = (
  resourceType: PermissionResourceType,
  resourceId?: number
) =>
  createSelector(profileState, profile =>
    Object.keys(profile.permissions[resourceType]).includes(String(resourceId))
  );

export const getResourcePermissionsFetchingStatuses = createStatusesSelector(
  actions.fetchResourcePermissionsActionType
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
