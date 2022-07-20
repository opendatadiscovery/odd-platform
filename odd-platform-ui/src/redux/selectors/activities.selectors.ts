import { createSelector } from '@reduxjs/toolkit';
import {
  ActivitiesState,
  ActivityCountParamsRequest,
  ActivityQueryName,
  ActivityQueryParams,
  RootState,
} from 'redux/interfaces';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';

const activitiesState = ({ activities }: RootState): ActivitiesState =>
  activities;

export const getActivitiesListFetchingStatuses = createStatusesSelector(
  actions.fetchActivityListActionType
);

export const getActivityCountsFetchingStatuses = createStatusesSelector(
  actions.fetchActivityCountsActionType
);

export const getActivityCounts = createSelector(
  activitiesState,
  activities => activities.counts
);

export const getActivityPageInfo = createSelector(
  activitiesState,
  activities => activities.pageInfo
);

export const getActivitiesListLength = createSelector(
  activitiesState,
  activities =>
    Object.entries(activities.activitiesByDate)
      .map(([_, activityList]) => activityList.length)
      .reduce((acc, val) => acc + val, 0)
);

export const getActivitiesByDate = createSelector(
  activitiesState,
  activities => activities.activitiesByDate
);

export const getActivitiesQueryParams = createSelector(
  activitiesState,
  (activities): ActivityQueryParams => activities.queryParams
);

export const getActivitiesQueryParamsByName = (
  queryName: ActivityQueryName
) =>
  createSelector(
    activitiesState,
    activities => activities.queryParams[queryName]
  );

export const getActivitiesCountsParams = createSelector(
  activitiesState,
  (activities): ActivityCountParamsRequest => activities.queryParams
);
