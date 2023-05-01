import { Grid, Typography } from '@mui/material';
import React from 'react';
import type { ErrorState } from 'redux/interfaces/loader';
import { toolbarHeight } from 'lib/constants';
import Button from 'components/shared/elements/Button/Button';

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
            <Button text='Home Page' to='/' buttonType='tertiary-m' />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  ) : null;

export default AppErrorPage;
