import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  type AlertApiGetAllAlertsRequest,
  type AlertApiGetAssociatedUserAlertsRequest,
  type AlertApiGetDependentEntitiesAlertsRequest,
} from 'generated-sources';
import {
  getAlertListFetchingError,
  getAlertListFetchingStatus,
  getAlertsPageInfo,
  getMyAlertListFetchingError,
  getMyAlertListFetchingStatus,
  getMyDependentsAlertListFetchingError,
  getMyDependentsAlertListFetchingStatus,
  getAlerts,
} from 'redux/selectors';
import { AppErrorPage, EmptyContentPlaceholder } from 'components/shared/elements';
import { Grid } from '@mui/material';
import { type AsyncThunk } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import type { AlertsResponse } from 'redux/interfaces';
import DataEntityAlertsSkeleton from '../../DataEntityDetails/DataEntityAlerts/DataEntityAlertItem/DataEntityAlertsSkeleton';
import * as S from './AlertsListStyles';
import AlertItem from './AlertItem/AlertItem';

interface AlertsListProps {
  fetchAlerts: AsyncThunk<
    AlertsResponse,
    | AlertApiGetAllAlertsRequest
    | AlertApiGetAssociatedUserAlertsRequest
    | AlertApiGetDependentEntitiesAlertsRequest,
    Record<string, unknown>
  >;
}

const AlertsList: React.FC<AlertsListProps> = ({ fetchAlerts }) => {
  const dispatch = useAppDispatch();

  const pageInfo = useAppSelector(getAlertsPageInfo);
  const alerts = useAppSelector(getAlerts);

  const {
    isLoaded: isAlertListFetched,
    isLoading: isAlertListFetching,
    isNotLoaded: isAlertListNotLoaded,
  } = useAppSelector(getAlertListFetchingStatus);
  const {
    isLoaded: isMyAlertListFetched,
    isLoading: isMyAlertListFetching,
    isNotLoaded: isMyAlertListNotLoaded,
  } = useAppSelector(getMyAlertListFetchingStatus);
  const {
    isLoaded: isMyDependentsAlertListFetched,
    isLoading: isMyDependentsAlertListFetching,
    isNotLoaded: isMyDependentsAlertListNotLoaded,
  } = useAppSelector(getMyDependentsAlertListFetchingStatus);
  const alertListError = useAppSelector(getAlertListFetchingError);
  const myAlertListError = useAppSelector(getMyAlertListFetchingError);
  const myDependentsAlertListError = useAppSelector(
    getMyDependentsAlertListFetchingError
  );

  const alertsError = alertListError || myAlertListError || myDependentsAlertListError;
  const isAlertsFetched =
    isAlertListFetched || isMyAlertListFetched || isMyDependentsAlertListFetched;
  const isAlertsFetching =
    isAlertListFetching || isMyAlertListFetching || isMyDependentsAlertListFetching;
  const isAlertsNotLoaded =
    isAlertListNotLoaded || isMyAlertListNotLoaded || isMyDependentsAlertListNotLoaded;

  const size = 30;

  const fetchNextPage = () => {
    if (!pageInfo.hasNext) return;
    dispatch(fetchAlerts({ page: pageInfo.page + 1, size }));
  };

  React.useEffect(() => {
    dispatch(fetchAlerts({ page: 1, size }));
  }, [fetchAlerts]);

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
