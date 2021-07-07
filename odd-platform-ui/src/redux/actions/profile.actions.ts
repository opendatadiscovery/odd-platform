import { createAsyncAction } from 'typesafe-actions';
import { AssociatedOwner } from 'generated-sources';

export const fetchIdentityAction = createAsyncAction(
  'GET_IDENTITY__REQUEST',
  'GET_IDENTITY__SUCCESS',
  'GET_IDENTITY__FAILURE'
)<undefined, AssociatedOwner | void, undefined>();
