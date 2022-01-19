import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  Alert,
  AlertApiChangeAlertStatusRequest,
  AlertApiGetAllAlertsRequest,
  AlertApiGetAssociatedUserAlertsRequest,
  AlertApiGetDependentEntitiesAlertsRequest,
  AlertStatus,
} from 'generated-sources';
import { CurrentPageInfo } from 'redux/interfaces/common';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import { Box, Typography } from '@mui/material';
import AlertListSkeleton from 'components/Alerts/AlertsList/AlertSkeletonItem/AlertSkeletonItem';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import * as S from './AlertsListStyles';
import AlertItem from './AlertItem/AlertItem';

interface AlertsListProps {
  alerts: Alert[];
  pageInfo: CurrentPageInfo;
  alertListFetching: boolean;
  fetchAlerts: (
    params:
      | AlertApiGetAllAlertsRequest
      | AlertApiGetAssociatedUserAlertsRequest
      | AlertApiGetDependentEntitiesAlertsRequest
  ) => void;
  updateAlertStatus: (
    params: AlertApiChangeAlertStatusRequest
  ) => Promise<AlertStatus>;
}

const AlertsList: React.FC<AlertsListProps> = ({
  alerts,
  pageInfo,
  alertListFetching,
  fetchAlerts,
  updateAlertStatus,
}) => {
  const fetchNextPage = () => {
    if (!pageInfo.hasNext) return;
    fetchAlerts({ page: pageInfo.page + 1, size: 30 });
  };

  React.useEffect(() => {
    fetchNextPage();
  }, [fetchAlerts]);

  const alertStatusHandler = React.useCallback(
    (alertId: Alert['id'], alertStatus: AlertStatus) => () => {
      updateAlertStatus({
        alertId,
        alertStatusFormData: {
          status:
            alertStatus === AlertStatus.OPEN
              ? AlertStatus.RESOLVED
              : AlertStatus.OPEN,
        },
      });
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
          alertListFetching && (
            <SkeletonWrapper
              renderContent={({ randomSkeletonPercentWidth, key }) => (
                <AlertListSkeleton
                  width={randomSkeletonPercentWidth()}
                  key={key}
                />
              )}
            />
          )
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
      {!alertListFetching && !alerts?.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </Box>
  );
};

export default AlertsList;
