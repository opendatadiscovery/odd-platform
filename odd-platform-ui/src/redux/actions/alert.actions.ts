import { createAsyncAction } from 'typesafe-actions';
import { AlertList, AlertTotals } from 'generated-sources';
import {
  PaginatedResponse,
  PartialDataEntityUpdateParams,
} from 'redux/interfaces';

export const fetchAlertsTotalsAction = createAsyncAction(
  'GET_ALERTS_TOTALS__REQUEST',
  'GET_ALERTS_TOTALS__SUCCESS',
  'GET_ALERTS_TOTALS__FAILURE'
)<undefined, AlertTotals, undefined>();

export const fetchAlertListAction = createAsyncAction(
  'GET_ALERTS__REQUEST',
  'GET_ALERTS__SUCCESS',
  'GET_ALERTS__FAILURE'
)<undefined, PaginatedResponse<AlertList>, undefined>();

export const fetchDataEntityAlertsAction = createAsyncAction(
  'GET_DATA_ENTITY_ALERTS__REQUEST',
  'GET_DATA_ENTITY_ALERTS__SUCCESS',
  'GET_DATA_ENTITY_ALERTS__FAILURE'
)<undefined, PartialDataEntityUpdateParams<AlertList>, undefined>();
