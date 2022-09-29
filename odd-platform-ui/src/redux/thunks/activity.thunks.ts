import {
  Activity as GeneratedActivity,
  ActivityApi,
  ActivityCountInfo,
  Configuration,
  DataEntityApi,
} from 'generated-sources';
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import {
  Activity,
  ActivityCountParamsRequest,
  ActivityListResponse,
  ActivityPageInfo,
  ActivityQueryParams,
  DataEntityActivityQueryParams,
} from 'redux/interfaces';
import { toDateWithoutOffset } from 'lib/helpers';
import { activityListSize } from 'redux/slices/activity.slice';

const apiClientConf = new Configuration(BASE_PARAMS);
const activityApi = new ActivityApi(apiClientConf);
const dataEntityApi = new DataEntityApi(apiClientConf);

const castCreatedAtToTimestamp = (activities: GeneratedActivity[]) =>
  activities.map<Activity>(activity => ({
    ...activity,
    createdAt: activity.createdAt.getTime(),
  }));

const setActivitiesPageInfo = (
  activities: Activity[],
  maxActivityListSize: number
): ActivityPageInfo => {
  const lastActivity = activities.slice(-1);
  let pageInfo: ActivityPageInfo = { hasNext: true };
  if (activities.length < maxActivityListSize) {
    pageInfo = { hasNext: false };
    return pageInfo;
  }
  pageInfo = {
    hasNext: true,
    lastEventId: lastActivity[0].id,
    lastEventDateTime: lastActivity[0].createdAt,
  };
  return pageInfo;
};

export const fetchActivityList = createAsyncThunk<
  ActivityListResponse,
  ActivityQueryParams
>(actions.fetchActivityListActionType, async params => {
  const castedBeginDate = toDateWithoutOffset(params.beginDate);
  const castedEndDate = toDateWithoutOffset(params.endDate);
  const castedLastEventDateTime = params.lastEventDateTime
    ? new Date(params.lastEventDateTime)
    : undefined;

  const activityList = await activityApi.getActivity({
    ...params,
    beginDate: castedBeginDate,
    endDate: castedEndDate,
    lastEventDateTime: castedLastEventDateTime,
  });

  const activitiesWithTimestamps = castCreatedAtToTimestamp(activityList);

  const pageInfo = setActivitiesPageInfo(activitiesWithTimestamps, activityListSize);

  return { activities: activitiesWithTimestamps, pageInfo };
});

export const fetchDataEntityActivityList = createAsyncThunk<
  ActivityListResponse,
  DataEntityActivityQueryParams
>(actions.fetchDataEntityActivityListActionType, async params => {
  const castedBeginDate = toDateWithoutOffset(params.beginDate);
  const castedEndDate = toDateWithoutOffset(params.endDate);
  const castedLastEventDateTime = params.lastEventDateTime
    ? new Date(params.lastEventDateTime)
    : undefined;

  const activityList = await dataEntityApi.getDataEntityActivity({
    ...params,
    beginDate: castedBeginDate,
    endDate: castedEndDate,
    lastEventDateTime: castedLastEventDateTime,
  });

  const activitiesWithTimestamps = castCreatedAtToTimestamp(activityList);

  const pageInfo = setActivitiesPageInfo(activitiesWithTimestamps, activityListSize);

  return { activities: activitiesWithTimestamps, pageInfo };
});

export const fetchActivityCounts = createAsyncThunk<
  ActivityCountInfo,
  ActivityCountParamsRequest
>(actions.fetchActivityCountsActionType, async params => {
  const castedBeginDate = toDateWithoutOffset(params.beginDate);
  const castedEndDate = toDateWithoutOffset(params.endDate);

  return activityApi.getActivityCounts({
    ...params,
    beginDate: castedBeginDate,
    endDate: castedEndDate,
  });
});
