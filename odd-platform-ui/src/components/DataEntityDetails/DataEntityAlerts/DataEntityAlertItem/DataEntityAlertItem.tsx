import React from 'react';
import { Grid, MenuItem, Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { Alert } from 'generated-sources';
import cx from 'classnames';
import { format } from 'date-fns';
import lowerCase from 'lodash/lowerCase';
import AlertStatusItem from 'components/shared/AlertStatusItem/AlertStatusItem';
import KebabIcon from 'components/shared/Icons/KebabIcon';
import AppIconButton from 'components/shared/AppIconButton/AppIconButton';
import AppTooltip from 'components/shared/AppTooltip/AppTooltip';
import AppPopover from 'components/shared/AppPopover/AppPopover';
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
      <AppTooltip title={() => lowerCase(alert.type)}>
        <Typography variant="body1" title={alert.type} noWrap>
          {lowerCase(alert.type)}
        </Typography>
      </AppTooltip>
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
    <Grid
      item
      className={cx(classes.col, classes.colActionBtn, classes.optionsBtn)}
    >
      <AppPopover
        renderOpenBtn={({ onClick, ariaDescribedBy }) => (
          <AppIconButton
            ariaDescribedBy={ariaDescribedBy}
            size="medium"
            color="primaryLight"
            icon={<KebabIcon />}
            onClick={onClick}
          />
        )}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 100 }}
      >
        <MenuItem onClick={alertStatusHandler}>
          {alert.status === 'OPEN' ? 'Resolve' : 'Reopen'} alert
        </MenuItem>
      </AppPopover>
    </Grid>
  </Grid>
);

export default withStyles(styles)(DataEntityAlertItem);
