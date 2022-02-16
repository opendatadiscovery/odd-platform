import { createAsyncAction } from 'typesafe-actions';
import { DataSource, Token } from 'generated-sources';

export const updateTokenAction = createAsyncAction(
  'PUT_TOKEN__REQUEST',
  'PUT_TOKEN__SUCCESS',
  'PUT_TOKEN__FAILURE'
)<undefined, DataSource, undefined>();
