import { createAsyncAction } from 'typesafe-actions';
import { AlertList, AlertTotals } from 'generated-sources';
import { PaginatedResponse } from 'redux/interfaces/common';

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
