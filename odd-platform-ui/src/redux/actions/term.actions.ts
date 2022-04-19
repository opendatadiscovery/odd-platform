import { createAsyncAction } from 'typesafe-actions';
import { TermDetails, TermRefList } from 'generated-sources';
import { DeleteTerm } from 'redux/interfaces/terms';
import { PaginatedResponse } from '../interfaces';

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

export const fetchTermsAction = createAsyncAction(
  'GET_TERM_LIST__REQUEST',
  'GET_TERM_LIST__SUCCESS',
  'GET_TERM_LIST__FAILURE'
)<undefined, PaginatedResponse<TermRefList>, undefined>();
