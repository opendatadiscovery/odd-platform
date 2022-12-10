import {
  type Activity as GeneratedActivity,
  ActivityApi,
  type ActivityCountInfo,
  Configuration,
  DataEntityApi,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import type {
  Activity,
  ActivityCountParamsRequest,
  ActivityListResponse,
  ActivityPageInfo,
  ActivityQueryParams,
  DataEntityActivityQueryParams,
} from 'redux/interfaces';
import { toDate } from 'lib/helpers';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';

const apiClientConf = new Configuration(BASE_PARAMS);
const activityApi = new ActivityApi(apiClientConf);
const dataEntityApi = new DataEntityApi(apiClientConf);

export const activityListSize = 20;

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
  let pageInfo: ActivityPageInfo;
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

export const fetchActivityList = handleResponseAsyncThunk<
  ActivityListResponse,
  ActivityQueryParams
>(
  actions.fetchActivityListActionType,
  async params => {
    const castedBeginDate = toDate(params.beginDate);
    const castedEndDate = toDate(params.endDate);
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
  },
  {}
);

export const fetchDataEntityActivityList = handleResponseAsyncThunk<
  ActivityListResponse,
  DataEntityActivityQueryParams
>(
  actions.fetchDataEntityActivityListActionType,
  async params => {
    const castedBeginDate = toDate(params.beginDate);
    const castedEndDate = toDate(params.endDate);
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
  },
  {}
);

export const fetchActivityCounts = handleResponseAsyncThunk<
  ActivityCountInfo,
  ActivityCountParamsRequest
>(
  actions.fetchActivityCountsActionType,
  async params => {
    const castedBeginDate = toDate(params.beginDate);
    const castedEndDate = toDate(params.endDate);

    return activityApi.getActivityCounts({
      ...params,
      beginDate: castedBeginDate,
      endDate: castedEndDate,
    });
  },
  {}
);
