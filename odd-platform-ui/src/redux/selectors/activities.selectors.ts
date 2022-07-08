import { createSelector } from '@reduxjs/toolkit';
import {
  ActivitiesState,
  ActivityCountParamsRequest,
  ActivityMultipleQueryName,
  ActivityQueryParams,
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

export const getActivitiesQueryParams = createSelector(
  activitiesState,
  (activities): ActivityQueryParams => activities.queryParams
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

export const getActivitiesQueryParamsByName = (
  queryName: ActivitySingleQueryName | ActivityMultipleQueryName
) =>
  createSelector(
    activitiesState,
    activities => activities.queryParams[queryName]
  );

export const getActivitiesCountsParams = createSelector(
  activitiesState,
  (activities): ActivityCountParamsRequest => activities.queryParams
);
