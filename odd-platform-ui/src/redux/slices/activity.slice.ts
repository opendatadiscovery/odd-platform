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
import uniqBy from 'lodash/uniqBy';

export const initialState: ActivitiesState = {
  activities: {
    activitiesByType: {
      ALL: { pageInfo: { hasNext: true }, itemsByDate: {} },
      UPSTREAM: { pageInfo: { hasNext: true }, itemsByDate: {} },
      MY_OBJECTS: { pageInfo: { hasNext: true }, itemsByDate: {} },
      DOWNSTREAM: { pageInfo: { hasNext: true }, itemsByDate: {} },
    },
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
      const { items, pageInfo, activityType, isQueryUpdated } = payload;

      state.activities.activitiesByType[activityType].pageInfo = pageInfo;
      state.activities.activitiesByType[activityType].itemsByDate = items.reduce(
        (
          memo: ActivitiesState['activities']['activitiesByType']['ALL']['itemsByDate'],
          activity: Activity
        ) => ({
          ...memo,
          [formatDate(activity.createdAt, datedListFormat)]: uniqBy(
            [...(memo[formatDate(activity.createdAt, datedListFormat)] || []), activity],
            'id'
          ),
        }),
        isQueryUpdated
          ? {}
          : { ...state.activities.activitiesByType[activityType].itemsByDate }
      );
    });
    builder.addCase(fetchDataEntityActivityList.fulfilled, (state, { payload }) => {
      const { items, pageInfo, entityId: dataEntityId, isQueryUpdated } = payload;

      const itemsByDate = items.reduce(
        (memo: { [date: string]: Activity[] }, activity: Activity) => ({
          ...memo,
          [formatDate(activity.createdAt, datedListFormat)]: [
            ...(memo[formatDate(activity.createdAt, datedListFormat)] || []),
            activity,
          ],
        }),
        isQueryUpdated ? {} : { ...state.dataEntityActivities[dataEntityId]?.itemsByDate }
      );

      return {
        ...state,
        dataEntityActivities: {
          ...state.dataEntityActivities,
          [dataEntityId]: {
            ...state.dataEntityActivities[dataEntityId],
            pageInfo,
            itemsByDate,
          },
        },
      };
    });
  },
});

export default activitiesSlice.reducer;
