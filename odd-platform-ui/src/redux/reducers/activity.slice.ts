import { ActivitiesState } from 'redux/interfaces/state';
import { activitiesActionTypePrefix } from 'redux/actions';
import { createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import {
  ActivityMultipleQueryData,
  ActivityMultipleQueryName,
  ActivityQueryParams,
  ActivitySingleQueryData,
  ActivitySingleQueryName,
} from 'redux/interfaces';
import { ActivityType } from 'generated-sources';

const endDate = new Date();
const beginDate = new Date(endDate.setDate(endDate.getDate() - 7));
const size = 20;
const initialQueryParams: ActivityQueryParams = {
  beginDate,
  endDate,
  size,
  type: ActivityType.ALL,
};

export const initialState: ActivitiesState = {
  activities: [],
  queryParams: initialQueryParams,
  counts: {
    totalCount: 0,
    upstreamCount: 0,
    myObjectsCount: 0,
    downstreamCount: 0,
  },
  pageInfo: {
    total: 0,
    lastEventDateTime: new Date(),
    hasNext: true,
  },
};

export const activitiesSlice = createSlice({
  name: activitiesActionTypePrefix,
  initialState,
  reducers: {
    setSingleQueryParam: (
      state,
      {
        payload,
      }: {
        payload: {
          queryName: ActivitySingleQueryName;
          queryData: ActivitySingleQueryData;
        };
      }
    ) => {
      const { queryName, queryData } = payload;

      return {
        ...state,
        queryParams: {
          ...state.queryParams,
          [queryName]: queryData,
        },
      };
    },
    setMultipleQueryParam: (
      state,
      {
        payload,
      }: {
        payload: {
          queryName: ActivityMultipleQueryName;
          queryData: ActivityMultipleQueryData;
        };
      }
    ) => {
      const { queryName, queryData } = payload;

      return {
        ...state,
        queryParams: {
          ...state.queryParams,
          [queryName]: queryData,
        },
      };
    },

    deleteMultipleQueryParam: (
      state,
      {
        payload,
      }: {
        payload: {
          queryName: ActivityMultipleQueryName;
          queryParamId: number;
        };
      }
    ) => {
      const { queryName, queryParamId } = payload;

      return {
        ...state,
        queryParams: {
          ...state.queryParams,
          [queryName]: state.queryParams[queryName]?.filter(
            id => id !== queryParamId
          ),
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
      (state, { payload }) => {
        state.activities = payload;
        // state.totals = totals;
        // state.pageInfo = pageInfo;
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
  setSingleQueryParam,
  setMultipleQueryParam,
  deleteMultipleQueryParam,
} = activitiesSlice.actions;

export default activitiesSlice.reducer;
