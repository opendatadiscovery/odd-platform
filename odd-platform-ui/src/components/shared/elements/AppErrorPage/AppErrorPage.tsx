import { Grid, Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import type { ErrorState } from 'redux/interfaces/loader';
import AppButton from 'components/shared/elements/AppButton/AppButton';
import { toolbarHeight } from 'lib/constants';

interface AppErrorPageProps {
  showError: boolean;
  error?: ErrorState;
  offsetTop?: number;
}

const AppErrorPage: React.FC<AppErrorPageProps> = ({
  showError,
  error,
  offsetTop = 32,
}) =>
  showError ? (
    <Grid container height={`calc(100vh - ${toolbarHeight}px - ${offsetTop}px)`}>
      <Grid container alignItems='center' justifyContent='center'>
        <Grid item>
          <Typography variant='errorCode' sx={{ mr: 4 }}>
            {error?.status}
          </Typography>
        </Grid>
        <Grid item alignItems='center'>
          <Typography variant='h1'>{error?.statusText || 'Unknown Error'}</Typography>
          <Grid container alignItems='center'>
            <Typography variant='body1'>Return to the</Typography>
            <AppButton size='small' color='tertiary'>
              <Link to='/'>Home Page</Link>
            </AppButton>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  ) : null;

export default AppErrorPage;
