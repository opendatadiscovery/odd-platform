import { createActionType } from 'lib/redux/helpers';

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
