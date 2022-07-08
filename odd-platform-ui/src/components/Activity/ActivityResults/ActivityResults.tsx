import React from 'react';
import { Grid } from '@mui/material';
import { ActivityType } from 'generated-sources';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import {
  useAppDispatch,
  useAppSelector,
  useUpdateActivityQuery,
} from 'lib/redux/hooks';
import { StringifyOptions } from 'query-string';
import {
  getActivitiesCountsParams,
  getActivitiesList,
  getActivitiesListFetchingStatuses,
  getActivitiesQueryParams,
  getActivitiesQueryParamsByQueryName,
  getActivityCounts,
} from 'redux/selectors';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import { ActivitySingleQueryData } from 'redux/interfaces';
import { fetchActivityCounts, fetchActivityList } from 'redux/thunks';
import ActivityTabsSkeleton from './ActivityTabsSkeleton/ActivityTabsSkeleton';
import ActivityResultsItemSkeleton from './ActivityResultsItemSkeleton/ActivityResultsItemSkeleton';
import * as S from './ActivityResultsStyles';

const ActivityResults: React.FC = () => {
  const dispatch = useAppDispatch();
  // const location = useLocation();
  // const history = useHistory();

  const activityTotals = useAppSelector(getActivityCounts);
  const activityType = useAppSelector(state =>
    getActivitiesQueryParamsByQueryName(state, 'type')
  ) as ActivityType;
  // const pageInfo = useAppSelector(getActivityPageInfo);
  const queryParams = useAppSelector(getActivitiesQueryParams);
  const countParams = useAppSelector(getActivitiesCountsParams);
  const activityResults = useAppSelector(getActivitiesList);
  const { isLoading: isActivityListFetching } = useAppSelector(
    getActivitiesListFetchingStatuses
  );

  const queryStringParams: StringifyOptions = {
    arrayFormat: 'bracket-separator',
    arrayFormatSeparator: '|',
  };

  // const activityQueryString = queryString.stringify(
  //   queryParams,
  //   queryStringParams
  // );
  //
  // React.useEffect(() => {
  //   history.push(activityPath(activityQueryString));
  // }, [activityQueryString]);
  //
  // const parsedActivityQuery = queryString.parse(location.search, {
  //   parseNumbers: true,
  //   ...queryStringParams,
  // });
  //
  // React.useEffect(() => {
  //   Object.entries(parsedActivityQuery).map(([queryName, queryData]) =>
  //     useUpdateActivityQuery(
  //       queryName as ActivityQueryNames,
  //       queryData as ActivitySingleQueryData | ActivityMultipleQueryData,
  //       'add',
  //       dispatch
  //     )
  //   );
  // }, []);

  React.useEffect(() => {
    dispatch(fetchActivityCounts(countParams));
  }, [countParams, dispatch, fetchActivityCounts]);

  React.useEffect(() => {
    console.log('use', queryParams);
    dispatch(fetchActivityList(queryParams));
  }, [queryParams, dispatch, fetchActivityList]);

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
    useUpdateActivityQuery(
      'type',
      newActivityType as ActivitySingleQueryData,
      'add',
      dispatch
    );
  };

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
        activityItemSkeleton()
      ) : (
        <S.ListContainer id="results-list">
          {activityResults.map(activityItem => (
            <div>lul</div>
            // <ResultItem
            //   key={searchResult.id}
            //   searchClass={searchClass}
            //   searchResult={searchResult}
            //   totals={totals}
            // />
          ))}
          {!isActivityListFetching && !activityResults.length ? (
            <EmptyContentPlaceholder text="No matches found" />
          ) : null}
        </S.ListContainer>
      )}
    </Grid>
  );
};

export default ActivityResults;
