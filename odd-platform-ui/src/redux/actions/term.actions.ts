import { createAsyncAction } from 'typesafe-actions';
import { TermRef, TermDetails, TermRefList, Tag } from 'generated-sources';
import { DeleteTerm } from 'redux/interfaces/terms';
import {
  ErrorState,
  PaginatedResponse,
  PartialEntityUpdateParams,
  PartialTermDetailsUpdateParams,
} from '../interfaces';

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

export const fetchTermDetailsAction = createAsyncAction(
  'GET_TERM_DETAILS__REQUEST',
  'GET_TERM_DETAILS__SUCCESS',
  'GET_TERM_DETAILS__FAILURE'
)<undefined, TermDetails, ErrorState>();

export const updateTermDetailsTagsAction = createAsyncAction(
  'PUT_TERM_DETAILS_TAGS__REQUEST',
  'PUT_TERM_DETAILS_TAGS__SUCCESS',
  'PUT_TERM_DETAILS_TAGS__FAILURE'
)<undefined, PartialTermDetailsUpdateParams<Tag[]>, ErrorState>();

export const createDataEntityTermAction = createAsyncAction(
  'POST_DATA_ENTITY_TERM__REQUEST',
  'POST_DATA_ENTITY_TERM__SUCCESS',
  'POST_DATA_ENTITY_TERM__FAILURE'
)<undefined, PartialEntityUpdateParams<TermRef>, undefined>();

export const updateDataEntityTermAction = createAsyncAction(
  'PUT_DATA_ENTITY_TERM__REQUEST',
  'PUT_DATA_ENTITY_TERM__SUCCESS',
  'PUT_DATA_ENTITY_TERM__FAILURE'
)<undefined, PartialEntityUpdateParams<TermRef>, ErrorState>();

export const deleteDataEntityTermAction = createAsyncAction(
  'DELETE_DATA_ENTITY_TERM__REQUEST',
  'DELETE_DATA_ENTITY_TERM__SUCCESS',
  'DELETE_DATA_ENTITY_TERM__FAILURE'
)<undefined, PartialEntityUpdateParams<number>, undefined>();
