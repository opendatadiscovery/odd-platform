import { createSelector } from '@reduxjs/toolkit';
import { RootState, AlertsState } from 'redux/interfaces';
import { alertsAdapter } from 'redux/reducers/alerts.slice';
import {
  createStatusesSelector,
  createLegacyFetchingSelector,
} from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';

const getAlertsState = ({ alerts }: RootState): AlertsState => alerts;

export const { selectAll: getAlertList } =
  alertsAdapter.getSelectors<RootState>(state => state.alerts);

const getAlertTotalsFetchingStatus =
  createLegacyFetchingSelector('GET_ALERT_TOTALS');

export const getAlertTotalsFetching = createSelector(
  getAlertTotalsFetchingStatus,
  status => status === 'fetching'
);

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
