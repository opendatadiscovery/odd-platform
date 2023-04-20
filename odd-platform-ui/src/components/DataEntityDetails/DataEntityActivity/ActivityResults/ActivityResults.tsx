import React from 'react';
import { Grid } from '@mui/material';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntityActivitiesByDate,
  getDataEntityActivitiesFetchingError,
  getDataEntityActivitiesFetchingStatuses,
  getDataEntityActivitiesLengthByEntityId,
  getDataEntityActivitiesPageInfo,
} from 'redux/selectors';
import { useAppParams, useQueryParams } from 'lib/hooks';
import { fetchDataEntityActivityList } from 'redux/thunks';
import { AppErrorPage, EmptyContentPlaceholder } from 'components/shared/elements';
import {
  type ActivityQuery,
  defaultActivityQuery,
} from 'components/shared/elements/Activity/common';
import { ActivityResultsList } from 'components/shared/elements/Activity';
import ActivityItem from './ActivityItem/ActivityItem';

const ActivityResults: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();
  const { queryParams } = useQueryParams<ActivityQuery>(defaultActivityQuery);

  const activitiesByDate = useAppSelector(getDataEntityActivitiesByDate(dataEntityId));
  const { hasNext, lastId, lastDateTime } = useAppSelector(
    getDataEntityActivitiesPageInfo(dataEntityId)
  );
  const activitiesLength = useAppSelector(
    getDataEntityActivitiesLengthByEntityId(dataEntityId)
  );
  const activitiesError = useAppSelector(getDataEntityActivitiesFetchingError);
  const {
    isLoading: isActivitiesFetching,
    isNotLoaded: isActivitiesNotFetched,
    isLoaded: isActivitiesFetched,
  } = useAppSelector(getDataEntityActivitiesFetchingStatuses);

  React.useEffect(() => {
    dispatch(
      fetchDataEntityActivityList({ ...queryParams, dataEntityId, isQueryUpdated: true })
    );
  }, [queryParams, dataEntityId]);

  const fetchNextPage = React.useCallback(() => {
    if (!hasNext) return;

    dispatch(
      fetchDataEntityActivityList({
        ...queryParams,
        dataEntityId,
        lastEventId: lastId,
        lastEventDateTime: lastDateTime,
        isQueryUpdated: false,
      })
    );
  }, [queryParams, hasNext, dataEntityId, lastId, lastDateTime]);

  return (
    <Grid container>
      <ActivityResultsList
        activitiesLength={activitiesLength}
        fetchNextPage={fetchNextPage}
        hasNext={hasNext}
        isActivitiesFetching={isActivitiesFetching}
        activitiesByDate={activitiesByDate}
        heightOffset={15}
        activityItem={ActivityItem}
      />
      <AppErrorPage
        showError={isActivitiesNotFetched}
        offsetTop={155}
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
