import { createAsyncAction } from 'typesafe-actions';
import { AppInfo } from 'generated-sources';

export const fetchAppInfo = createAsyncAction(
  'GET_APP_INFO__REQUEST',
  'GET_APP_INFO__SUCCESS',
  'GET_APP_INFO__FAILURE'
)<undefined, AppInfo | void, undefined>();
