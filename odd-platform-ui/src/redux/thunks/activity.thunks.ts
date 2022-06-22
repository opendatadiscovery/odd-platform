import {
  Activity,
  ActivityApi,
  ActivityApiGetActivityRequest,
  ActivityEventType,
  Configuration,
} from 'generated-sources';
import { createAsyncThunk } from '@reduxjs/toolkit';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import { ActivitiesTotals } from 'redux/interfaces/activities';
import { ActivityPageInfo } from 'redux/interfaces';

const apiClientConf = new Configuration(BASE_PARAMS);
const activityApi = new ActivityApi(apiClientConf);

export const fetchActivityEventTypes = createAsyncThunk<
  ActivityEventType[],
  void
>(actions.fetchActivityEventTypesActionType, async () => {
  const activityEventTypes = await activityApi.getActivityEventTypes();

  return activityEventTypes;
});

export const fetchActivityList = createAsyncThunk<
  {
    totals: ActivitiesTotals;
    activities: Activity[];
    pageInfo: ActivityPageInfo;
  },
  ActivityApiGetActivityRequest
>(actions.fetchActivityListActionType, async params => {
  const {
    items,
    pageInfo,
    myObjectsCount,
    downstreamCount,
    upstreamCount,
    totalCount,
  } = await activityApi.getActivity(params);

  const totals = {
    myObjectsCount,
    downstreamCount,
    upstreamCount,
    totalCount,
  };

  return {
    activities: items,
    totals,
    pageInfo: {
      ...pageInfo,
      lastEventDateTime: params.lastEventDateTime || params.endDate,
    },
  };
});
