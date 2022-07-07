import {
  Activity,
  ActivityApi,
  ActivityApiGetActivityCountsRequest,
  ActivityApiGetActivityRequest,
  ActivityCountInfo,
  Configuration,
  DataEntityApi,
  DataEntityApiGetDataEntityActivityRequest,
} from 'generated-sources';
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';

const apiClientConf = new Configuration(BASE_PARAMS);
const activityApi = new ActivityApi(apiClientConf);
const dataEntityApi = new DataEntityApi(apiClientConf);

export const fetchActivityList = createAsyncThunk<
  Activity[],
  ActivityApiGetActivityRequest
>(actions.fetchActivityListActionType, async params =>
  activityApi.getActivity(params)
);

export const fetchDataEntityActivityList = createAsyncThunk<
  Activity[],
  DataEntityApiGetDataEntityActivityRequest
>(actions.fetchActivityListActionType, async params =>
  dataEntityApi.getDataEntityActivity(params)
);

export const fetchActivityCounts = createAsyncThunk<
  ActivityCountInfo,
  ActivityApiGetActivityCountsRequest
>(actions.fetchActivityCountsActionType, async params =>
  activityApi.getActivityCounts(params)
);
