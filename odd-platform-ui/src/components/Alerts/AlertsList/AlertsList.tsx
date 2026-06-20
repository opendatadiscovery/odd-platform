import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Grid } from '@mui/material';
import {
  getAlertListFetchingError,
  getAlertListFetchingStatus,
  getAlertsPageInfo,
  getAlerts,
} from 'redux/selectors';
import { AppErrorPage, EmptyContentPlaceholder } from 'components/shared/elements';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { fetchAlerts } from 'redux/thunks';
import { useQueryParams } from 'lib/hooks';
import { type AlertsQuery, defaultAlertsQuery } from 'components/Alerts/common';
import DataEntityAlertsSkeleton from '../../DataEntityDetails/DataEntityAlerts/DataEntityAlertItem/DataEntityAlertsSkeleton';
import * as S from './AlertsListStyles';
import AlertItem from './AlertItem/AlertItem';

// Reads the full AlertsQuery (tab + filters) off the URL and drives the new getAlertsList endpoint.
// The endpoint returns a bare Alert[], so paging is length-based: keep fetching the next page while
// the previous page came back full (pageInfo.hasNext, set in the thunk).
const AlertsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { queryParams } = useQueryParams<AlertsQuery>(defaultAlertsQuery);

  const pageInfo = useAppSelector(getAlertsPageInfo);
  const alerts = useAppSelector(getAlerts);

  const {
    isLoaded: isAlertsFetched,
    isLoading: isAlertsFetching,
    isNotLoaded: isAlertsNotLoaded,
  } = useAppSelector(getAlertListFetchingStatus);
  const alertsError = useAppSelector(getAlertListFetchingError);

  React.useEffect(() => {
    dispatch(fetchAlerts({ ...queryParams, page: 1 }));
  }, [queryParams]);

  const fetchNextPage = () => {
    if (!pageInfo.hasNext) return;
    dispatch(fetchAlerts({ ...queryParams, page: pageInfo.page + 1 }));
  };

  return (
    <Grid container sx={{ mt: 2 }}>
      <S.AlertsContainer $disableHeight={!!alerts.length} container id='alerts-list'>
        <InfiniteScroll
          style={{ rowGap: '8px', display: 'flex', flexDirection: 'column' }}
          dataLength={alerts?.length}
          next={fetchNextPage}
          hasMore={!!pageInfo?.hasNext}
          scrollThreshold='200px'
          loader={isAlertsFetching && <DataEntityAlertsSkeleton length={5} />}
          scrollableTarget='alerts-list'
        >
          {alerts?.map(alert => (
            <AlertItem key={alert.id} alert={alert} />
          ))}
        </InfiniteScroll>
      </S.AlertsContainer>

      <AppErrorPage showError={isAlertsNotLoaded} error={alertsError} />
      <EmptyContentPlaceholder
        isContentLoaded={isAlertsFetched && !isAlertsFetching && !isAlertsNotLoaded}
        isContentEmpty={!alerts.length}
      />
    </Grid>
  );
};

export default AlertsList;
