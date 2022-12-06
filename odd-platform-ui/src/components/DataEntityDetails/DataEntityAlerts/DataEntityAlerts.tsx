import React from 'react';
import { Grid, Typography } from '@mui/material';
import { AlertStatus } from 'generated-sources';
import { fetchDataEntityAlertsConfig, updateAlertStatus } from 'redux/thunks';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import {
  getDataEntityAlertListFetchingStatus,
  getAlertList,
  getDataEntityAlertConfig,
  getDataEntityAlertsFetchingError,
} from 'redux/selectors/alert.selectors';
import { AppErrorPage, EmptyContentPlaceholder } from 'components/shared';
import { useAppParams } from 'lib/hooks';
import type { Alert } from 'redux/interfaces';
import AppButton from 'components/shared/AppButton/AppButton';
import NotificationSettings from 'components/DataEntityDetails/DataEntityAlerts/NotificationSettings/NotificationSettings';
import DataEntityAlertItem from './DataEntityAlertItem/DataEntityAlertItem';
import DataEntityAlertsSkeleton from './DataEntityAlertsSkeleton/DataEntityAlertsSkeleton';
import { AlertsTableHeader, ColContainer } from './DataEntityAlertsStyles';

const DataEntityAlerts: React.FC = () => {
  const dispatch = useAppDispatch();
  const { dataEntityId } = useAppParams();

  const {
    isLoading: isAlertsFetching,
    isNotLoaded: isAlertsNotFetched,
    isLoaded: isAlertsFetched,
  } = useAppSelector(getDataEntityAlertListFetchingStatus);
  const alertsListError = useAppSelector(getDataEntityAlertsFetchingError);
  const alertsList = useAppSelector(getAlertList);

  const alertStatusHandler = React.useCallback(
    (alertId: Alert['id'], alertStatus: AlertStatus) => () => {
      const status =
        alertStatus === AlertStatus.OPEN ? AlertStatus.RESOLVED : AlertStatus.OPEN;

      dispatch(updateAlertStatus({ alertId, alertStatusFormData: { status } }));
    },
    [updateAlertStatus]
  );

  React.useEffect(() => {
    dispatch(fetchDataEntityAlertsConfig({ dataEntityId }));
  }, [dataEntityId]);

  return (
    <Grid container sx={{ mt: 2.25 }}>
      <NotificationSettings
        btnCreateEl={
          <AppButton size='medium' color='tertiary'>
            Notification settings
          </AppButton>
        }
      />
      <AlertsTableHeader container sx={{ mt: 2.25 }}>
        <ColContainer item $colType='date'>
          <Typography variant='caption'>Date</Typography>
        </ColContainer>
        <ColContainer item $colType='type'>
          <Typography variant='caption'>Alert type</Typography>
        </ColContainer>
        <ColContainer item $colType='description'>
          <Typography variant='caption'>Description</Typography>
        </ColContainer>
        <ColContainer item $colType='status'>
          <Typography variant='caption'>Status</Typography>
        </ColContainer>
        <ColContainer item $colType='updatedBy'>
          <Typography variant='caption'>Status updated by</Typography>
        </ColContainer>
        <ColContainer item $colType='updatedTime'>
          <Typography variant='caption'>Status updated time</Typography>
        </ColContainer>
        <ColContainer item $colType='actionBtn' />
      </AlertsTableHeader>
      {isAlertsFetching ? (
        <DataEntityAlertsSkeleton length={5} />
      ) : (
        <Grid container>
          {alertsList.map(alert => (
            <DataEntityAlertItem
              key={alert.id}
              alertStatusHandler={alertStatusHandler(alert.id, alert.status)}
              alert={alert}
            />
          ))}
        </Grid>
      )}
      <EmptyContentPlaceholder
        isContentLoaded={isAlertsFetched}
        isContentEmpty={!alertsList.length}
      />
      <AppErrorPage isNotContentLoaded={isAlertsNotFetched} error={alertsListError} />
    </Grid>
  );
};
export default DataEntityAlerts;
