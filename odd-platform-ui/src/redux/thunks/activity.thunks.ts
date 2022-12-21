import {
  ActivityApi,
  type ActivityApiGetActivityCountsRequest,
  type ActivityApiGetActivityRequest,
  type ActivityCountInfo,
  Configuration,
  DataEntityApi,
  type DataEntityApiGetDataEntityActivityRequest,
} from 'generated-sources';
import * as actions from 'redux/actions';
import { BASE_PARAMS } from 'lib/constants';
import type {
  RelatedToEntityId,
  Activity,
  KeySetPaginatedResponse,
  SerializeDateToNumber,
} from 'redux/interfaces';
import { toDate } from 'lib/helpers';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { castDatesToTimestamp, setPageInfo } from 'redux/lib/helpers';

const apiClientConf = new Configuration(BASE_PARAMS);
const activityApi = new ActivityApi(apiClientConf);
const dataEntityApi = new DataEntityApi(apiClientConf);

export const activityListSize = 20;

export const fetchActivityList = handleResponseAsyncThunk<
  KeySetPaginatedResponse<Activity[], number>,
  SerializeDateToNumber<ActivityApiGetActivityRequest>
>(
  actions.fetchActivityListActionType,
  async ({ beginDate, endDate, lastEventDateTime, ...params }) => {
    const castedBeginDate = toDate(beginDate);
    const castedEndDate = toDate(endDate);
    const castedLastEventDateTime = lastEventDateTime
      ? toDate(lastEventDateTime)
      : undefined;

    const activities = await activityApi.getActivity({
      ...params,
      beginDate: castedBeginDate,
      endDate: castedEndDate,
      lastEventDateTime: castedLastEventDateTime,
    });

    const items = castDatesToTimestamp(activities);
    const pageInfo = setPageInfo<Activity>(items, activityListSize);

    return { items, pageInfo };
  },
  {}
);

export const fetchDataEntityActivityList = handleResponseAsyncThunk<
  RelatedToEntityId<KeySetPaginatedResponse<Activity[], number>>,
  SerializeDateToNumber<DataEntityApiGetDataEntityActivityRequest>
>(
  actions.fetchDataEntityActivityListActionType,
  async ({ dataEntityId, lastEventDateTime, endDate, beginDate, ...params }) => {
    const castedBeginDate = toDate(beginDate);
    const castedEndDate = toDate(endDate);
    const castedLastEventDateTime = lastEventDateTime
      ? toDate(lastEventDateTime)
      : undefined;

    const activities = await dataEntityApi.getDataEntityActivity({
      ...params,
      dataEntityId,
      beginDate: castedBeginDate,
      endDate: castedEndDate,
      lastEventDateTime: castedLastEventDateTime,
    });

    const items = castDatesToTimestamp(activities);
    const pageInfo = setPageInfo<Activity>(items, activityListSize);

    return { items, pageInfo, dataEntityId };
  },
  {}
);

export const fetchActivityCounts = handleResponseAsyncThunk<
  ActivityCountInfo,
  SerializeDateToNumber<ActivityApiGetActivityCountsRequest>
>(
  actions.fetchActivityCountsActionType,
  async ({ beginDate, endDate, ...params }) =>
    activityApi.getActivityCounts({
      ...params,
      beginDate: toDate(beginDate),
      endDate: toDate(endDate),
    }),
  {}
);
