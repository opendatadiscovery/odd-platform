import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  Alert,
  AlertApiGetAllAlertsRequest,
  AlertApiGetAssociatedUserAlertsRequest,
  AlertApiGetDependentEntitiesAlertsRequest,
  AlertStatus,
} from 'generated-sources';
import {
  getAlertList,
  getAlertListFetchingStatus,
  getAlertListPageInfo,
  getMyAlertListFetchingStatus,
  getMyDependentsAlertListFetchingStatus,
} from 'redux/selectors';
import { AlertsResponse, updateAlertStatus } from 'redux/thunks';
import { EmptyContentPlaceholder } from 'components/shared';
import { Box, Grid, Typography } from '@mui/material';
import { AsyncThunk } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import AlertListSkeleton from './AlertSkeletonItem/AlertSkeletonItem';
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

  const pageInfo = useAppSelector(getAlertListPageInfo);
  const alerts = useAppSelector(getAlertList);

  const { isLoading: isAlertListFetching } = useAppSelector(getAlertListFetchingStatus);
  const { isLoading: isMyAlertListFetching } = useAppSelector(
    getMyAlertListFetchingStatus
  );
  const { isLoading: isMyDependentsAlertListFetching } = useAppSelector(
    getMyDependentsAlertListFetchingStatus
  );

  const isAlertsFetching =
    isAlertListFetching || isMyAlertListFetching || isMyDependentsAlertListFetching;
  const isAlertsNotFetching =
    !isAlertListFetching || !isMyAlertListFetching || !isMyDependentsAlertListFetching;

  const fetchNextPage = () => {
    if (!pageInfo.hasNext) return;
    dispatch(fetchAlerts({ page: pageInfo.page + 1, size: 30 }));
  };

  React.useEffect(() => {
    dispatch(fetchAlerts({ page: 1, size: 30 }));
  }, [fetchAlerts]);

  const alertStatusHandler = React.useCallback(
    (alertId: Alert['id'], alertStatus: AlertStatus) => {
      const status =
        alertStatus === AlertStatus.OPEN ? AlertStatus.RESOLVED : AlertStatus.OPEN;
      dispatch(updateAlertStatus({ alertId, alertStatusFormData: { status } }));
    },
    [updateAlertStatus]
  );

  return (
    <Box sx={{ mt: 2 }}>
      <S.AlertsTableHeader container>
        <S.ColContainer item $colType='name' onClick={() => fetchNextPage()}>
          <Typography variant='caption'>Name</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType='description'>
          <Typography variant='caption'>Description</Typography>
        </S.ColContainer>

        <S.ColContainer item container $colType='status' justifyContent='center'>
          <Typography variant='caption'>Status</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType='createdTime'>
          <Typography variant='caption'>Created at</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType='updatedBy' />
        <S.ColContainer item $colType='updatedAt'>
          <Typography variant='caption'>Status updated at</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType='actionBtn' />
      </S.AlertsTableHeader>
      <Grid container>
        <div style={{ width: '100%' }}>
          <InfiniteScroll
            dataLength={alerts?.length}
            next={fetchNextPage}
            hasMore={!!pageInfo?.hasNext}
            scrollThreshold='200px'
            loader={isAlertsFetching && <AlertListSkeleton length={5} />}
          >
            {alerts?.map(alert => (
              <AlertItem
                key={alert.id}
                alertStatusHandler={alertStatusHandler}
                alert={alert}
              />
            ))}
          </InfiniteScroll>
        </div>
      </Grid>
      {isAlertsNotFetching && !alerts?.length ? <EmptyContentPlaceholder /> : null}
    </Box>
  );
};

export default AlertsList;
