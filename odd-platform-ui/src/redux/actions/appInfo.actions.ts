import { createActionType } from 'redux/lib/helpers';

export const appInfoActionPrefix = 'appInfo';

export const fetchActiveFeaturesActionType = createActionType(
  appInfoActionPrefix,
  'fetchActiveFeatures'
);
