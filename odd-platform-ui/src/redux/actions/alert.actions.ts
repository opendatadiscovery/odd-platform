import { createActionType } from 'redux/lib/helpers';

export const alertsActionPrefix = 'alerts';

export const fetchAlertsTotalsActionType = createActionType(
  alertsActionPrefix,
  'fetchAlertsTotals'
);

export const fetchAlertListActionType = createActionType(
  alertsActionPrefix,
  'fetchAlertList'
);

export const fetchMyAlertListActionType = createActionType(
  alertsActionPrefix,
  'fetchMyAlertList'
);

export const fetchMyDependentsAlertListActionType = createActionType(
  alertsActionPrefix,
  'fetchMyDependentsAlertList'
);

export const updateAlertStatusActionType = createActionType(
  alertsActionPrefix,
  'updateAlertStatus'
);

export const fetchDataEntityAlertsActionType = createActionType(
  alertsActionPrefix,
  'fetchDataEntityAlerts'
);

export const fetchDataEntityAlertsCountActionType = createActionType(
  alertsActionPrefix,
  'fetchDataEntityAlertsCount'
);

export const fetchDataEntityAlertsConfig = createActionType(
  alertsActionPrefix,
  'fetchDataEntityAlertsConfig'
);

export const updateDataEntityAlertsConfig = createActionType(
  alertsActionPrefix,
  'updateDataEntityAlertsConfig'
);
