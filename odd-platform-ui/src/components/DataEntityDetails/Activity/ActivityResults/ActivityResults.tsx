import React from 'react';
import { Grid } from '@mui/material';
import { ActivityType } from 'generated-sources';
import { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import queryString, { StringifyOptions } from 'query-string';
import {
  getActivitiesList,
  getActivitiesListFetchingStatuses,
  getActivitiesQueryParams,
  getActivitiesQueryParamsByName,
  getActivityCounts,
} from 'redux/selectors';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import { useHistory, useLocation } from 'react-router-dom';
import { dataEntityActivityPath } from 'lib/paths';
import { useAppParams } from 'lib/hooks';
import ActivityResultsItemSkeleton from './ActivityResultsItemSkeleton/ActivityResultsItemSkeleton';
import * as S from './ActivityResultsStyles';

const ActivityResults: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const history = useHistory();
  const { dataEntityId } = useAppParams();

  const activityTotals = useAppSelector(getActivityCounts);
  const activityType = useAppSelector(
    getActivitiesQueryParamsByName('type')
  ) as ActivityType;
  // const pageInfo = useAppSelector(getActivityPageInfo);
  const queryParams = useAppSelector(getActivitiesQueryParams);
  const activityResults = useAppSelector(getActivitiesList);
  const { isLoading: isActivityListFetching } = useAppSelector(
    getActivitiesListFetchingStatuses
  );

  const queryStringParams: StringifyOptions = {
    arrayFormat: 'bracket-separator',
    arrayFormatSeparator: '|',
  };

  const activityQueryString = queryString.stringify(
    queryParams,
    queryStringParams
  );

  React.useEffect(() => {
    history.push(
      dataEntityActivityPath(dataEntityId, activityQueryString)
    );
  }, []);

  const parsedActivityQuery = queryString.parse(location.search, {
    parseNumbers: true,
    ...queryStringParams,
  });

  React.useEffect(() => {
    // Object.entries(parsedActivityQuery).map(([queryName, queryData]) =>
    //   // useUpdateActivityQuery(
    //   //   queryName as ActivityQueryName,
    //   //   queryData as ActivitySingleQueryData | ActivityMultipleQueryData,
    //   //   'add',
    //   //   dispatch
    //   // )
    // );
  }, []);

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
    // useUpdateActivityQuery(
    //   'type',
    //   newActivityType as ActivitySingleQueryData,
    //   'add',
    //   dispatch
    // );
  };

  // React.useEffect(() => {
  //   dispatch(
  //     fetchDataEntityActivityList({ ...queryParams, dataEntityId })
  //   );
  // }, []);

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
      {/* {isActivityListFetching ? ( */}
      {/*  <ActivityTabsSkeleton length={tabs.length} /> */}
      {/* ) : ( */}
      {/*  <AppTabs */}
      {/*    type="primary" */}
      {/*    items={tabs} */}
      {/*    selectedTab={selectedTab} */}
      {/*    handleTabChange={onActivityTypeChange} */}
      {/*    isHintUpdated={isActivityListFetching} */}
      {/*  /> */}
      {/* )} */}
      {isActivityListFetching ? (
        activityItemSkeleton()
      ) : (
        <S.ListContainer container>
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
