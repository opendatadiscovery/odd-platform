import { activitiesActionTypePrefix } from 'redux/actions';
import { createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import { addDays, endOfDay, format } from 'date-fns';
import {
  ActivitiesState,
  Activity,
  ActivityPayload,
  ActivityQueryData,
  ActivityQueryName,
  ActivityQueryParams,
} from 'redux/interfaces';
import { ActivityType } from 'generated-sources';
import uniq from 'lodash/uniq';

const beginDate = endOfDay(addDays(new Date(), -6)).getTime();
const endDate = new Date().getTime();
const size = 20;

const initialQueryParams: ActivityQueryParams = {
  beginDate,
  endDate,
  size,
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

    clearActivityFilters: state => {
      state = initialState;

      return state;
    },
  },
  extraReducers: builder => {
    builder.addCase(
      thunks.fetchActivityList.fulfilled,
      (state, { payload }): ActivitiesState => {
        const { activities, pageInfo } = payload;

        return activities.reduce(
          (memo: ActivitiesState, activity: Activity) => ({
            ...memo,
            activitiesByDate: {
              ...memo.activitiesByDate,
              [formattedDate(activity.createdAt)]: uniq([
                ...(memo.activitiesByDate[
                  formattedDate(activity.createdAt)
                ] || []),
                activity,
              ]),
            },
          }),
          {
            ...state,
            activitiesByDate: { ...state.activitiesByDate },
            pageInfo,
          }
        );
      }
    );

    builder.addCase(
      thunks.fetchActivityCounts.fulfilled,
      (state, { payload }) => {
        state.counts = payload;
      }
    );
  },
});

export const {
  clearActivityFilters,
  setActivityQueryParam,
  deleteActivityQueryParam,
} = activitiesSlice.actions;

export default activitiesSlice.reducer;
