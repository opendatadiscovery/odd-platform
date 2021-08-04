import React from 'react';
import { Grid, Typography } from '@material-ui/core';
import { Alert } from 'generated-sources';
import cx from 'classnames';
import DataEntityAlertItem from 'components/DataEntityDetails/DataEntityAlerts/DataEntityAlertItem/DataEntityAlertItem';
import { StylesType } from './DataEntityAlertsStyles';

interface DataEntityAlertsProps extends StylesType {
  alertsList: Alert[];
}

const DataEntityAlerts: React.FC<DataEntityAlertsProps> = ({
  classes,
  alertsList,
}) => (
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
      <Grid item className={cx(classes.col, classes.colResolvedBy)}>
        <Typography variant="caption">Resolved by</Typography>
      </Grid>
      <Grid item className={cx(classes.col, classes.colResolvedTime)}>
        <Typography variant="caption">Resolved time</Typography>
      </Grid>
    </Grid>
    <Grid container>
      {alertsList.map(alert => (
        <DataEntityAlertItem alert={alert} />
      ))}
    </Grid>
  </Grid>
);
export default DataEntityAlerts;
