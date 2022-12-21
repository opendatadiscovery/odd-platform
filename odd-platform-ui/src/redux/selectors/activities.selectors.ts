import { createSelector } from '@reduxjs/toolkit';
import type { ActivitiesState, RootState } from 'redux/interfaces';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';
import type { ActivityCountInfo } from 'generated-sources';

const activitiesState = ({ activities }: RootState): ActivitiesState => activities;

export const getActivitiesFetchingStatuses = createStatusesSelector(
  actions.fetchActivityListActionType
);
export const getDataEntityActivitiesFetchingStatuses = createStatusesSelector(
  actions.fetchDataEntityActivityListActionType
);
export const getActivityCountsFetchingStatuses = createStatusesSelector(
  actions.fetchActivityCountsActionType
);

export const getActivityCounts = createSelector(
  activitiesState,
  (activities): ActivityCountInfo => activities.activities.counts
);

export const getActivityPageInfo = createSelector(
  activitiesState,
  activities => activities.activities.pageInfo
);

export const getActivitiesListLength = createSelector(activitiesState, activities =>
  Object.entries(activities.activities.itemsByDate)
    .map(([_, activityList]) => activityList.length)
    .reduce((acc, val) => acc + val, 0)
);

export const getActivitiesByDate = createSelector(
  activitiesState,
  activities => activities.activities.itemsByDate
);

export const getDataEntityActivitiesByDate = (dataEntityId: number) =>
  createSelector(
    activitiesState,
    activities => activities.dataEntityActivities[dataEntityId].itemsByDate
  );
export const getDataEntityActivitiesPageInfo = (dataEntityId: number) =>
  createSelector(
    activitiesState,
    activities => activities.dataEntityActivities[dataEntityId].pageInfo
  );
