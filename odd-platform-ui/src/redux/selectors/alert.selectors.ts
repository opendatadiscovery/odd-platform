import { createSelector } from '@reduxjs/toolkit';
import { AlertsState, RootState } from 'redux/interfaces';
import { alertsAdapter } from 'redux/reducers/alerts.slice';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';
import { AlertStatus } from 'generated-sources';

const getAlertsState = ({ alerts }: RootState): AlertsState => alerts;

export const { selectAll: getAlertList } =
  alertsAdapter.getSelectors<RootState>(state => state.alerts);

export const getAlertTotalsFetchingStatuses = createStatusesSelector(
  actions.fetchAlertsTotalsActionType
);

export const getAlertListFetchingStatus = createStatusesSelector(
  actions.fetchAlertListActionType
);
export const getMyAlertListFetchingStatus = createStatusesSelector(
  actions.fetchMyAlertListActionType
);
export const getMyDependentsAlertListFetchingStatus =
  createStatusesSelector(actions.fetchMyDependentsAlertListActionType);

export const getDataEntityAlertListFetchingStatus = createStatusesSelector(
  actions.fetchDataEntityAlertsActionType
);
export const getAlertTotals = createSelector(
  getAlertsState,
  alertsState => alertsState.totals
);

export const getAlertListPageInfo = createSelector(
  getAlertsState,
  alertsState => alertsState.pageInfo
);

export const getDataEntityOpenAlertsCount = createSelector(
  getAlertList,
  alertList =>
    alertList.filter(alert => alert.status === AlertStatus.OPEN).length
);
