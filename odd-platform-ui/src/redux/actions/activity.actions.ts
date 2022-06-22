import { createActionType } from 'lib/redux/helpers';

export const activitiesActionTypePrefix = 'activities';

export const fetchActivityEventTypesActionType = createActionType(
  activitiesActionTypePrefix,
  'fetchActivityEventTypes'
);

export const fetchActivityListActionType = createActionType(
  activitiesActionTypePrefix,
  'fetchActivityList'
);
