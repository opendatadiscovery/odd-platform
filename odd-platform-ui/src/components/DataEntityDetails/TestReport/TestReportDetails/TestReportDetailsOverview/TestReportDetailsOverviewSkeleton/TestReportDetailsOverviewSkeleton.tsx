import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import {
  styles,
  StylesType,
} from 'components/DataEntityDetails/TestReport/TestReportDetails/TestReportDetailsOverview/TestReportDetailsOverviewStyles';

interface SkeletonProps extends StylesType {
  length?: number;
}

const TestReportDetailsOverviewSkeleton: React.FC<SkeletonProps> = ({
  classes,
  length,
}) => {
  const randomSkeletonWidth = () => {
    const rand = 75 + Math.random() * 15;
    return Math.round(rand);
  };

  const skeleton = (key: number) => (
    <Grid className={classes.container}>
      <Grid className={classes.statContainer}>
        <Grid container className={classes.statItem}>
          <Grid item xs={4}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
          <Grid item xs={8}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
        </Grid>
        <Grid container className={classes.statItem}>
          <Grid item xs={4}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
          <Grid item xs={8}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
        </Grid>
        <Grid container className={classes.statItem}>
          <Grid item xs={4}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
          <Grid item xs={8}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
        </Grid>
      </Grid>
      <Grid className={classes.paramContainer}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        <Grid key={key} container>
          <Grid item xs={4} className={classes.paramName}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
          <Grid item xs={8}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
        </Grid>
      </Grid>
      <Grid className={classes.paramContainer}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        <Grid container>
          <Grid item xs={4}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
        </Grid>
      </Grid>
      <Grid className={classes.paramContainer}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        <Grid container>
          <Grid item xs={12}>
            <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  return <>{[...Array(length)].map((_, id) => skeleton(id))}</>;
};

export default withStyles(styles)(TestReportDetailsOverviewSkeleton);
