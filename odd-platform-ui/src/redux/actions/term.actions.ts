import { createAsyncAction } from 'typesafe-actions';
import { TermDetails } from 'generated-sources';
import { DeleteTerm } from 'redux/interfaces/terms';

export const updateTermAction = createAsyncAction(
  'PUT_TERM__REQUEST',
  'PUT_TERM__SUCCESS',
  'PUT_TERM__FAILURE'
)<undefined, TermDetails, undefined>();

export const createTermAction = createAsyncAction(
  'POST_TERM__REQUEST',
  'POST_TERM__SUCCESS',
  'POST_TERM__FAILURE'
)<undefined, TermDetails, undefined>();

export const deleteTermAction = createAsyncAction(
  'DELETE_TERM__REQUEST',
  'DELETE_TERM__SUCCESS',
  'DELETE_TERM__FAILURE'
)<undefined, DeleteTerm, undefined>();
