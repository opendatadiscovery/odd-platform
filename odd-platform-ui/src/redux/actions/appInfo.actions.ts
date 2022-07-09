import { createActionType } from 'lib/redux/helpers';

export const appInfoActionPrefix = 'appInfo';

export const fetchAppInfoActionType = createActionType(
  appInfoActionPrefix,
  'fetchAppInfo'
);
