import { ActivitiesState } from 'redux/interfaces/state';
import { activitiesActionTypePrefix } from 'redux/actions';
import { createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import { addDays, format, startOfDay } from 'date-fns';
import {
  Activity,
  ActivityPayload,
  ActivityQueryData,
  ActivityQueryName,
  ActivityQueryParams,
} from 'redux/interfaces';
import { ActivityType } from 'generated-sources';
import uniq from 'lodash/uniq';

const beginDate = startOfDay(addDays(new Date(), -6)).getTime();
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
        return state;
      }

      return {
        ...state,
        queryParams: {
          ...state.queryParams,
          [queryName]: queryData,
        },
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
      };
    },

    clearActivityFilters: state => {
      state.queryParams = initialQueryParams;

      return state;
    },
  },
  extraReducers: builder => {
    builder.addCase(
      thunks.fetchActivityList.fulfilled,
      (state, { payload }): ActivitiesState =>
        payload.reduce(
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
          { ...state, activitiesByDate: {} }
        )
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
