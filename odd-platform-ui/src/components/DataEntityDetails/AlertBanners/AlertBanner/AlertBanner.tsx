import { Typography, withStyles } from '@material-ui/core';
import React from 'react';
import { Alert } from 'generated-sources';
import AlertIcon from 'components/shared/Icons/AlertIcon';
import AppButton from 'components/shared/AppButton/AppButton';
import { styles, StylesType } from './AlertBannerStyles';

interface AlertBannerProps extends StylesType {
  alert: Alert;
}

const AlertBanner: React.FC<AlertBannerProps> = ({ classes, alert }) => (
  <div className={classes.container}>
    <div className={classes.description}>
      <AlertIcon className={classes.icon} />
      <Typography variant="body1">{alert.description}</Typography>
    </div>
    <div className={classes.actions}>
      <AppButton size="medium" color="secondary">
        Close
      </AppButton>
    </div>
  </div>
);

export default withStyles(styles)(AlertBanner);
