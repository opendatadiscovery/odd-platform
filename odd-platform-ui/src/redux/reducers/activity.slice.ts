import { ActivitiesState } from 'redux/interfaces/state';
import { activitiesActionTypePrefix } from 'redux/actions';
import { createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import { formatISO, subDays } from 'date-fns';
import {
  ActivityDateParams,
  ActivityMultipleQueryData,
  ActivityMultipleQueryName,
  ActivityPayload,
  ActivityQueryParams,
  ActivitySingleQueryData,
  ActivitySingleQueryName,
} from 'redux/interfaces';

const beginDate = formatISO(subDays(new Date(), 7), {
  representation: 'date',
});
const endDate = formatISO(new Date(), { representation: 'date' });
const size = 20;

const initialQueryParams: ActivityQueryParams = {
  beginDate,
  endDate,
  size,
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
};

export const activitiesSlice = createSlice({
  name: activitiesActionTypePrefix,
  initialState,
  reducers: {
    setQueryDateParam: (
      state,
      { payload }: ActivityPayload<ActivityDateParams, string>
    ): ActivitiesState => {
      const { value, type } = payload;
      state.queryParams[type] = value;

      return state;
    },

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

      if (
        queryData !== null &&
        (queryName === 'beginDate' || queryName === 'endDate')
      ) {
        // const date = new Date(queryData);

        return {
          ...state,
          queryParams: {
            ...state.queryParams,
            [queryName]: queryData,
          },
        };
      }

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
  setQueryDateParam,
  clearActivityFilters,
  setSingleQueryParam,
  setMultipleQueryParam,
  deleteMultipleQueryParam,
} = activitiesSlice.actions;

export default activitiesSlice.reducer;
