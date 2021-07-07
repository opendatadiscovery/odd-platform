import { createAsyncAction } from 'typesafe-actions';
import { LabelsResponse, Label } from 'generated-sources';
import { PaginatedResponse } from 'redux/interfaces/common';

export const fetchLabelsAction = createAsyncAction(
  'GET_LABELS__REQUEST',
  'GET_LABELS__SUCCESS',
  'GET_LABELS__FAILURE'
)<undefined, PaginatedResponse<LabelsResponse>, undefined>();

export const createLabelsAction = createAsyncAction(
  'POST_LABELS__REQUEST',
  'POST_LABELS__SUCCESS',
  'POST_LABELS__FAILURE'
)<undefined, Label[], undefined>();

export const updateLabelAction = createAsyncAction(
  'PUT_LABEL__REQUEST',
  'PUT_LABEL__SUCCESS',
  'PUT_LABEL__FAILURE'
)<undefined, Label, undefined>();

export const deleteLabelAction = createAsyncAction(
  'DELETE_LABEL__REQUEST',
  'DELETE_LABEL__SUCCESS',
  'DELETE_LABEL__FAILURE'
)<undefined, number, undefined>();
