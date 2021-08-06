import React from 'react';
import Skeleton from '@material-ui/lab/Skeleton';
import { Grid, withStyles } from '@material-ui/core';
import {
  styles,
  StylesType,
} from 'components/DataEntityDetails/TestReport/TestReportItem/TestReportItemSkeleton/TestReportItemSkeletonStyles';

interface SkeletonProps extends StylesType {
  length?: number;
}

const TestReportItemSkeleton: React.FC<SkeletonProps> = ({
  classes,
  length,
}) => {
  const randomSkeletonWidth = () => {
    const rand = 75 + Math.random() * 15;
    return Math.round(rand);
  };

  const skeleton = (key: number) => (
    <Grid key={key} container className={classes.container}>
      <Grid container item xs={4} className={classes.item}>
        <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
      </Grid>
      <Grid container justify="space-between" className={classes.item}>
        <Grid item xs={2}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
        <Grid item xs={4}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
        <Grid item xs={2}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
      </Grid>
      <Grid container justify="space-between" className={classes.item}>
        <Grid item xs={2}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
        <Grid item xs={4}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
        <Grid item xs={2}>
          <Skeleton width={`${randomSkeletonWidth()}%`} height="100%" />
        </Grid>
      </Grid>
    </Grid>
  );

  return <>{[...Array(length)].map((_, id) => skeleton(id))}</>;
};

export default withStyles(styles)(TestReportItemSkeleton);
