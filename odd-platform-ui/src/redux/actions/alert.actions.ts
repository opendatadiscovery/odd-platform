import { createAsyncAction, createAction } from 'typesafe-actions';
import { AlertList, AlertTotals, AlertStatus } from 'generated-sources';
import {
  PaginatedResponse,
  PartialEntityUpdateParams,
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

export const updateAlertStatusAction = createAsyncAction(
  'PUT_ALERT_STATUS__REQUEST',
  'PUT_ALERT_STATUS__SUCCESS',
  'PUT_ALERT_STATUS__FAILURE'
)<undefined, PartialEntityUpdateParams<AlertStatus>, undefined>();

export const fetchDataEntityAlertsAction = createAsyncAction(
  'GET_DATA_ENTITY_ALERTS__REQUEST',
  'GET_DATA_ENTITY_ALERTS__SUCCESS',
  'GET_DATA_ENTITY_ALERTS__FAILURE'
)<undefined, PartialEntityUpdateParams<AlertList>, undefined>();

export const changeAlertsFilterAction = createAction(
  'CHANGE_ALERTS_FILTER'
)<void>();
