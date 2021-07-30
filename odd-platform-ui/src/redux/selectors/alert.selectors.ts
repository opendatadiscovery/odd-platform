import { createSelector } from 'reselect';
import { RootState, AlertsState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/selectors/loader-selectors';
import { getDataEntityId } from './dataentity.selectors';

const getAlertsState = ({ alerts }: RootState): AlertsState => alerts;

const getAlertTotalsFetchingStatus = createFetchingSelector(
  'GET_ALERT_TOTALS'
);

export const getAlertTotalsFetching = createSelector(
  getAlertTotalsFetchingStatus,
  status => status === 'fetching'
);

const getAlertListFetchingStatus = createFetchingSelector('GET_ALERTS');

export const getAlertListFetching = createSelector(
  getAlertListFetchingStatus,
  status => status === 'fetching'
);

export const getAlertTotals = createSelector(
  getAlertsState,
  alertsState => alertsState.totals
);

export const getAlertList = createSelector(getAlertsState, alertsState =>
  alertsState.allIds?.map(id => alertsState.byId[id])
);

export const getAlertListPageInfo = createSelector(
  getAlertsState,
  alertsState => alertsState.pageInfo
);
