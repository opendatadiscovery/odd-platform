import { createSelector } from '@reduxjs/toolkit';
import type { ActivitiesState, PageInfo, RootState } from 'redux/interfaces';
import {
  createErrorSelector,
  createStatusesSelector,
} from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';
import { type ActivityCountInfo, type ActivityType } from 'generated-sources';
import { emptyObj } from 'lib/constants';

const activitiesState = ({ activities }: RootState): ActivitiesState => activities;

export const getActivitiesFetchingStatuses = createStatusesSelector(
  actions.fetchActivityListActionType
);
export const getActivitiesFetchingError = createErrorSelector(
  actions.fetchActivityListActionType
);
export const getDataEntityActivitiesFetchingStatuses = createStatusesSelector(
  actions.fetchDataEntityActivityListActionType
);
export const getDataEntityActivitiesFetchingError = createErrorSelector(
  actions.fetchDataEntityActivityListActionType
);
export const getActivityCountsFetchingStatuses = createStatusesSelector(
  actions.fetchActivityCountsActionType
);

export const getActivityCounts = createSelector(
  activitiesState,
  (activities): ActivityCountInfo => activities.activities.counts
);

export const getActivityPageInfoByType = (type: ActivityType) =>
  createSelector(
    activitiesState,
    (activities): PageInfo<number> =>
      activities.activities.activitiesByType[type].pageInfo
  );

export const getActivitiesListLengthByType = (type: ActivityType) =>
  createSelector(activitiesState, activities =>
    Object.entries(activities.activities.activitiesByType[type].itemsByDate)
      .map(([_, activityList]) => activityList.length)
      .reduce((acc, val) => acc + val, 0)
  );

export const getActivitiesByDateByType = (type: ActivityType) =>
  createSelector(
    activitiesState,
    activities => activities.activities.activitiesByType[type].itemsByDate
  );

export const getDataEntityActivitiesByDate = (dataEntityId: number) =>
  createSelector(
    activitiesState,
    activities => activities.dataEntityActivities[dataEntityId]?.itemsByDate
  );
export const getDataEntityActivitiesPageInfo = (dataEntityId: number) =>
  createSelector(
    activitiesState,
    (activities): PageInfo<number> =>
      activities.dataEntityActivities[dataEntityId]?.pageInfo || { hasNext: true }
  );

export const getDataEntityActivitiesLengthByEntityId = (dataEntityId: number) =>
  createSelector(activitiesState, activities =>
    Object.entries(activities.dataEntityActivities[dataEntityId]?.itemsByDate || emptyObj)
      .map(([_, activityList]) => activityList.length)
      .reduce((acc, val) => acc + val, 0)
  );
