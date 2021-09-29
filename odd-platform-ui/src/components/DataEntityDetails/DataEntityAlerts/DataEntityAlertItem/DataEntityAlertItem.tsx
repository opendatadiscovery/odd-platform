import React from 'react';
import { Grid, MenuItem, Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { Alert } from 'generated-sources';
import cx from 'classnames';
import { format } from 'date-fns';
import { lowerCase } from 'lodash';
import AlertStatusItem from 'components/shared/AlertStatusItem/AlertStatusItem';
import AppButton from 'components/shared/AppButton/AppButton';
import KebabIcon from 'components/shared/Icons/KebabIcon';
import Tooltip from 'components/shared/Tooltip/Tooltip';
import { styles, StylesType } from './DataEntityAlertItemStyles';

interface DataEntityAlertItemProps extends StylesType {
  alert: Alert;
  alertStatusHandler: () => void;
}

const DataEntityAlertItem: React.FC<DataEntityAlertItemProps> = ({
  classes,
  alert,
  alertStatusHandler,
}) => (
  <Grid container className={classes.container}>
    <Grid item className={cx(classes.col, classes.colDate)}>
      <Typography variant="body1">
        {alert.createdAt && format(alert.createdAt, 'd MMM yyyy, HH:MM a')}
      </Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colType)}>
      <Typography variant="body1" title={alert.type} noWrap>
        {lowerCase(alert.type)}
      </Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colDescription)}>
      <Typography variant="body1" title={alert.description} noWrap>
        {alert.description}
      </Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colStatus)}>
      <AlertStatusItem typeName={alert.status} />
    </Grid>
    <Grid item className={cx(classes.col, classes.colUpdatedBy)}>
      <Typography variant="body1">
        {alert.statusUpdatedBy?.owner?.name ||
          alert.statusUpdatedBy?.identity.username}
      </Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colUpdatedTime)}>
      <Typography variant="body1">
        {alert.statusUpdatedAt &&
          format(alert.statusUpdatedAt, 'd MMM yyyy, HH:MM a')}
      </Typography>
    </Grid>
    <Grid item className={cx(classes.col, classes.colActionBtn)}>
      <Tooltip
        tooltipControl="byClick"
        tooltipContent={
          <MenuItem onClick={alertStatusHandler}>
            {alert.status === 'OPEN' ? 'Resolve' : 'Reopen'} alert
          </MenuItem>
        }
        type="light"
      >
        <AppButton
          className={classes.optionsBtn}
          size="medium"
          color="primaryLight"
          icon={<KebabIcon />}
        />
      </Tooltip>
    </Grid>
  </Grid>
);

export default withStyles(styles)(DataEntityAlertItem);
