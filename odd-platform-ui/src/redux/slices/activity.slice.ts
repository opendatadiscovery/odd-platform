import { activitiesActionTypePrefix, fetchActivityListActionType } from 'redux/actions';
import { createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import { addDays, endOfDay, format } from 'date-fns';
import {
  ActivitiesState,
  Activity,
  ActivityListResponse,
  ActivityPayload,
  ActivityQueryData,
  ActivityQueryName,
  ActivityQueryParams,
} from 'redux/interfaces';
import { ActivityType } from 'generated-sources';
import uniqBy from 'lodash/uniqBy';

const beginDate = endOfDay(addDays(new Date(), -5)).getTime();
const endDate = endOfDay(addDays(new Date(), 1)).getTime();
export const activityListSize = 20;

const initialQueryParams: ActivityQueryParams = {
  beginDate,
  endDate,
  size: activityListSize,
  type: ActivityType.ALL,
};

export const initialState: ActivitiesState = {
  activitiesByDate: {},
  queryParams: initialQueryParams,
  counts: {
    totalCount: 0,
    upstreamCount: 0,
    myObjectsCount: 0,
    downstreamCount: 0,
  },
  pageInfo: { hasNext: true },
};

const formattedDate = (date: number) => format(date, 'MMMM dd, yyyy');

let currentActivityListActionType = fetchActivityListActionType;

const isActivityListActionTypeChanged = (type: string) => {
  const replacedActivityListActionType = type.replace('/fulfilled', '');

  if (currentActivityListActionType !== replacedActivityListActionType) {
    currentActivityListActionType = replacedActivityListActionType;
    return true;
  }
  return false;
};

const updateActivitiesState = (
  state: ActivitiesState,
  { payload, type }: { payload: ActivityListResponse; type: string }
): ActivitiesState => {
  const { activities, pageInfo } = payload;

  return activities.reduce(
    (memo: ActivitiesState, activity: Activity) => ({
      ...memo,
      activitiesByDate: {
        ...memo.activitiesByDate,
        [formattedDate(activity.createdAt)]: uniqBy(
          [...(memo.activitiesByDate[formattedDate(activity.createdAt)] || []), activity],
          'id'
        ).sort((a, b) => b.createdAt - a.createdAt),
      },
    }),
    {
      ...state,
      activitiesByDate: isActivityListActionTypeChanged(type)
        ? {}
        : { ...state.activitiesByDate },
      pageInfo,
    }
  );
};

export const activitiesSlice = createSlice({
  name: activitiesActionTypePrefix,
  initialState,
  reducers: {
    setActivityQueryParam: (
      state,
      { payload }: ActivityPayload<ActivityQueryName, ActivityQueryData>
    ): ActivitiesState => {
      const { queryName, queryData } = payload;

      if (queryData === null) {
        delete state.queryParams[queryName];
        state.pageInfo.hasNext = true;
        return state;
      }

      return {
        ...state,
        queryParams: {
          ...state.queryParams,
          [queryName]: queryData,
        },
        activitiesByDate: {},
        pageInfo: { hasNext: true },
      };
    },

    deleteActivityQueryParam: (
      state,
      { payload }: ActivityPayload<ActivityQueryName, number>
    ) => {
      const { queryName, queryData } = payload;
      const queryParams = state.queryParams[queryName] as Array<number>;

      return {
        ...state,
        queryParams: {
          ...state.queryParams,
          [queryName]: queryParams?.filter(id => id !== queryData),
        },
        activitiesByDate: {},
        pageInfo: { hasNext: true },
      };
    },

    clearActivityFilters: () => initialState,
  },
  extraReducers: builder => {
    builder.addCase(thunks.fetchActivityCounts.fulfilled, (state, { payload }) => {
      state.counts = payload;
    });
    builder.addCase(thunks.fetchActivityList.fulfilled, updateActivitiesState);
    builder.addCase(thunks.fetchDataEntityActivityList.fulfilled, updateActivitiesState);
  },
});

export const { clearActivityFilters, setActivityQueryParam, deleteActivityQueryParam } =
  activitiesSlice.actions;

export default activitiesSlice.reducer;
