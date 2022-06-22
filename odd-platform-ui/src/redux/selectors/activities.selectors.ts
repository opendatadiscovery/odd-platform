import { createSelector } from '@reduxjs/toolkit';
import { ActivitiesState, RootState } from 'redux/interfaces';
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

export const getActivitiesEventTypes = createSelector(
  activitiesState,
  activities => activities.activityEventTypes
);
