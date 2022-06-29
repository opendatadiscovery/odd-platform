import React from 'react';
import { Grid } from '@mui/material';
import { ActivityType } from 'generated-sources';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
// import {} from 'react-router-dom';
import queryString from 'query-string';
import {
  getActivitiesList,
  getActivitiesListFetchingStatuses,
  getActivitiesQueryParams,
  getActivitiesSelectedSingleFilterByFilterName,
  getActivityPageInfo,
  getActivityTotals,
} from 'redux/selectors';
import { setSingleActivityFilter } from 'redux/reducers/activity.slice';
import { fetchActivityList } from 'redux/thunks';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import InfiniteScroll from 'react-infinite-scroll-component';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import { useHistory, useLocation } from 'react-router-dom';
import ActivityTabsSkeleton from './ActivityTabsSkeleton/ActivityTabsSkeleton';
import ActivityResultsItemSkeleton from './ActivityResultsItemSkeleton/ActivityResultsItemSkeleton';
import * as S from './ActivityResultsStyles';

const ActivityResults: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const history = useHistory();

  const activityTotals = useAppSelector(getActivityTotals);
  const activityType = useAppSelector(state =>
    getActivitiesSelectedSingleFilterByFilterName(state, 'type')
  ) as ActivityType;
  const pageInfo = useAppSelector(getActivityPageInfo);
  const queryParams = useAppSelector(getActivitiesQueryParams);
  const activityResults = useAppSelector(getActivitiesList);
  const { isLoading: isActivityListFetching } = useAppSelector(
    getActivitiesListFetchingStatuses
  );
  // const queryUrlString = new URLSearchParams(JSON.stringify(queryParams));
  // console.log('queURL', queryUrlString);
  // console.log('JSON.stringify(queryParams)', JSON.stringify(queryParams));
  const queryStringTest = queryString.stringify(queryParams, {
    arrayFormat: 'bracket-separator',
    arrayFormatSeparator: '|',
  });
  console.log('queryStringTest', queryStringTest);
  console.log(
    'parsed',
    queryString.parse(queryStringTest, {
      parseNumbers: true,
      arrayFormat: 'bracket-separator',
      arrayFormatSeparator: '|',
    })
  );
  // console.log('history', history.push());
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
    const newActivityType = tabs[newTypeIndex].value;
    dispatch(
      setSingleActivityFilter({
        filterName: 'type',
        data: newActivityType,
      })
    );
  };

  const fetchNextPage = () => {
    if (!pageInfo.hasNext) return;
    dispatch(fetchActivityList(queryParams));
  };

  React.useEffect(() => {
    fetchNextPage();
  }, [queryParams, pageInfo]);

  const activityItemSkeleton = React.useMemo(
    () => (
      <SkeletonWrapper
        length={10}
        renderContent={({ randomSkeletonPercentWidth, key }) => (
          <ActivityResultsItemSkeleton
            width={randomSkeletonPercentWidth()}
            key={key}
          />
        )}
      />
    ),
    []
  );

  return (
    <Grid sx={{ mt: 2 }}>
      {isActivityListFetching ? (
        <ActivityTabsSkeleton length={tabs.length} />
      ) : (
        <AppTabs
          type="primary"
          items={tabs}
          selectedTab={selectedTab}
          handleTabChange={onActivityTypeChange}
          isHintUpdated={isActivityListFetching}
        />
      )}
      {isActivityListFetching ? (
        activityItemSkeleton
      ) : (
        <S.ListContainer id="results-list">
          <InfiniteScroll
            dataLength={activityResults.length}
            next={fetchNextPage}
            hasMore={pageInfo.hasNext}
            loader={isActivityListFetching && activityItemSkeleton}
            scrollThreshold="200px"
            scrollableTarget="results-list"
          >
            {activityResults.map(activityItem => (
              <div>lul</div>
              // <ResultItem
              //   key={searchResult.id}
              //   searchClass={searchClass}
              //   searchResult={searchResult}
              //   totals={totals}
              // />
            ))}
          </InfiniteScroll>
          {!isActivityListFetching && !pageInfo.total ? (
            <EmptyContentPlaceholder text="No matches found" />
          ) : null}
        </S.ListContainer>
      )}
    </Grid>
  );
};

export default ActivityResults;
