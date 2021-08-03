import React from 'react';
import { Typography } from '@material-ui/core';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  Alert,
  AlertApiGetAllAlertsRequest,
  AlertApiGetAssociatedUserAlertsRequest,
  AlertApiGetDependentEntitiesAlertsRequest,
} from 'generated-sources';
import { CurrentPageInfo } from 'redux/interfaces/common';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import { StylesType } from './AlertsListStyles';
import AlertItem from './AlertItem/AlertItem';
import AlertListSkeleton from './AlertListSkeleton/AlertListSkeleton';

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
}

const AlertsList: React.FC<AlertsListProps> = ({
  classes,
  alerts,
  pageInfo,
  alertListFetching,
  fetchAlerts,
}) => {
  const fetchNextPage = () => {
    if (!pageInfo.hasNext) return;
    fetchAlerts({ page: pageInfo.page + 1, size: 30 });
  };

  React.useEffect(() => {
    fetchNextPage();
  }, [fetchAlerts]);

  return (
    <div className={classes.container}>
      <InfiniteScroll
        dataLength={alerts?.length}
        next={fetchNextPage}
        hasMore={!!pageInfo?.hasNext}
        loader={
          alertListFetching ? <AlertListSkeleton length={5} /> : null
        } // Temp
        scrollThreshold="200px"
      >
        {alerts?.map(alert => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </InfiniteScroll>
      {!alertListFetching && !alerts?.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </div>
  );
};

export default AlertsList;
