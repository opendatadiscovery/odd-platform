import { activitiesActionTypePrefix } from 'redux/actions';
import { createSlice } from '@reduxjs/toolkit';
import type { ActivitiesState, Activity } from 'redux/interfaces';
import {
  fetchActivityCounts,
  fetchActivityList,
  fetchDataEntityActivityList,
} from 'redux/thunks/activity.thunks';
import { formatDate } from 'lib/helpers';
import { datedListFormat } from 'lib/constants';

export const initialState: ActivitiesState = {
  activities: {
    pageInfo: { hasNext: true },
    itemsByDate: {},
    counts: { totalCount: 0, upstreamCount: 0, myObjectsCount: 0, downstreamCount: 0 },
  },
  dataEntityActivities: {},
};

export const activitiesSlice = createSlice({
  name: activitiesActionTypePrefix,
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(fetchActivityCounts.fulfilled, (state, { payload }) => {
      state.activities.counts = payload;
    });
    builder.addCase(fetchActivityList.fulfilled, (state, { payload }) => {
      const { items, pageInfo } = payload;

      state.activities.pageInfo = pageInfo;
      state.activities.itemsByDate = items.reduce(
        (memo: ActivitiesState['activities']['itemsByDate'], activity: Activity) => ({
          ...memo,
          [formatDate(activity.createdAt, datedListFormat)]: [
            ...(memo[formatDate(activity.createdAt, datedListFormat)] || []),
            activity,
          ],
        }),
        {}
      );
    });
    builder.addCase(fetchDataEntityActivityList.fulfilled, (state, { payload }) => {
      const { items, pageInfo, dataEntityId } = payload;

      if (dataEntityId) {
        state.dataEntityActivities[dataEntityId].pageInfo = pageInfo;
        state.dataEntityActivities[dataEntityId].itemsByDate = items.reduce(
          (memo: { [date: string]: Activity[] }, activity: Activity) => ({
            ...memo,
            [formatDate(activity.createdAt, datedListFormat)]: [
              ...(memo[formatDate(activity.createdAt, datedListFormat)] || []),
              activity,
            ],
          }),
          {}
        );
      }
    });
  },
});

export default activitiesSlice.reducer;
