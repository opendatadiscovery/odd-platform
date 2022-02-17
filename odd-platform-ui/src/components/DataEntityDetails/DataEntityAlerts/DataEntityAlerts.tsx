import React from 'react';
import { Grid, Typography } from '@mui/material';
import {
  Alert,
  AlertApiChangeAlertStatusRequest,
  AlertStatus,
} from 'generated-sources';
import DataEntityAlertItem from 'components/DataEntityDetails/DataEntityAlerts/DataEntityAlertItem/DataEntityAlertItem';
import DataEntityAlertsSkeleton from 'components/DataEntityDetails/DataEntityAlerts/DataEntityAlertsSkeleton/DataEntityAlertsSkeleton';
import EmptyContentPlaceholder from 'components/shared/EmptyContentPlaceholder/EmptyContentPlaceholder';
import { AlertsTableHeader, ColContainer } from './DataEntityAlertsStyles';

interface DataEntityAlertsProps {
  alertsList: Alert[];
  updateAlertStatus: (
    params: AlertApiChangeAlertStatusRequest
  ) => Promise<AlertStatus>;
  isAlertsFetching: boolean;
}

const DataEntityAlerts: React.FC<DataEntityAlertsProps> = ({
  alertsList,
  updateAlertStatus,
  isAlertsFetching,
}) => {
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
    <Grid container sx={{ mt: 2 }}>
      <AlertsTableHeader container>
        <ColContainer item $colType="date">
          <Typography variant="caption">Date</Typography>
        </ColContainer>
        <ColContainer item $colType="type">
          <Typography variant="caption">Alert type</Typography>
        </ColContainer>
        <ColContainer item $colType="description">
          <Typography variant="caption">Description</Typography>
        </ColContainer>
        <ColContainer item $colType="status">
          <Typography variant="caption">Status</Typography>
        </ColContainer>
        <ColContainer item $colType="updatedBy">
          <Typography variant="caption">Status updated by</Typography>
        </ColContainer>
        <ColContainer item $colType="updatedTime">
          <Typography variant="caption">Status updated time</Typography>
        </ColContainer>
        <ColContainer item $colType="actionBtn" />
      </AlertsTableHeader>
      {isAlertsFetching ? (
        <DataEntityAlertsSkeleton length={5} />
      ) : (
        <Grid container>
          {alertsList.map(alert => (
            <DataEntityAlertItem
              key={alert.id}
              alertStatusHandler={alertStatusHandler(
                alert.id,
                alert.status
              )}
              alert={alert}
            />
          ))}
        </Grid>
      )}
      {!isAlertsFetching && !alertsList.length ? (
        <EmptyContentPlaceholder />
      ) : null}
    </Grid>
  );
};
export default DataEntityAlerts;
