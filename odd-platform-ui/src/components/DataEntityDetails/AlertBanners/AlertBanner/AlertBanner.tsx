import { Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import React from 'react';
import { Alert } from 'generated-sources';
import AlertIcon from 'components/shared/Icons/AlertIcon';
import AppButton from 'components/shared/AppButton/AppButton';
import { styles, StylesType } from './AlertBannerStyles';

interface AlertBannerProps extends StylesType {
  alert: Alert;
  resolveAlert: () => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({
  classes,
  alert,
  resolveAlert,
}) => (
  <div className={classes.container}>
    <div className={classes.description}>
      <AlertIcon sx={{ mr: 1 }} />
      <Typography variant="body1">{alert.description}</Typography>
    </div>
    <div className={classes.actions}>
      <AppButton size="medium" color="secondary" onClick={resolveAlert}>
        Resolve
      </AppButton>
    </div>
  </div>
);

export default withStyles(styles)(AlertBanner);
