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

  // `size` is a structural pagination param the API requires; it is always sent explicitly so a partial /
  // deep-linked alerts URL (e.g. /alerts?status=RESOLVED) — which useQueryParams returns without the
  // defaults — still issues a valid request rather than throwing on the missing required param. `status`
  // is deliberately NOT defaulted here so the "All statuses" filter option (status cleared) still works.
  React.useEffect(() => {
    dispatch(fetchAlerts({ ...queryParams, page: 1, size: defaultAlertsQuery.size }));
  }, [queryParams]);

  const fetchNextPage = () => {
    if (!pageInfo.hasNext) return;
    dispatch(
      fetchAlerts({ ...queryParams, page: pageInfo.page + 1, size: defaultAlertsQuery.size })
    );
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
