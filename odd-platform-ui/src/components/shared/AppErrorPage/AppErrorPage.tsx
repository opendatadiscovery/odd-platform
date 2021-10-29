import { Grid, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { ErrorState, FetchStatus } from 'redux/interfaces/loader';
import AppButton from 'components/shared/AppButton/AppButton';

interface AppErrorPageProps {
  fetchStatus: FetchStatus;
  error?: ErrorState;
}

const AppErrorPage: React.FC<AppErrorPageProps> = ({
  fetchStatus,
  error,
}) =>
  fetchStatus === 'errorFetching' ? (
    <Grid sx={{ mt: 10 }}>
      <Grid container alignItems="center" justifyContent="center">
        <Grid item>
          <Typography variant="errorCode" sx={{ mr: 4 }}>
            {error?.statusCode}
          </Typography>
        </Grid>
        <Grid item alignItems="center">
          <Typography variant="h1">
            {error?.statusText || 'Unknown Error'}
          </Typography>
          <Grid container alignItems="center">
            <Typography variant="body1">Return to the</Typography>
            <AppButton size="small" color="tertiary">
              <Link to="/">Home Page</Link>
            </AppButton>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  ) : null;

export default AppErrorPage;
