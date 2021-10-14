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
import { Grid, Typography } from '@mui/material';
import cx from 'classnames';
import AlertListSkeleton from 'components/Alerts/AlertsList/AlertSkeletonItem/AlertSkeletonItem';
import SkeletonWrapper from 'components/shared/SkeletonWrapper/SkeletonWrapper';
import { StylesType } from './AlertsListStyles';
import AlertItem from './AlertItem/AlertItem';

interface AlertsListProps extends StylesType {
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
  classes,
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
    <div className={classes.container}>
      <Grid container className={classes.alertsTableHeader}>
        <Grid item className={cx(classes.col, classes.colName)}>
          <Typography variant="caption">Name</Typography>
        </Grid>
        <Grid item className={cx(classes.col, classes.colDescription)}>
          <Typography variant="caption">Description</Typography>
        </Grid>

        <Grid
          item
          container
          className={cx(classes.col, classes.colStatus)}
          justifyContent="center"
        >
          <Typography variant="caption">Status</Typography>
        </Grid>
        <Grid item className={cx(classes.col, classes.colCreatedTime)}>
          <Typography variant="caption">Created at</Typography>
        </Grid>
        <Grid item className={cx(classes.col, classes.colUpdatedBy)}>
          {/* <Typography variant="caption">Status updated by</Typography> */}
        </Grid>
        <Grid item className={cx(classes.col, classes.colUpdatedAt)}>
          <Typography variant="caption">Status updated at</Typography>
        </Grid>
        <Grid item className={cx(classes.col, classes.colActionBtn)} />
      </Grid>
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
    </div>
  );
};

export default AlertsList;
