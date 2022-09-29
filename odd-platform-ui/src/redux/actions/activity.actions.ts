import { createActionType } from 'redux/lib/helpers';

export const activitiesActionTypePrefix = 'activities';

export const fetchActivityCountsActionType = createActionType(
  activitiesActionTypePrefix,
  'fetchActivityCounts'
);

export const fetchActivityListActionType = createActionType(
  activitiesActionTypePrefix,
  'fetchActivityList'
);

export const fetchDataEntityActivityListActionType = createActionType(
  activitiesActionTypePrefix,
  'fetchDataEntityActivityList'
);
