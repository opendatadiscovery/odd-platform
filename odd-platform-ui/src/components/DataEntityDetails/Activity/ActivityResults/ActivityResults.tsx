import React from 'react';
import { Grid } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import {
  getActivitiesByDate,
  getActivitiesListFetchingStatuses,
  getActivitiesQueryParams,
} from 'redux/selectors';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import { useHistory, useLocation } from 'react-router-dom';
import { dataEntityActivityPath } from 'lib/paths';
import { useAppParams, useAppQuery } from 'lib/hooks';
import { ActivityQueryName, ActivityQueryParams } from 'redux/interfaces';
import { setActivityQueryParam } from 'redux/reducers/activity.slice';
import { fetchDataEntityActivityList } from 'redux/thunks';
import * as S from './ActivityResultsStyles';
import ActivityResultsItemSkeleton from './ActivityResultsItemSkeleton/ActivityResultsItemSkeleton';

const ActivityResults: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const history = useHistory();
  const { dataEntityId } = useAppParams();

  const queryParams = useAppSelector(getActivitiesQueryParams);
  const activityResults = useAppSelector(getActivitiesByDate);
  const { isLoading: isActivityListFetching } = useAppSelector(
    getActivitiesListFetchingStatuses
  );

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
      renderContent={({ randomSkeletonPercentWidth, key }) => (
        <ActivityResultsItemSkeleton
          width={randomSkeletonPercentWidth()}
          key={key}
        />
      )}
    />
  );

  return (
    <Grid container sx={{ mt: 2 }}>
      {isActivityListFetching ? (
        activityItemSkeleton()
      ) : (
        <S.ListContainer container>
          {/* {activityResults.map(activityItem => ( */}
          {/*  <div>lul</div> */}
          {/*  // <ResultItem */}
          {/*  //   key={searchResult.id} */}
          {/*  //   searchClass={searchClass} */}
          {/*  //   searchResult={searchResult} */}
          {/*  //   totals={totals} */}
          {/*  // /> */}
          {/* ))} */}
          {!isActivityListFetching && !activityResults.length ? (
            <EmptyContentPlaceholder text="No matches found" />
          ) : null}
        </S.ListContainer>
      )}
    </Grid>
  );
};

export default ActivityResults;
