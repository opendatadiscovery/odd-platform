import { createAsyncAction } from 'typesafe-actions';
import { Tag, TermDetails } from '../../generated-sources';
import { ErrorState, PartialTermDetailsUpdateParams } from '../interfaces';

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
