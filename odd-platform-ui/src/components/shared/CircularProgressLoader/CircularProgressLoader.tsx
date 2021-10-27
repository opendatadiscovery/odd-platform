import React from 'react';
import { CircularProgress, Grid, Typography } from '@mui/material';
import withStyles from '@mui/styles/withStyles';
import { styles, StylesType } from './CircularProgressLoaderStyles';

interface CircularProgressLoaderProps extends StylesType {
  text: string;
}

const CircularProgressLoader: React.FC<CircularProgressLoaderProps> = ({
  classes,
  text,
}) => (
  <div>
    <Grid container className={classes.container}>
      <Grid container item xs={2} className={classes.spinnerContainer}>
        <CircularProgress size={16} className={classes.circularProgress} />
      </Grid>
      <Grid item container xs={10} className={classes.textContainer}>
        <Typography variant="body2" color="textSecondary">
          {text}
        </Typography>
      </Grid>
    </Grid>
  </div>
);

export default withStyles(styles)(CircularProgressLoader);
