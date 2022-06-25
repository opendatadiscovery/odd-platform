import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  Alert,
  AlertApiGetAllAlertsRequest,
  AlertApiGetAssociatedUserAlertsRequest,
  AlertApiGetDependentEntitiesAlertsRequest,
  AlertStatus,
} from 'generated-sources';

import { AsyncThunkAction } from '@reduxjs/toolkit';
import { CurrentPageInfo } from 'redux/interfaces';

import {
  getAlertListPageInfo,
  getAlertListFetchingStatus,
  getMyAlertListFetchingStatus,
  getMyDependentsAlertListFetchingStatus,
  getAlertList,
} from 'redux/selectors/alert.selectors';
import { useAppDispatch, useAppSelector } from 'lib/redux/hooks';
import { updateAlertStatus } from 'redux/thunks';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import { Box, Typography } from '@mui/material';
import AlertListSkeleton from 'components/Alerts/AlertsList/AlertSkeletonItem/AlertSkeletonItem';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import * as S from './AlertsListStyles';
import AlertItem from './AlertItem/AlertItem';

interface AlertsListProps {
  fetchAlerts: (
    params:
      | AlertApiGetAllAlertsRequest
      | AlertApiGetAssociatedUserAlertsRequest
      | AlertApiGetDependentEntitiesAlertsRequest
  ) => AsyncThunkAction<
    {
      items: Alert[];
      pageInfo: CurrentPageInfo;
    },
    unknown,
    Record<string, unknown>
  >;
}

const AlertsList: React.FC<AlertsListProps> = ({ fetchAlerts }) => {
  const dispatch = useAppDispatch();
  const pageInfo = useAppSelector(getAlertListPageInfo);
  const alerts = useAppSelector(getAlertList);
  const { isLoading: alertListFetching } = useAppSelector(
    getAlertListFetchingStatus
  );
  const { isLoading: myAlertListFetching } = useAppSelector(
    getMyAlertListFetchingStatus
  );
  const { isLoading: myDependentsAlertListFetching } = useAppSelector(
    getMyDependentsAlertListFetchingStatus
  );
  const fetchNextPage = () => {
    if (!pageInfo.hasNext) return;
    dispatch(fetchAlerts({ page: pageInfo.page + 1, size: 30 }));
  };

  React.useEffect(() => {
    dispatch(
      fetchAlerts({
        page: 1,
        size: 30,
      })
    );
  }, [fetchAlerts]);

  const alertStatusHandler = React.useCallback(
    (alertId: Alert['id'], alertStatus: AlertStatus) => () => {
      dispatch(
        updateAlertStatus({
          alertId,
          alertStatusFormData: {
            status:
              alertStatus === AlertStatus.OPEN
                ? AlertStatus.RESOLVED
                : AlertStatus.OPEN,
          },
        })
      );
    },
    [updateAlertStatus]
  );

  return (
    <Box sx={{ mt: 2 }}>
      <S.AlertsTableHeader container>
        <S.ColContainer item $colType="name">
          <Typography variant="caption">Name</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType="description">
          <Typography variant="caption">Description</Typography>
        </S.ColContainer>

        <S.ColContainer
          item
          container
          $colType="status"
          justifyContent="center"
        >
          <Typography variant="caption">Status</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType="createdTime">
          <Typography variant="caption">Created at</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType="updatedBy">
          {/* <Typography variant="caption">Status updated by</Typography> */}
        </S.ColContainer>
        <S.ColContainer item $colType="updatedAt">
          <Typography variant="caption">Status updated at</Typography>
        </S.ColContainer>
        <S.ColContainer item $colType="actionBtn" />
      </S.AlertsTableHeader>
      <InfiniteScroll
        dataLength={alerts?.length}
        next={fetchNextPage}
        hasMore={!!pageInfo?.hasNext}
        loader={
          alertListFetching ||
          myAlertListFetching ||
          (myDependentsAlertListFetching && (
            <SkeletonWrapper
              renderContent={({ randomSkeletonPercentWidth, key }) => (
                <AlertListSkeleton
                  width={randomSkeletonPercentWidth()}
                  key={key}
                />
              )}
            />
          ))
        }
        scrollThreshold="200px"
      >
        {alerts?.map(alert => (
          <AlertItem
            alertStatusHandler={alertStatusHandler(alert.id, alert.status)}
            key={alert.id}
            alert={alert}
          />
        ))}
      </InfiniteScroll>
      {!alertListFetching ||
      !myAlertListFetching ||
      (!myDependentsAlertListFetching && !alerts?.length) ? (
        <EmptyContentPlaceholder />
      ) : null}
    </Box>
  );
};

export default AlertsList;
