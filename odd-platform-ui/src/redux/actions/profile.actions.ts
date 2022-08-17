import { createActionType } from 'redux/lib/helpers';

export const profileActionPrefix = 'profile';
export const fetchIdentityActionType = createActionType(
  profileActionPrefix,
  'fetchIdentity'
);
export const updateIdentityOwnerActionType = createActionType(
  profileActionPrefix,
  'updateIdenityOwner'
);
