import { createActionType } from 'redux/lib/helpers';

export const appInfoActionPrefix = 'appInfo';

export const fetchAppInfoActionType = createActionType(
  appInfoActionPrefix,
  'fetchAppInfo'
);
