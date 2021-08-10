import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import { styles, StylesType } from './DatasetTestReportSkeletonStyles';

interface SkeletonProps extends StylesType {
  width: string;
}

const DatasetTestReportSkeleton: React.FC<SkeletonProps> = ({
  classes,
  width,
}) => (
  <Grid container className={classes.container}>
    <Grid
      container
      className={classes.testReportSkeletonContainer}
      justify="space-between"
    >
      <Grid container item xs={6} className={classes.testSkeletons}>
        <Skeleton width={width} height="100%" />
        <Skeleton width={width} height="100%" />
        <Skeleton width={width} height="100%" />
        <Skeleton width={width} height="100%" />
        <Skeleton width={width} height="100%" />
        <Skeleton width={width} height="100%" />
      </Grid>
      <Grid container item xs={2} className={classes.testCountSkeleton}>
        <Skeleton width={width} height="100%" />
      </Grid>
    </Grid>
  </Grid>
);

export default withStyles(styles)(DatasetTestReportSkeleton);
