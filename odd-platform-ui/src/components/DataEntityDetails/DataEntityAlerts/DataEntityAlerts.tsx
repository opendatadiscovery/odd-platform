import React from 'react';
import { Grid } from '@mui/material';
import { Permission } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntityAlertListFetchingStatus,
  getDataEntityAlerts,
  getDataEntityAlertsFetchingError,
  getDataEntityAlertsPageInfo,
} from 'redux/selectors/alert.selectors';
import {
  Button,
  AppErrorPage,
  EmptyContentPlaceholder,
} from 'components/shared/elements';
import { WithPermissions } from 'components/shared/contexts';
import { fetchDataEntityAlerts } from 'redux/thunks';
import { useAppParams } from 'lib/hooks';
import InfiniteScroll from 'react-infinite-scroll-component';
import DataEntityAlertsSkeleton from './DataEntityAlertItem/DataEntityAlertsSkeleton';
import NotificationSettings from './NotificationSettings/NotificationSettings';
import DataEntityAlertItem from './DataEntityAlertItem/DataEntityAlertItem';
import * as S from './DataEntityAlertsStyles';

const DataEntityAlerts: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();

  const size = 30;

  React.useEffect(() => {
    dispatch(fetchDataEntityAlerts({ dataEntityId, page: 1, size }));
  }, [dataEntityId]);

  const {
    isLoading: isAlertsFetching,
    isNotLoaded: isAlertsNotFetched,
    isLoaded: isAlertsFetched,
  } = useAppSelector(getDataEntityAlertListFetchingStatus);
  const alertsListError = useAppSelector(getDataEntityAlertsFetchingError);
  const alertsList = useAppSelector(getDataEntityAlerts(dataEntityId));
  const { hasNext, page } = useAppSelector(getDataEntityAlertsPageInfo(dataEntityId));

  const fetchNextPage = () => {
    if (!hasNext) return;
    dispatch(fetchDataEntityAlerts({ dataEntityId, page: page + 1, size }));
  };

  return (
    <S.Container container>
      <WithPermissions permissionTo={Permission.DATA_ENTITY_ALERT_CONFIG_UPDATE}>
        <Grid container justifyContent='flex-end' sx={{ py: 0.75 }}>
          <NotificationSettings
            btnCreateEl={<Button text='Notification settings' buttonType='tertiary-m' />}
          />
        </Grid>
      </WithPermissions>

      <S.AlertsContainer
        $disableHeight={!!alertsList.length}
        container
        id='de-alerts-list'
        rowGap={1}
      >
        <InfiniteScroll
          style={{ rowGap: '8px', display: 'flex', flexDirection: 'column' }}
          dataLength={alertsList?.length}
          next={fetchNextPage}
          hasMore={hasNext}
          scrollThreshold='200px'
          loader={isAlertsFetching && <DataEntityAlertsSkeleton length={5} />}
          scrollableTarget='de-alerts-list'
        >
          {alertsList.map(alert => (
            <DataEntityAlertItem key={alert.id} alert={alert} />
          ))}
        </InfiniteScroll>
      </S.AlertsContainer>

      <EmptyContentPlaceholder
        isContentLoaded={isAlertsFetched}
        isContentEmpty={!alertsList.length}
      />
      <AppErrorPage showError={isAlertsNotFetched} error={alertsListError} />
    </S.Container>
  );
};
export default DataEntityAlerts;
