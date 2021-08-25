import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import cx from 'classnames';
import {
  styles,
  StylesType,
} from './OverviewDataQualityReportSkeletonStyles';

interface SkeletonProps extends StylesType {
  length?: number;
}

const OverviewDataQualityReportSkeleton: React.FC<SkeletonProps> = ({
  classes,
  length,
}) => {
  const randomSkeletonWidth = () => {
    const rand = 75 + Math.random() * 15;
    return Math.round(rand);
  };

  const skeleton = (key: number) => (
    <Grid key={key} container className={classes.container}>
      <Grid container justify="space-between" className={classes.skeleton}>
        <Grid item xs={8}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
        <Grid item xs={2}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
      </Grid>
      <Grid
        container
        justify="space-between"
        className={cx(classes.generalStats, classes.skeleton)}
      >
        <Grid item xs={4}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
        <Grid item xs={4}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
      </Grid>
      <Grid container className={classes.skeleton}>
        <Grid item xs={6}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
      </Grid>
      <Grid
        container
        className={cx(classes.statItem, classes.skeletonStatItem)}
      >
        <Grid item xs={6}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
      </Grid>
      <Grid
        container
        className={cx(classes.statItem, classes.skeletonStatItem)}
      >
        <Grid item xs={6}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
      </Grid>
      <Grid
        container
        className={cx(classes.statItem, classes.skeletonStatItem)}
      >
        <Grid item xs={6}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
      </Grid>
      <Grid
        container
        className={cx(classes.statItem, classes.skeletonStatItem)}
      >
        <Grid item xs={6}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
      </Grid>
      <Grid
        container
        className={cx(classes.statItem, classes.skeletonStatItem)}
      >
        <Grid item xs={6}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
      </Grid>
    </Grid>
  );

  return <>{[...Array(length)].map((_, id) => skeleton(id))}</>;
};

export default withStyles(styles)(OverviewDataQualityReportSkeleton);
