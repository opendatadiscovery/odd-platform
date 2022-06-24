import { ActivitiesState } from 'redux/interfaces/state';
import { activitiesActionTypePrefix } from 'redux/actions';
import { createSlice } from '@reduxjs/toolkit';
import * as thunks from 'redux/thunks';
import {
  ActivityFilters,
  ActivityMultipleFilterName,
  ActivityMultipleFilterOption,
  ActivityQueryParams,
  ActivitySingleFilterPayload,
  AddActivityMultipleFilterPayload,
  DeleteActivityMultipleFilterPayload,
} from 'redux/interfaces';

const endDate = new Date();
const beginDate = new Date(endDate.setDate(endDate.getDate() - 7));
const size = 20;
const initialQueryParams: ActivityQueryParams = {
  beginDate,
  endDate,
  size,
};

const initialSelectedFilters: ActivityFilters = {
  beginDate,
  endDate,
  size,
};

export const initialState: ActivitiesState = {
  activityEventTypes: [],
  activities: [],
  queryParams: initialQueryParams,
  selectedFilters: initialSelectedFilters,
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

const updateQueryParams = (
  state: ActivitiesState,
  filterName: ActivityMultipleFilterName,
  queryParam:
    | Array<ActivityMultipleFilterOption>
    | ActivityMultipleFilterOption
    | undefined,
  type: string
) => {
  if (
    filterName === 'tags' &&
    Array.isArray(queryParam) &&
    type === 'activities/addMultipleActivityFilter'
  ) {
    return {
      ...state,
      queryParams: {
        ...state.queryParams,
        tagIds: [
          ...(state.queryParams.tagIds || []),
          ...queryParam.map(param => param.id),
        ],
      },
    };
  }

  if (
    filterName === 'owners' &&
    Array.isArray(queryParam) &&
    type === 'activities/addMultipleActivityFilter'
  ) {
    return {
      ...state,
      queryParams: {
        ...state.queryParams,
        ownerIds: [
          ...(state.queryParams.ownerIds || []),
          ...queryParam.map(param => param.id),
        ],
      },
    };
  }

  if (
    filterName === 'tags' &&
    !Array.isArray(queryParam) &&
    queryParam &&
    type === 'activities/deleteMultipleActivityFilter'
  ) {
    return {
      ...state,
      queryParams: {
        ...state.queryParams,
        tagIds: state.queryParams.tagIds?.filter(
          tagId => tagId !== queryParam.id
        ),
      },
    };
  }

  if (
    filterName === 'owners' &&
    !Array.isArray(queryParam) &&
    queryParam &&
    type === 'activities/deleteMultipleActivityFilter'
  ) {
    return {
      ...state,
      queryParams: {
        ...state.queryParams,
        ownerIds: state.queryParams.ownerIds?.filter(
          ownerId => ownerId !== queryParam.id
        ),
      },
    };
  }

  return state;
};

export const activitiesSlice = createSlice({
  name: activitiesActionTypePrefix,
  initialState,
  reducers: {
    setSingleActivityFilter: (
      state,
      { payload }: ActivitySingleFilterPayload
    ) => {
      const { filterName, data } = payload;

      return {
        ...state,
        queryParams: {
          ...state.queryParams,
          [filterName]: data === 'All' ? null : data,
        },
        selectedFilters: { ...state.selectedFilters, [filterName]: data },
      };
    },

    addMultipleActivityFilter: (
      state,
      { payload, type }: AddActivityMultipleFilterPayload
    ) => {
      const { filterName, data } = payload;

      return {
        ...state,
        ...updateQueryParams(state, filterName, data, type),
        selectedFilters: {
          ...state.selectedFilters,
          [filterName]: [
            ...(state.selectedFilters[filterName] || []),
            ...(data || []),
          ],
        },
      };
    },

    deleteMultipleActivityFilter: (
      state,
      { payload, type }: DeleteActivityMultipleFilterPayload
    ) => {
      const { filterName, data } = payload;

      return {
        ...state,
        ...updateQueryParams(state, filterName, data, type),
        selectedFilters: {
          ...state.selectedFilters,
          [filterName]: state.selectedFilters[filterName]?.filter(
            filter => filter.id !== data.id
          ),
        },
      };
    },

    clearActivityFilters: state => {
      state.selectedFilters = initialSelectedFilters;
      state.queryParams = initialQueryParams;

      return state;
    },
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

export const {
  setSingleActivityFilter,
  addMultipleActivityFilter,
  deleteMultipleActivityFilter,
  clearActivityFilters,
} = activitiesSlice.actions;

export default activitiesSlice.reducer;
