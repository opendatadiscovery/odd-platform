import { ActivitiesState } from 'redux/interfaces/state';
import { activitiesActionTypePrefix } from 'redux/actions';
import { createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import { ActivityApiGetActivityRequest as ActivityFilters } from 'generated-sources';

const endDate = new Date();
const beginDate = new Date(endDate.setDate(endDate.getDate() - 7));
const initialFiltersState: ActivityFilters = {
  beginDate,
  endDate,
  size: 20,
};

export const initialState: ActivitiesState = {
  activityEventTypes: [],
  activities: [],
  filters: initialFiltersState,
  totals: {
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
    setActivityFilters: (
      state,
      { payload }: { payload: ActivityFilters }
    ) => ({ ...state, filters: { ...state.filters, ...payload } }),
  },
  extraReducers: builder => {
    builder.addCase(
      thunks.fetchActivityEventTypes.fulfilled,
      (state, { payload }) => {
        state.activityEventTypes = payload;
      }
    );
    builder.addCase(
      thunks.fetchActivityList.fulfilled,
      (state, { payload }) => {
        const { activities, pageInfo, totals } = payload;

        state.activities = activities;
        state.totals = totals;
        state.pageInfo = pageInfo;
      }
    );
  },
});

export const { setActivityFilters } = activitiesSlice.actions;

export default activitiesSlice.reducer;
