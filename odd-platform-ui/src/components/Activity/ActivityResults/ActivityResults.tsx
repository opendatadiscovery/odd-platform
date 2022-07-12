import React from 'react';
import { Grid } from '@mui/material';
import { ActivityType } from 'generated-sources';
import AppTabs, { AppTabItem } from 'components/shared/AppTabs/AppTabs';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import {
  getActivitiesByDate,
  getActivitiesCount,
  getActivitiesCountsParams,
  getActivitiesListFetchingStatuses,
  getActivitiesQueryParams,
  getActivitiesQueryParamsByName,
  getActivityCounts,
} from 'redux/selectors';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import { fetchActivityCounts, fetchActivityList } from 'redux/thunks';
import { setActivityQueryParam } from 'redux/reducers/activity.slice';
import { useAppQuery } from 'lib/hooks';
import { ActivityQueryName, ActivityQueryParams } from 'redux/interfaces';
import { useHistory, useLocation } from 'react-router-dom';
import { activityPath } from 'lib/paths';
import ActivityResultByDate from 'components/Activity/ActivityResults/ActivityResultByDate/ActivityResultByDate';
import AppButton from 'components/shared/AppButton/AppButton';
import ActivityTabsSkeleton from './ActivityTabsSkeleton/ActivityTabsSkeleton';
import ActivityResultsItemSkeleton from './ActivityResultsItemSkeleton/ActivityResultsItemSkeleton';
import * as S from './ActivityResultsStyles';

const ActivityResults: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  const history = useHistory();

  const activityTotals = useAppSelector(getActivityCounts);
  const activityType = useAppSelector(
    getActivitiesQueryParamsByName('type')
  );
  const queryParams = useAppSelector(getActivitiesQueryParams);
  const countParams = useAppSelector(getActivitiesCountsParams);
  const activityResults = useAppSelector(getActivitiesByDate);
  const activityCount = useAppSelector(getActivitiesCount);
  const { isLoading: isActivityListFetching } = useAppSelector(
    getActivitiesListFetchingStatuses
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

  React.useEffect(() => {
    if (isQueryUpdated) {
      dispatch(fetchActivityList(queryParams));
    }
  }, [queryParams, isQueryUpdated]);

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
      renderContent={({ randomSkeletonPercentWidth, key }) => (
        <ActivityResultsItemSkeleton
          width={randomSkeletonPercentWidth()}
          key={key}
        />
      )}
    />
  );

  const [hideAllDetails, setHideAllDetails] = React.useState(false);

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
        <>
          {!isActivityListFetching && !activityCount ? (
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
                  // sx={{ alignSelf: 'end' }}
                >
                  Hide all details
                </AppButton>
              </Grid>
              <S.ListContainer>
                {/* <Grid container justifyContent="flex-end"> */}
                {/*  <AppButton */}
                {/*    size="small" */}
                {/*    color="tertiary" */}
                {/*    sx={{ alignSelf: 'end' }} */}
                {/*  > */}
                {/*    Hide all details */}
                {/*  </AppButton> */}
                {/* </Grid> */}
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
              </S.ListContainer>
            </>
          )}
        </>
      )}
    </Grid>
  );
};

export default ActivityResults;
