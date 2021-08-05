import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import {
  Alert,
  AlertApiChangeAlertStatusRequest,
  AlertStatus,
} from 'generated-sources';
import cx from 'classnames';
import DataEntityAlertItem from 'components/DataEntityDetails/DataEntityAlerts/DataEntityAlertItem/DataEntityAlertItem';
import DataEntityAlertsSkeleton from 'components/DataEntityDetails/DataEntityAlerts/DataEntityAlertsSkeleton/DataEntityAlertsSkeleton';
import { StylesType } from './DataEntityAlertsStyles';

interface DataEntityAlertsProps extends StylesType {
  alertsList: Alert[];
  updateAlertStatus: (
    params: AlertApiChangeAlertStatusRequest
  ) => Promise<AlertStatus>;
  isAlertsFetching: boolean;
}

const DataEntityAlerts: React.FC<DataEntityAlertsProps> = ({
  classes,
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
    <Grid container className={classes.container}>
      <Grid container className={classes.alertsTableHeader}>
        <Grid item className={cx(classes.col, classes.colDate)}>
          <Typography variant="caption">Date</Typography>
        </Grid>
        <Grid item className={cx(classes.col, classes.colType)}>
          <Typography variant="caption">Alert type</Typography>
        </Grid>
        <Grid item className={cx(classes.col, classes.colDescription)}>
          <Typography variant="caption">Description</Typography>
        </Grid>
        <Grid item className={cx(classes.col, classes.colStatus)}>
          <Typography variant="caption">Status</Typography>
        </Grid>
        <Grid item className={cx(classes.col, classes.colUpdatedBy)}>
          <Typography variant="caption">Status updated by</Typography>
        </Grid>
        <Grid item className={cx(classes.col, classes.colUpdatedTime)}>
          <Typography variant="caption">Status updated time</Typography>
        </Grid>
        <Grid item className={cx(classes.col, classes.colActionBtn)} />
      </Grid>
      {isAlertsFetching ? (
        <DataEntityAlertsSkeleton length={5} />
      ) : (
        <Grid container>
          {alertsList.map(alert => (
            <DataEntityAlertItem
              alertStatusHandler={alertStatusHandler(
                alert.id,
                alert.status
              )}
              alert={alert}
            />
          ))}
        </Grid>
      )}
    </Grid>
  );
};
export default DataEntityAlerts;
