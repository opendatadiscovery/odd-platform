import {
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
  ActivityQueryParams,
  DataEntityActivityQueryParams,
} from 'redux/interfaces';

const apiClientConf = new Configuration(BASE_PARAMS);
const activityApi = new ActivityApi(apiClientConf);
const dataEntityApi = new DataEntityApi(apiClientConf);

export const fetchActivityList = createAsyncThunk<
  Activity[],
  ActivityQueryParams
>(actions.fetchActivityListActionType, async params => {
  const castedBeginDate = new Date(params.beginDate);
  const castedEndDate = new Date(params.endDate);
  const castedLastEventDateTime = params.lastEventDateTime
    ? new Date(params.lastEventDateTime)
    : undefined;

  const activityList = await activityApi.getActivity({
    ...params,
    beginDate: castedBeginDate,
    endDate: castedEndDate,
    lastEventDateTime: castedLastEventDateTime,
  });

  return activityList.map<Activity>(activity => ({
    ...activity,
    createdAt: activity.createdAt.getTime(),
  }));
});

export const fetchDataEntityActivityList = createAsyncThunk<
  Activity[],
  DataEntityActivityQueryParams
>(actions.fetchDataEntityActivityListActionType, async params => {
  const castedBeginDate = new Date(params.beginDate);
  const castedEndDate = new Date(params.endDate);
  const castedLastEventDateTime = params.lastEventDateTime
    ? new Date(params.lastEventDateTime)
    : undefined;

  const activityList = await dataEntityApi.getDataEntityActivity({
    ...params,
    beginDate: castedBeginDate,
    endDate: castedEndDate,
    lastEventDateTime: castedLastEventDateTime,
  });

  return activityList.map<Activity>(activity => ({
    ...activity,
    createdAt: activity.createdAt.getTime(),
  }));
});

export const fetchActivityCounts = createAsyncThunk<
  ActivityCountInfo,
  ActivityCountParamsRequest
>(actions.fetchActivityCountsActionType, async params => {
  const castedBeginDate = new Date(params.beginDate);
  const castedEndDate = new Date(params.endDate);

  return activityApi.getActivityCounts({
    ...params,
    beginDate: castedBeginDate,
    endDate: castedEndDate,
  });
});
