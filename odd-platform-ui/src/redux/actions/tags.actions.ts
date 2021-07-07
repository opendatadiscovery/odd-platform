import { createAsyncAction } from 'typesafe-actions';
import { TagsResponse, Tag } from 'generated-sources';
import { PaginatedResponse } from 'redux/interfaces/common';

export const fetchTagsAction = createAsyncAction(
  'GET_TAGS__REQUEST',
  'GET_TAGS__SUCCESS',
  'GET_TAGS__FAILURE'
)<undefined, PaginatedResponse<TagsResponse>, undefined>();

export const createTagsAction = createAsyncAction(
  'POST_TAGS__REQUEST',
  'POST_TAGS__SUCCESS',
  'POST_TAGS__FAILURE'
)<undefined, Tag[], undefined>();

export const updateTagAction = createAsyncAction(
  'PUT_TAG__REQUEST',
  'PUT_TAG__SUCCESS',
  'PUT_TAG__FAILURE'
)<undefined, Tag, undefined>();

export const deleteTagAction = createAsyncAction(
  'DELETE_TAG__REQUEST',
  'DELETE_TAG__SUCCESS',
  'DELETE_TAG__FAILURE'
)<undefined, number, undefined>();
