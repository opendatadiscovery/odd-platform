import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import { mainSkeletonHeight } from 'lib/constants';
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
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
        <Skeleton width={width} height={mainSkeletonHeight} />
      </Grid>
      <Grid container item xs={2} className={classes.testCountSkeleton}>
        <Skeleton width={width} height={mainSkeletonHeight} />
      </Grid>
    </Grid>
  </Grid>
);

export default withStyles(styles)(DatasetTestReportSkeleton);
