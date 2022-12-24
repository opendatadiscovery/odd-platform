import React from 'react';
import { Grid } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getActivitiesByDateByType,
  getActivitiesFetchingError,
  getActivitiesFetchingStatuses,
  getActivitiesListLengthByType,
  getActivityCounts,
  getActivityCountsFetchingStatuses,
  getActivityPageInfoByType,
} from 'redux/selectors';
import { AppErrorPage, EmptyContentPlaceholder } from 'components/shared';
import { fetchActivityCounts, fetchActivityList } from 'redux/thunks';
import { useQueryParams } from 'lib/hooks';
import {
  type ActivityQuery,
  defaultActivityQuery,
} from 'components/shared/Activity/common';
import ActivityResultsList from './ActivityResultsList/ActivityResultsList';
import ActivityTabs from './ActivityTabs/ActivityTabs';

const ActivityResults: React.FC = () => {
  const dispatch = useAppDispatch();
  const { queryParams } = useQueryParams<ActivityQuery>(defaultActivityQuery);

  const activityCounts = useAppSelector(getActivityCounts);
  const activitiesByDate = useAppSelector(getActivitiesByDateByType(queryParams.type));
  const activitiesLength = useAppSelector(
    getActivitiesListLengthByType(queryParams.type)
  );
  const { hasNext, lastId, lastDateTime } = useAppSelector(
    getActivityPageInfoByType(queryParams.type)
  );
  const activitiesError = useAppSelector(getActivitiesFetchingError);
  const {
    isLoading: isActivitiesFetching,
    isNotLoaded: isActivitiesNotFetched,
    isLoaded: isActivitiesFetched,
  } = useAppSelector(getActivitiesFetchingStatuses);

  const { isLoading: isActivityCountsFetching } = useAppSelector(
    getActivityCountsFetchingStatuses
  );

  React.useEffect(() => {
    dispatch(fetchActivityCounts(queryParams));
    dispatch(fetchActivityList({ ...queryParams, isQueryUpdated: true }));
  }, [queryParams]);

  const fetchNextPage = React.useCallback(() => {
    if (!hasNext) return;

    dispatch(
      fetchActivityList({
        ...queryParams,
        isQueryUpdated: false,
        lastEventId: lastId,
        lastEventDateTime: lastDateTime,
      })
    );
  }, [queryParams, lastId, lastDateTime, hasNext]);

  return (
    <Grid sx={{ mt: 2 }}>
      <ActivityTabs counts={activityCounts} isCountsFetching={isActivityCountsFetching} />
      <ActivityResultsList
        activitiesLength={activitiesLength}
        fetchNextPage={fetchNextPage}
        hasNext={hasNext}
        isActivitiesFetching={isActivitiesFetching}
        activitiesByDate={activitiesByDate}
      />
      <AppErrorPage
        isNotContentLoaded={isActivitiesNotFetched}
        offsetTop={65}
        error={activitiesError}
      />
      <EmptyContentPlaceholder
        isContentLoaded={
          isActivitiesFetched && !isActivitiesFetching && !isActivitiesNotFetched
        }
        isContentEmpty={!activitiesLength}
      />
    </Grid>
  );
};

export default ActivityResults;
