import {
  Activity,
  ActivityApi,
  ActivityApiGetActivityCountsRequest,
  ActivityApiGetActivityRequest,
  ActivityCountInfo,
  Configuration,
} from 'generated-sources';
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const activityApi = new ActivityApi(apiClientConf);

export const fetchActivityList = createAsyncThunk<
  Activity[],
  // {
  //   totals: ActivitiesTotals;
  //   activities: Activity[];
  //   pageInfo: ActivityPageInfo;
  // },
  ActivityApiGetActivityRequest
>(actions.fetchActivityListActionType, async params => {
  const activities = await activityApi.getActivity(params);

  // const totals = {
  //   myObjectsCount,
  //   downstreamCount,
  //   upstreamCount,
  //   totalCount,
  // };

  // return {
  //   activities,
  //   totals,
  //   pageInfo: {
  //     ...pageInfo,
  //     lastEventDateTime: params.lastEventDateTime || params.endDate,
  //   },
  // };

  return activities;
});

export const fetchActivityCounts = createAsyncThunk<
  ActivityCountInfo,
  ActivityApiGetActivityCountsRequest
>(actions.fetchActivityCountsActionType, async params =>
  activityApi.getActivityCounts(params)
);
