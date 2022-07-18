import React from 'react';
import { Grid } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import {
  getActivitiesByDate,
  getActivitiesCount,
  getActivitiesListFetchingStatuses,
  getActivitiesQueryParams,
  getActivityPageInfo,
} from 'redux/selectors';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import { useHistory, useLocation } from 'react-router-dom';
import { dataEntityActivityPath } from 'lib/paths';
import { useAppParams, useAppQuery } from 'lib/hooks/hooks';
import { ActivityQueryName, ActivityQueryParams } from 'redux/interfaces';
import { setActivityQueryParam } from 'redux/reducers/activity.slice';
import { fetchDataEntityActivityList } from 'redux/thunks';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import AppButton from 'components/shared/AppButton/AppButton';
import InfiniteScroll from 'react-infinite-scroll-component';
import ActivityResultsItemSkeleton from 'components/shared/Activity/ActivityResultsItemSkeleton/ActivityResultsItemSkeleton';
import ActivityResultByDate from './ActivityResultsByDate/ActivityResultsByDate';
import * as S from './ActivityResultsStyles';

const ActivityResults: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const history = useHistory();
  const { dataEntityId } = useAppParams();

  const queryParams = useAppSelector(getActivitiesQueryParams);
  const activityResults = useAppSelector(getActivitiesByDate);
  const activityCount = useAppSelector(getActivitiesCount);
  const pageInfo = useAppSelector(getActivityPageInfo);
  const { isLoading: isActivityListFetching } = useAppSelector(
    getActivitiesListFetchingStatuses
  );

  const [hideAllDetails, setHideAllDetails] = React.useState(false);
  const [isQueryUpdated, setIsQueryUpdated] = React.useState(false);

  const { query, params } = useAppQuery<ActivityQueryParams>(
    queryParams,
    location.search
  );

  React.useEffect(() => {
    history.push(dataEntityActivityPath(dataEntityId, query));
  }, [query, dataEntityId]);

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

  const fetchNextPage = () => {
    if (!pageInfo?.hasNext) return;

    dispatch(
      fetchDataEntityActivityList({
        ...queryParams,
        dataEntityId,
        lastEventId: pageInfo.lastEventId,
        lastEventDateTime: pageInfo.lastEventDateTime,
      })
    );
  };

  React.useEffect(() => {
    if (isQueryUpdated) {
      dispatch(
        fetchDataEntityActivityList({ ...queryParams, dataEntityId })
      );
    }
  }, [queryParams, dataEntityId, isQueryUpdated]);

  const activityItemSkeleton = () => (
    <SkeletonWrapper
      length={10}
      renderContent={({ key }) => (
        <ActivityResultsItemSkeleton width="100%" key={key} />
      )}
    />
  );

  return (
    <Grid container>
      {!isActivityListFetching && activityCount === 0 ? (
        <EmptyContentPlaceholder text="No matches found" />
      ) : (
        <>
          <S.ContentContainer container>
            <AppButton
              size="small"
              color="tertiary"
              onClick={() => setHideAllDetails(!hideAllDetails)}
            >
              Hide all details
            </AppButton>
          </S.ContentContainer>
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
                ([activityDate, activities]) => (
                  <ActivityResultByDate
                    key={activityDate}
                    activityDate={activityDate}
                    activities={activities}
                    hideAllDetails={hideAllDetails}
                  />
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
