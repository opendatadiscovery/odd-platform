import { createAsyncAction } from 'typesafe-actions';
import { Collector, CollectorList } from 'generated-sources';
import { DeleteCollector } from 'redux/interfaces/collectors';
import { PaginatedResponse } from 'redux/interfaces';

export const fetchCollectorsAction = createAsyncAction(
  'GET_COLLECTOR_LIST__REQUEST',
  'GET_COLLECTOR_LIST__SUCCESS',
  'GET_COLLECTOR_LIST__FAILURE'
)<undefined, PaginatedResponse<CollectorList>, undefined>();

export const updateCollectorAction = createAsyncAction(
  'PUT_COLLECTOR__REQUEST',
  'PUT_COLLECTOR__SUCCESS',
  'PUT_COLLECTOR__FAILURE'
)<undefined, Collector, undefined>();

export const regenerateCollectorTokenAction = createAsyncAction(
  'GET_COLLECTOR_NEW_TOKEN__REQUEST',
  'GET_COLLECTOR_NEW_TOKEN__SUCCESS',
  'GET_COLLECTOR_NEW_TOKEN__FAILURE'
)<undefined, Collector, undefined>();

export const registerCollectorAction = createAsyncAction(
  'POST_COLLECTOR__REQUEST',
  'POST_COLLECTOR__SUCCESS',
  'POST_COLLECTOR__FAILURE'
)<undefined, Collector, undefined>();

export const deleteCollectorAction = createAsyncAction(
  'DELETE_COLLECTOR__REQUEST',
  'DELETE_COLLECTOR__SUCCESS',
  'DELETE_COLLECTOR__FAILURE'
)<undefined, DeleteCollector, undefined>();
