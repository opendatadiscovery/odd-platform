import { createSelector } from 'reselect';
import { RootState, AlertsState } from 'redux/interfaces';
import { createFetchingSelector } from 'redux/selectors/loader-selectors';
import { Alert, AlertStatus } from 'generated-sources';
import map from 'lodash/map';
import { getDataEntityId } from './dataentity.selectors';

const getAlertsState = ({ alerts }: RootState): AlertsState => alerts;

const getAlertTotalsFetchingStatus =
  createFetchingSelector('GET_ALERT_TOTALS');

export const getAlertTotalsFetching = createSelector(
  getAlertTotalsFetchingStatus,
  status => status === 'fetching'
);

const getAlertListFetchingStatus = createFetchingSelector('GET_ALERTS');

export const getAlertListFetching = createSelector(
  getAlertListFetchingStatus,
  status => status === 'fetching'
);

const getDataEntityAlertListFetchingStatus = createFetchingSelector(
  'GET_DATA_ENTITY_ALERTS'
);

export const getDataEntityAlertListFetching = createSelector(
  getDataEntityAlertListFetchingStatus,
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

export const getDataEntityOpenAlertListCount = createSelector(
  getAlertsState,
  getDataEntityId,
  (alertsState, dataEntityId) =>
    alertsState.alertIdsByDataEntityId[dataEntityId]?.reduce<Alert[]>(
      (memo, id) => {
        if (alertsState.byId[id].status === AlertStatus.OPEN)
          memo.push(alertsState.byId[id]);
        return memo;
      },
      []
    ).length
);

export const getDataEntityAlertsList = createSelector(
  getAlertsState,
  getDataEntityId,
  (alertsState, dataEntityId) =>
    map(
      alertsState.alertIdsByDataEntityId[dataEntityId],
      (alertId: number) => alertsState.byId[alertId]
    )
);
