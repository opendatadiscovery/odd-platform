import React from 'react';
import { LinearProgress, Fade } from '@material-ui/core';
import { StylesType } from './AppLoadingSpinnerStyles';

interface AppLoadingSpinnerProps extends StylesType {
  isLoading?: boolean;
}

const AppLoadingSpinner: React.FC<AppLoadingSpinnerProps> = ({
  classes,
  isLoading,
}) => (
  <div className={classes.root}>
    <Fade
      in={isLoading}
      timeout={{
        appear: 0,
        exit: 1500,
      }}
      unmountOnExit
    >
      <LinearProgress classes={classes} />
    </Fade>
  </div>
);

export default AppLoadingSpinner;
