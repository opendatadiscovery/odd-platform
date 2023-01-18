import { createActionType } from 'redux/lib/helpers';

export const appInfoActionPrefix = 'appInfo';

export const fetchAppInfoActionType = createActionType(
  appInfoActionPrefix,
  'fetchAppInfo'
);

export const fetchActiveFeaturesActionType = createActionType(
  appInfoActionPrefix,
  'fetchActiveFeatures'
);

export const fetchAppLinksActionType = createActionType(
  appInfoActionPrefix,
  'fetchAppLinks'
);
