import React from 'react';
import { Grid, Typography, withStyles } from '@material-ui/core';
import { Alert } from 'generated-sources';
import cx from 'classnames';
import { format } from 'date-fns';
import StatusTypeItem from 'components/shared/StatusTypeItem/StatusTypeItem';
import { StylesType, styles } from './DataEntityAlertItemStyles';

interface DataEntityAlertItemProps extends StylesType {
  alert: Alert;
}

const DataEntityAlertItem: React.FC<DataEntityAlertItemProps> = ({
  classes,
  alert,
}) => (
  <Grid container className={classes.container}>
    <Grid item className={cx(classes.col, classes.colDate)}>
      <Typography variant="body1">
        {alert.createdAt &&
          format(alert.createdAt, 'dd MMM yyyy, HH:MM b')}
      </Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colType)}>
      <Typography variant="body1" title={alert.type} noWrap>
        {alert.type}
      </Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colDescription)}>
      <Typography variant="body1" title={alert.description} noWrap>
        {alert.description}
      </Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colStatus)}>
      <StatusTypeItem typeName={alert.status} />
    </Grid>
    <Grid item className={cx(classes.col, classes.colResolvedBy)}>
      <Typography variant="body1">{alert.statusUpdatedBy}</Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colResolvedTime)}>
      <Typography variant="body1">
        {alert.statusUpdatedAt &&
          format(alert.statusUpdatedAt, 'dd MMM yyyy, HH:MM b')}
      </Typography>
    </Grid>
  </Grid>
);

export default withStyles(styles)(DataEntityAlertItem);
