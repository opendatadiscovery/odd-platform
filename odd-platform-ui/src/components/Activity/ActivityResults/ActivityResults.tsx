import React from 'react';
import { Grid, Typography } from '@mui/material';
import { ActivityType } from 'generated-sources';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getActivitiesByDate,
  getActivitiesCountsParams,
  getActivitiesListFetchingStatuses,
  getActivitiesListLength,
  getActivitiesQueryParams,
  getActivitiesQueryParamsByName,
  getActivityCounts,
  getActivityCountsFetchingStatuses,
  getActivityPageInfo,
} from 'redux/selectors';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import { fetchActivityCounts, fetchActivityList } from 'redux/thunks';
import { setActivityQueryParam } from 'redux/slices/activity.slice';
import { useHistory, useLocation } from 'react-router-dom';
import { ActivityQueryName, ActivityQueryParams } from 'redux/interfaces';
import { useAppPaths, useAppQuery } from 'lib/hooks';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import AppButton from 'components/shared/AppButton/AppButton';
import InfiniteScroll from 'react-infinite-scroll-component';
import ActivityResultsItemSkeleton from 'components/shared/Activity/ActivityResultsItemSkeleton/ActivityResultsItemSkeleton';
import ActivityItem from 'components/Activity/ActivityResults/ActivityItem/ActivityItem';
import * as S from './ActivityResultsStyles';

const ActivityResults: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const history = useHistory();
  const { activityPath } = useAppPaths();

  const activityTotals = useAppSelector(getActivityCounts);
  const activityType = useAppSelector(
    getActivitiesQueryParamsByName('type')
  );
  const pageInfo = useAppSelector(getActivityPageInfo);
  const queryParams = useAppSelector(getActivitiesQueryParams);
  const countParams = useAppSelector(getActivitiesCountsParams);
  const activityResults = useAppSelector(getActivitiesByDate);
  const activityCount = useAppSelector(getActivitiesListLength);
  const { isLoading: isActivityListFetching } = useAppSelector(
    getActivitiesListFetchingStatuses
  );
  const { isLoading: isActivityCountsFetching } = useAppSelector(
    getActivityCountsFetchingStatuses
  );

  const [isQueryUpdated, setIsQueryUpdated] = React.useState(false);

  const { query, params } = useAppQuery<ActivityQueryParams>(
    queryParams,
    location.search
  );

  React.useEffect(() => {
    history.push(activityPath(query));
  }, [query]);

  React.useEffect(() => {
    Object.entries(params).forEach(([queryName, queryData]) =>
      dispatch(
        setActivityQueryParam({
          queryName: queryName as ActivityQueryName,
          queryData,
        })
      )
    );
  }, []);

  React.useEffect(() => {
    if (query === location.search.substring(1)) {
      setIsQueryUpdated(true);
    }
  }, [query, location.search]);

  React.useEffect(() => {
    if (isQueryUpdated) {
      dispatch(fetchActivityCounts(countParams));
    }
  }, [countParams, isQueryUpdated]);

  const fetchNextPage = () => {
    if (!pageInfo?.hasNext) return;

    dispatch(
      fetchActivityList({
        ...queryParams,
        lastEventId: pageInfo.lastEventId,
        lastEventDateTime: pageInfo.lastEventDateTime,
      })
    );
  };

  React.useEffect(() => {
    if (isQueryUpdated) {
      dispatch(fetchActivityList(queryParams));
    }
  }, [isQueryUpdated, queryParams]);

  const [tabs, setTabs] = React.useState<AppTabItem<ActivityType>[]>([]);

  React.useEffect(() => {
    setTabs([
      {
        name: 'All',
        hint: activityTotals.totalCount,
        value: ActivityType.ALL,
      },
      {
        name: 'My Objects',
        hint: activityTotals.myObjectsCount,
        value: ActivityType.MY_OBJECTS,
      },
      {
        name: 'Downstream',
        hint: activityTotals.downstreamCount,
        value: ActivityType.DOWNSTREAM,
      },
      {
        name: 'Upstream',
        hint: activityTotals.upstreamCount,
        value: ActivityType.UPSTREAM,
      },
    ]);
  }, [activityTotals]);

  const [selectedTab, setSelectedTab] = React.useState<number>(-1);

  React.useEffect(() => {
    setSelectedTab(
      activityType ? tabs.findIndex(tab => tab.value === activityType) : 0
    );
  }, [tabs, activityType]);

  const onActivityTypeChange = (newTypeIndex: number) => {
    const newActivityType = tabs[newTypeIndex].value as ActivityType;
    dispatch(
      setActivityQueryParam({
        queryName: 'type',
        queryData: newActivityType,
      })
    );
  };

  const activityItemSkeleton = () => (
    <SkeletonWrapper
      length={10}
      renderContent={({ key }) => (
        <ActivityResultsItemSkeleton width="100%" key={key} />
      )}
    />
  );

  const [hideAllDetails, setHideAllDetails] = React.useState(false);

  return (
    <Grid sx={{ mt: 2 }}>
      <AppTabs
        type="primary"
        items={tabs}
        selectedTab={selectedTab}
        handleTabChange={onActivityTypeChange}
        isHintUpdating={isActivityCountsFetching}
      />
      {!isActivityListFetching && activityCount === 0 ? (
        <EmptyContentPlaceholder text="No matches found" />
      ) : (
        <>
          <Grid
            container
            justifyContent="flex-end"
            sx={{
              mt: 2,
              py: 0.25,
              px: 2.5,
              borderBottom: '1px solid #EBECF0',
            }}
          >
            <AppButton
              size="small"
              color="tertiary"
              onClick={() => setHideAllDetails(!hideAllDetails)}
            >
              Hide all details
            </AppButton>
          </Grid>
          <S.ListContainer id="activities-list">
            <InfiniteScroll
              dataLength={activityCount}
              next={fetchNextPage}
              hasMore={pageInfo.hasNext}
              loader={isActivityListFetching && activityItemSkeleton()}
              scrollThreshold="200px"
              scrollableTarget="activities-list"
            >
              {Object.entries(activityResults).map(
                ([activityDate, activities], idx) => (
                  // eslint-disable-next-line react/no-array-index-key
                  <Grid key={`${activityDate}-${idx}`} container>
                    <Typography variant="subtitle2" sx={{ py: 1 }}>
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
                )
              )}
            </InfiniteScroll>
          </S.ListContainer>
        </>
      )}
    </Grid>
  );
};

export default ActivityResults;
