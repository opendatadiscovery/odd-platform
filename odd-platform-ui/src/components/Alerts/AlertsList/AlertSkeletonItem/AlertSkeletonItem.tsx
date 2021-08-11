import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import { mainSkeletonHeight } from 'lib/constants';
import { styles, StylesType } from './AlertSkeletonItemStyles';

interface SkeletonProps extends StylesType {
  width: string;
}

const AlertSkeletonItem: React.FC<SkeletonProps> = ({
  classes,
  width,
}) => (
  <Grid container className={classes.container} wrap="nowrap">
    <Grid item xs={3}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
    <Grid item xs={7}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
    <Grid item xs={2}>
      <Skeleton width={width} height={mainSkeletonHeight} />
    </Grid>
  </Grid>
);
export default withStyles(styles)(AlertSkeletonItem);
