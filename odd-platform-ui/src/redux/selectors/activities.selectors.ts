import { createSelector } from '@reduxjs/toolkit';
import {
  ActivitiesState,
  ActivityMultipleFilterName,
  ActivitySingleFilterName,
  RootState,
} from 'redux/interfaces';
import { createStatusesSelector } from 'redux/selectors/loader-selectors';
import * as actions from 'redux/actions';

const activitiesState = ({ activities }: RootState): ActivitiesState =>
  activities;

export const getActivitiesListFetchingStatuses = createStatusesSelector(
  actions.fetchActivityListActionType
);

export const getActivitiesTotals = createSelector(
  activitiesState,
  activities => activities.totals
);

export const getActivitiesList = createSelector(
  activitiesState,
  activities => activities.activities
);

export const getActivitiesPageInfo = createSelector(
  activitiesState,
  activities => activities.pageInfo
);

export const getActivityEventTypes = createSelector(
  activitiesState,
  activities => activities.activityEventTypes
);

export const getActivitySingleFilterName = (
  _: RootState,
  filterName: ActivitySingleFilterName
) => filterName;

export const getActivitiesSelectedSingleFilterByFilterName =
  createSelector(
    activitiesState,
    getActivitySingleFilterName,
    (activities, filterName) => activities.selectedFilters[filterName]
  );

export const getActivityMultipleFilterName = (
  _: RootState,
  filterName: ActivityMultipleFilterName
) => filterName;

export const getActivitiesSelectedMultipleFiltersByFilterName =
  createSelector(
    activitiesState,
    getActivityMultipleFilterName,
    (activities, filterName) => activities.selectedFilters[filterName]
  );

export const getActivitiesQueryParams = createSelector(
  activitiesState,
  activities => activities.queryParams
);
