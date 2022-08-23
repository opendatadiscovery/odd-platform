import { createActionType } from 'lib/redux/helpers';

export const profileActionPrefix = 'profile';
export const fetchIdentityActionType = createActionType(
  profileActionPrefix,
  'fetchIdentity'
);
