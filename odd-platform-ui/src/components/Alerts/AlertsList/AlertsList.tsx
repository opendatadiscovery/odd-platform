import { Grid, Typography } from '@material-ui/core';
import React from 'react';
import cx from 'classnames';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  Alert,
  AlertApiGetAllAlertsRequest,
  AlertApiGetAssociatedUserAlertsRequest,
  AlertApiGetDependentEntitiesAlertsRequest,
} from 'generated-sources';
import { CurrentPageInfo } from 'redux/interfaces/common';
import { StylesType } from './AlertsListStyles';
import AlertItem from './AlertItem/AlertItem';

interface AlertsListProps extends StylesType {
  alerts: Alert[];
  pageInfo: CurrentPageInfo;
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
  fetchAlerts,
}) => {
  const fetchNextPage = () => {};

  React.useEffect(() => {
    fetchAlerts({ page: 1, size: 1 });
  }, [fetchAlerts]);

  return (
    <div className={classes.container}>
      <InfiniteScroll
        dataLength={alerts?.length}
        next={fetchNextPage}
        hasMore={!!pageInfo?.hasNext}
        loader={<span>loading</span>} // <SearchResultsSkeleton length={5} />}
        scrollThreshold="200px"
        // scrollableTarget="results-list"
      >
        {alerts?.map(alert => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </InfiniteScroll>
    </div>
  );
};

export default AlertsList;
