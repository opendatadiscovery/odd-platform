import React from 'react';
import { Grid } from '@mui/material';
import { Permission } from 'generated-sources';
import { useAppSelector } from 'redux/lib/hooks';
import {
  getAlertList,
  getDataEntityAlertListFetchingStatus,
  getDataEntityAlertsFetchingError,
} from 'redux/selectors/alert.selectors';
import { AppButton, AppErrorPage, EmptyContentPlaceholder } from 'components/shared';
import { WithPermissions } from 'components/shared/contexts';
import NotificationSettings from './NotificationSettings/NotificationSettings';
import DataEntityAlertItem from './DataEntityAlertItem/DataEntityAlertItem';
import DataEntityAlertsSkeleton from './DataEntityAlertsSkeleton/DataEntityAlertsSkeleton';
import * as S from './DataEntityAlertsStyles';

const DataEntityAlerts: React.FC = () => {
  const {
    isLoading: isAlertsFetching,
    isNotLoaded: isAlertsNotFetched,
    isLoaded: isAlertsFetched,
  } = useAppSelector(getDataEntityAlertListFetchingStatus);
  const alertsListError = useAppSelector(getDataEntityAlertsFetchingError);
  const alertsList = useAppSelector(getAlertList);

  return (
    <S.Container container>
      <WithPermissions permissionTo={Permission.DATA_ENTITY_ALERT_CONFIG_UPDATE}>
        <Grid container justifyContent='flex-end' sx={{ py: 0.75 }}>
          <NotificationSettings
            btnCreateEl={
              <AppButton size='medium' color='tertiary'>
                Notification settings
              </AppButton>
            }
          />
        </Grid>
      </WithPermissions>
      {isAlertsFetching ? (
        <DataEntityAlertsSkeleton length={5} />
      ) : (
        <S.AlertsContainer container rowGap={1}>
          {alertsList.map(alert => (
            <DataEntityAlertItem key={alert.id} alert={alert} />
          ))}
        </S.AlertsContainer>
      )}
      <EmptyContentPlaceholder
        isContentLoaded={isAlertsFetched}
        isContentEmpty={!alertsList.length}
      />
      <AppErrorPage isNotContentLoaded={isAlertsNotFetched} error={alertsListError} />
    </S.Container>
  );
};
export default DataEntityAlerts;
