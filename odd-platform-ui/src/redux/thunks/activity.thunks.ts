import type {
  ActivityApiGetActivityCountsRequest,
  ActivityApiGetActivityRequest,
  ActivityCountInfo,
  DataEntityApiGetDataEntityActivityRequest,
} from 'generated-sources';
import { ActivityType } from 'generated-sources';
import * as actions from 'redux/actions';
import type {
  Activity,
  KeySetPaginatedResponse,
  RelatedToEntityId,
  SerializeDateToNumber,
} from 'redux/interfaces';
import { toDate } from 'lib/helpers';
import { handleResponseAsyncThunk } from 'redux/lib/handleResponseThunk';
import { castDatesToTimestamp, setPageInfo } from 'redux/lib/helpers';
import { activityApi, dataEntityApi } from 'lib/api';

export const activityListSize = 30;

export const fetchActivityList = handleResponseAsyncThunk<
  KeySetPaginatedResponse<Activity[], number> & {
    activityType: ActivityType;
    isQueryUpdated: boolean;
  },
  SerializeDateToNumber<ActivityApiGetActivityRequest> & { isQueryUpdated: boolean }
>(
  actions.fetchActivityListActionType,
  async ({ beginDate, endDate, lastEventDateTime, isQueryUpdated, ...params }) => {
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
    const activityType = params.type ?? ActivityType.ALL;

    return { items, pageInfo, activityType, isQueryUpdated };
  },
  { switchOffErrorMessage: true }
);

export const fetchDataEntityActivityList = handleResponseAsyncThunk<
  RelatedToEntityId<KeySetPaginatedResponse<Activity[], number>> & {
    isQueryUpdated: boolean;
  },
  SerializeDateToNumber<DataEntityApiGetDataEntityActivityRequest> & {
    isQueryUpdated: boolean;
  }
>(
  actions.fetchDataEntityActivityListActionType,
  async ({
    dataEntityId,
    lastEventDateTime,
    endDate,
    beginDate,
    isQueryUpdated,
    ...params
  }) => {
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

    return { items, pageInfo, entityId: dataEntityId, isQueryUpdated };
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
