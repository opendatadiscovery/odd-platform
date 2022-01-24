import { Grid, Typography } from '@mui/material';
import React from 'react';
import { Alert } from 'generated-sources';
import AlertIcon from 'components/shared/Icons/AlertIcon';
import AppButton from 'components/shared/AppButton/AppButton';
import { SxProps } from '@mui/system';
import { Container } from './AlertBannerStyles';

interface AlertBannerProps {
  alert: Alert;
  resolveAlert: () => void;
  sx?: SxProps;
}

const AlertBanner: React.FC<AlertBannerProps> = ({
  alert,
  resolveAlert,
  sx,
}) => (
  <Container sx={sx}>
    <Grid container alignItems="center">
      <AlertIcon sx={{ mr: 1 }} />
      <Typography variant="body1">{alert.description}</Typography>
    </Grid>
    <AppButton size="medium" color="secondary" onClick={resolveAlert}>
      Resolve
    </AppButton>
  </Container>
);

export default AlertBanner;
