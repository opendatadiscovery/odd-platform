import { createActionType } from 'redux/lib/helpers';

export const alertsActionPrefix = 'alerts';

export const fetchAlertListActionType = createActionType(
  alertsActionPrefix,
  'fetchAlertList'
);

export const fetchAlertCountsActionType = createActionType(
  alertsActionPrefix,
  'fetchAlertCounts'
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
