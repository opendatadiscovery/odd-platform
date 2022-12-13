import { createSelector } from '@reduxjs/toolkit';
import type { AlertsState, CurrentPageInfo, RootState } from 'redux/interfaces';
import { alertsConfigAdapter } from 'redux/slices/alerts.slice';
import {
  createErrorSelector,
  createStatusesSelector,
} from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';
import { emptyArr, emptyObj } from 'lib/constants';

export const getAlertListFetchingStatus = createStatusesSelector(
  actions.fetchAlertListActionType
);
export const getMyAlertListFetchingError = createErrorSelector(
  actions.fetchMyAlertListActionType
);
export const getMyAlertListFetchingStatus = createStatusesSelector(
  actions.fetchMyAlertListActionType
);
export const getMyDependentsAlertListFetchingError = createErrorSelector(
  actions.fetchMyDependentsAlertListActionType
);
export const getMyDependentsAlertListFetchingStatus = createStatusesSelector(
  actions.fetchMyDependentsAlertListActionType
);
export const getAlertListFetchingError = createErrorSelector(
  actions.fetchAlertListActionType
);

export const getDataEntityAlertListFetchingStatus = createStatusesSelector(
  actions.fetchDataEntityAlertsActionType
);
export const getDataEntityAlertsFetchingError = createErrorSelector(
  actions.fetchDataEntityAlertsActionType
);

export const getDataEntityAlertsConfigFetchingStatus = createStatusesSelector(
  actions.fetchDataEntityAlertsConfig
);
export const getDataEntityAlertsConfigUpdatingStatus = createStatusesSelector(
  actions.updateDataEntityAlertsConfig
);
export const getDataEntityAlertsConfigUpdatingError = createErrorSelector(
  actions.updateDataEntityAlertsConfig
);

const getAlertsState = ({ alerts }: RootState): AlertsState => alerts;

export const { selectById: getDataEntityAlertConfig } =
  alertsConfigAdapter.getSelectors<RootState>(state => state.alerts.configs);

export const getAlertsTotals = createSelector(
  getAlertsState,
  alertsState => alertsState.alerts.totals
);

export const getAlerts = createSelector(
  getAlertsState,
  alertsState => alertsState.alerts.items || emptyArr
);
export const getAlertsPageInfo = createSelector(
  getAlertsState,
  (alertsState): CurrentPageInfo => alertsState.alerts.pageInfo
);

export const getDataEntityAlerts = (dataEntityId: number) =>
  createSelector(
    getAlertsState,
    alertsState => alertsState.dataEntityAlerts[dataEntityId]?.items || emptyArr
  );
export const getDataEntityAlertsPageInfo = (dataEntityId: number) =>
  createSelector(
    getAlertsState,
    (alertsState): CurrentPageInfo =>
      alertsState.dataEntityAlerts[dataEntityId]?.pageInfo || emptyObj
  );

export const getDataEntityAlertsCount = (dataEntityId: number) =>
  createSelector(
    getAlertsState,
    alertList => alertList.dataEntityAlerts[dataEntityId]?.alertCount
  );
