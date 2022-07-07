import { createSelector } from '@reduxjs/toolkit';
import {
  ActivitiesState,
  ActivityMultipleFilterName,
  ActivityMultipleQueryName,
  ActivitySingleFilterName,
  ActivitySingleQueryName,
  RootState,
} from 'redux/interfaces';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';

const activitiesState = ({ activities }: RootState): ActivitiesState =>
  activities;

export const getActivitiesListFetchingStatuses = createStatusesSelector(
  actions.fetchActivityListActionType
);

export const getActivityCounts = createSelector(
  activitiesState,
  activities => activities.counts
);

export const getActivitiesList = createSelector(
  activitiesState,
  activities => activities.activities
);

export const getActivityPageInfo = createSelector(
  activitiesState,
  activities => activities.pageInfo
);

export const getActivitySingleFilterName = (
  _: RootState,
  filterName: ActivitySingleFilterName
) => filterName;

export const getActivityMultipleFilterName = (
  _: RootState,
  filterName: ActivityMultipleFilterName
) => filterName;

export const getActivitiesQueryParams = createSelector(
  activitiesState,
  activities => {
    const beginDate = new Date(activities.queryParams.beginDate);
    const endDate = new Date(activities.queryParams.endDate);

    return { ...activities.queryParams, beginDate, endDate };
  }
);

export const getActivityQueryName = (
  _: RootState,
  queryName: ActivitySingleQueryName | ActivityMultipleQueryName
) => queryName;

export const getActivitiesQueryParamsByQueryName = createSelector(
  activitiesState,
  getActivityQueryName,
  (activities, queryName) => activities.queryParams[queryName]
);
