import { Grid, Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import React from 'react';
import { Link } from 'react-router-dom';
import { ErrorState, FetchStatus } from 'redux/interfaces/loader';
import AppButton from 'components/shared/AppButton/AppButton';
import { StylesType, styles } from './AppErrorPageStyles';

interface AppErrorPageProps extends StylesType {
  fetchStatus: FetchStatus;
  error?: ErrorState;
}

const AppErrorPage: React.FC<AppErrorPageProps> = ({
  classes,
  fetchStatus,
  error,
}) =>
  fetchStatus === 'errorFetching' ? (
    <div className={classes.container}>
      <Grid container alignItems="center" justifyContent="center">
        <Grid item>
          <Typography variant="h1" className={classes.errorCode}>
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
    </div>
  ) : null;

export default withStyles(styles)(AppErrorPage);
