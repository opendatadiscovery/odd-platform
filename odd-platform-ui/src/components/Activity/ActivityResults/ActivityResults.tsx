import React from 'react';
import { Grid, Typography } from '@mui/material';
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
import {
  SkeletonWrapper,
  AppButton,
  AppErrorPage,
  EmptyContentPlaceholder,
} from 'components/shared';
import { fetchActivityCounts, fetchActivityList } from 'redux/thunks';
import { useQueryParams } from 'lib/hooks';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ActivityResultsItemSkeleton } from 'components/shared/Activity';
import {
  type ActivityQuery,
  defaultActivityQuery,
} from 'components/shared/Activity/common';
import ActivityItem from './ActivityItem/ActivityItem';
import ActivityTabs from './ActivityTabs/ActivityTabs';
import * as S from './ActivityResultsStyles';

const ActivityResults: React.FC = () => {
  const dispatch = useAppDispatch();
  const { queryParams } = useQueryParams<ActivityQuery>(defaultActivityQuery);

  const [hideAllDetails, setHideAllDetails] = React.useState(false);

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

  React.useEffect(() => {
    dispatch(fetchActivityList({ ...queryParams, isQueryUpdated: true }));
  }, [queryParams]);

  const activityItemSkeleton = React.useMemo(
    () => (
      <SkeletonWrapper
        length={10}
        renderContent={({ key }) => (
          <ActivityResultsItemSkeleton width='100%' key={key} />
        )}
      />
    ),
    []
  );

  return (
    <Grid sx={{ mt: 2 }}>
      <ActivityTabs counts={activityCounts} isCountsFetching={isActivityCountsFetching} />
      {!!activitiesLength && (
        <>
          <S.Header container>
            <AppButton
              size='small'
              color='tertiary'
              onClick={() => setHideAllDetails(!hideAllDetails)}
            >
              Hide all details
            </AppButton>
          </S.Header>
          <S.ListContainer id='activities-list'>
            <InfiniteScroll
              dataLength={activitiesLength}
              next={fetchNextPage}
              hasMore={hasNext}
              loader={isActivitiesFetching && activityItemSkeleton}
              scrollThreshold='200px'
              scrollableTarget='activities-list'
            >
              {Object.entries(activitiesByDate).map(([activityDate, activities], idx) => (
                // eslint-disable-next-line react/no-array-index-key
                <Grid key={`${activityDate}-${idx}`} container>
                  <Typography variant='subtitle2' sx={{ py: 1 }}>
                    {activityDate}
                  </Typography>
                  {activities.map(activity => (
                    <ActivityItem
                      key={activity.id}
                      activity={activity}
                      hideAllDetails={hideAllDetails}
                    />
                  ))}
                </Grid>
              ))}
            </InfiniteScroll>
          </S.ListContainer>
        </>
      )}
      <AppErrorPage isNotContentLoaded={isActivitiesNotFetched} error={activitiesError} />
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
